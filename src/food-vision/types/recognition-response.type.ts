import type { FoodRecognitionPolicy } from '../dto/recognize-food.dto';

export interface RecognitionCandidate {
  class_id: number;
  label: string;
  confidence: number;
  bbox_xyxy: [number, number, number, number];
}

export type RecognitionStatus = 'accepted' | 'uncertain' | 'no_detection';
export type RecognitionReason =
  | 'accepted'
  | 'no_candidate'
  | 'outside_catalogue'
  | 'below_threshold'
  | 'no_bright_candidate'
  | 'view_label_disagreement'
  | 'view_box_disagreement';

export interface RecognitionOutcome {
  policy: FoodRecognitionPolicy;
  status: RecognitionStatus;
  reason: RecognitionReason;
  suggestion: RecognitionCandidate | null;
}

export interface RecognitionMetadata {
  schema_version: '1.0';
  request_id: string;
  model_version: string;
  model_sha256: string;
  policy_version: string;
  catalogue_version: string;
  image: {
    width: number;
    height: number;
    coordinate_space: 'decoded_exif_oriented_image';
  };
  candidate: RecognitionCandidate | null;
  user_confirmation_required: true;
  original_inference_passes: 1;
  brightened_inference_passes: 0 | 1;
  processing_ms: number;
}

export interface FoodRecognitionResponse extends RecognitionMetadata, RecognitionOutcome {}
export interface FoodComparisonResponse extends RecognitionMetadata {
  results: RecognitionOutcome[];
}

const policies = ['P0', 'P1', 'P2'];
const uncertaintyReasons = [
  'outside_catalogue',
  'below_threshold',
  'no_bright_candidate',
  'view_label_disagreement',
  'view_box_disagreement',
];
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const policy = (value: unknown): value is FoodRecognitionPolicy =>
  typeof value === 'string' && policies.includes(value);

function candidate(value: unknown): value is RecognitionCandidate {
  if (!record(value)) return false;
  return (
    Number.isInteger(value.class_id) &&
    (value.class_id as number) >= 0 &&
    (value.class_id as number) <= 91 &&
    text(value.label) &&
    finite(value.confidence) &&
    value.confidence >= 0 &&
    value.confidence <= 1 &&
    Array.isArray(value.bbox_xyxy) &&
    value.bbox_xyxy.length === 4 &&
    value.bbox_xyxy.every(finite)
  );
}

function sameCandidate(left: RecognitionCandidate, right: RecognitionCandidate): boolean {
  return (
    left.class_id === right.class_id &&
    left.label === right.label &&
    left.confidence === right.confidence &&
    left.bbox_xyxy.every((coordinate, index) => coordinate === right.bbox_xyxy[index])
  );
}

function metadata(value: unknown): value is RecognitionMetadata {
  if (!record(value) || !record(value.image)) return false;
  // Prevent an upstream payload from bypassing the backend's response envelope.
  if ('statusCode' in value || 'message' in value || 'error' in value) return false;
  return (
    value.schema_version === '1.0' &&
    text(value.request_id) &&
    /^[A-Za-z0-9._:-]{1,64}$/.test(value.request_id) &&
    text(value.model_version) &&
    typeof value.model_sha256 === 'string' &&
    /^[a-f0-9]{64}$/.test(value.model_sha256) &&
    text(value.policy_version) &&
    text(value.catalogue_version) &&
    Number.isInteger(value.image.width) &&
    (value.image.width as number) > 0 &&
    Number.isInteger(value.image.height) &&
    (value.image.height as number) > 0 &&
    value.image.coordinate_space === 'decoded_exif_oriented_image' &&
    (value.candidate === null || candidate(value.candidate)) &&
    value.user_confirmation_required === true &&
    value.original_inference_passes === 1 &&
    [0, 1].includes(value.brightened_inference_passes as number) &&
    finite(value.processing_ms) &&
    value.processing_ms >= 0
  );
}

function outcome(value: unknown, top: RecognitionCandidate | null): value is RecognitionOutcome {
  if (!record(value) || !policy(value.policy)) return false;
  if (value.status === 'accepted') {
    return (
      value.reason === 'accepted' &&
      top !== null &&
      candidate(value.suggestion) &&
      sameCandidate(value.suggestion, top)
    );
  }
  if (value.suggestion !== null) return false;
  if (value.status === 'no_detection') return value.reason === 'no_candidate';
  return (
    value.status === 'uncertain' &&
    typeof value.reason === 'string' &&
    uncertaintyReasons.includes(value.reason)
  );
}

/** Validate the wire contract, without recalculating the AI's policy decision. */
export function isFoodRecognitionResponse(value: unknown): value is FoodRecognitionResponse {
  return metadata(value) && outcome(value, value.candidate);
}

export function isFoodComparisonResponse(value: unknown): value is FoodComparisonResponse {
  if (
    !metadata(value) ||
    !record(value) ||
    !Array.isArray(value.results) ||
    value.results.length !== 3
  )
    return false;
  if (!value.results.every((result) => outcome(result, value.candidate))) return false;
  return new Set(value.results.map((result: RecognitionOutcome) => result.policy)).size === 3;
}
