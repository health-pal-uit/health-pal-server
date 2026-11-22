// HealthPal direct terminal test. Uses the same five photos and contract checks.
// Standard k6 terminal summary: hp_* metrics exclude warm-up.
// Optional HP_LOG_SAMPLES=1 emits redacted request IDs for backend timing joins.
import http from 'k6/http';
import exec from 'k6/execution';
import crypto from 'k6/crypto';
import { check, fail, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// SIMPLE DIRECT RUN: k6 run test.js
// Change only these settings when comparing the agreed profiles.
const SETTINGS = {
  policy: 'P1',
  users: 1,
  backend: 'http://127.0.0.1:3001',
};

// The protected API needs a token. This optional local file is Git-ignored.
function privateToken() {
  try {
    const text = open('./auth.local.env');
    const match = /^HP_TOKEN=(.*)$/m.exec(text);
    return match ? match[1] : '';
  } catch (_) {
    return '';
  }
}
const token = (__ENV.HP_TOKEN || privateToken())
  .trim()
  .replace(/^['"]|['"]$/g, '')
  .replace(/^Bearer\s+/i, '');
if (!token)
  throw new Error(
    'Set HP_TOKEN, or copy auth.local.env.example to auth.local.env and fill a fresh User access token.',
  );
const policy = __ENV.HP_POLICY || SETTINGS.policy;
const vus = Number(__ENV.HP_VUS || SETTINGS.users);
const iterations = Number(__ENV.HP_ITERATIONS || 60);
const think = Number(__ENV.HP_THINK_SECONDS || 0.25);
const timeout = '15s';
const endpoint = 'recognize';
const base = (__ENV.HP_BASE_URL || SETTINGS.backend).replace(/\/$/, '');
const url = `${base}/food-vision/recognize`;
const runId = __ENV.HP_RUN_ID || `manual-${policy.toLowerCase()}`;
const warmup = __ENV.HP_WARMUP !== '0';
const allowFixtures = __ENV.HP_ALLOW_FIXTURES === '1';
const logSamples = __ENV.HP_LOG_SAMPLES === '1';
const workload = JSON.parse(open('./workload.json'));
const images = workload.images.map((x) => {
  const bytes = open(`./${x.relative_path}`, 'b');
  if (bytes.byteLength !== x.bytes || crypto.sha256(bytes, 'hex') !== x.sha256) {
    throw new Error(`Fixture checksum/size mismatch: ${x.id}`);
  }
  return { ...x, bytes };
});
const release = workload.release;
const targets = release.target_class_ids;
if (!['P0', 'P1', 'P2'].includes(policy) || ![1, 2].includes(vus))
  throw new Error('Choose P0/P1/P2 and 1 or 2 users.');
if (!workload.matrix.some((x) => x.policy === policy && x.vus === vus))
  throw new Error('Agreed profiles: P0/1, P1/1, P2/1, P1/2.');
if (
  !Number.isInteger(iterations) ||
  iterations < 1 ||
  iterations > 300 ||
  iterations % images.length !== 0
)
  throw new Error('Iterations must be a multiple of five, up to 300.');
if (!Number.isFinite(think) || think < 0 || think > 5)
  throw new Error('HP_THINK_SECONDS must be 0-5.');
if (!/^[A-Za-z0-9._-]{1,35}$/.test(runId))
  throw new Error('HP_RUN_ID must have 1-35 safe characters.');

const requests = new Counter('hp_requests');
const httpFailures = new Rate('hp_http_failure');
const contractFailures = new Rate('hp_contract_failure');
const roundTrip = new Trend('hp_round_trip_ms', true);
const httpDuration = new Trend('hp_http_duration_ms', true);
const aiProcessing = new Trend('hp_ai_processing_ms', true);
const outcomes = new Counter('hp_outcomes');
const brightPasses = new Counter('hp_brightened_passes');

export const options = {
  scenarios: {
    recognition: {
      executor: 'shared-iterations',
      vus,
      iterations,
      maxDuration: __ENV.HP_MAX_DURATION || '5m',
      gracefulStop: '20s',
    },
  },
  setupTimeout: '90s',
  summaryTrendStats: ['min', 'med', 'p(95)', 'max'],
  tags: { run_id: runId, policy, endpoint, evidence: allowFixtures ? 'fixture-only' : 'live' },
  thresholds: {
    hp_http_failure: [{ threshold: 'rate==0', abortOnFail: true, delayAbortEval: '5s' }],
    hp_contract_failure: [{ threshold: 'rate==0', abortOnFail: true, delayAbortEval: '5s' }],
  },
};

function number(x) {
  return typeof x === 'number' && Number.isFinite(x);
}
function header(response, name) {
  const key = Object.keys(response.headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? response.headers[key] : null;
}
function food(c, image) {
  return Boolean(
    c &&
      Number.isInteger(c.class_id) &&
      c.class_id >= 0 &&
      c.class_id < 92 &&
      typeof c.label === 'string' &&
      c.label.length > 0 &&
      number(c.confidence) &&
      c.confidence >= release.candidate_floor &&
      c.confidence <= 1 &&
      Array.isArray(c.bbox_xyxy) &&
      c.bbox_xyxy.length === 4 &&
      c.bbox_xyxy.every(number) &&
      c.bbox_xyxy[0] >= 0 &&
      c.bbox_xyxy[1] >= 0 &&
      c.bbox_xyxy[2] > c.bbox_xyxy[0] &&
      c.bbox_xyxy[3] > c.bbox_xyxy[1] &&
      c.bbox_xyxy[2] <= image.width + 0.01 &&
      c.bbox_xyxy[3] <= image.height + 0.01,
  );
}
function sameFood(a, b) {
  return Boolean(
    a &&
      b &&
      a.class_id === b.class_id &&
      a.label === b.label &&
      a.confidence === b.confidence &&
      Array.isArray(a.bbox_xyxy) &&
      a.bbox_xyxy.length === 4 &&
      a.bbox_xyxy.every((v, i) => v === b.bbox_xyxy[i]),
  );
}
function outcome(x, data) {
  if (!x || !['P0', 'P1', 'P2'].includes(x.policy)) return false;
  if (x.status === 'no_detection')
    return x.reason === 'no_candidate' && data.candidate === null && x.suggestion === null;
  if (!food(data.candidate, data.image)) return false;
  if (x.status === 'accepted')
    return (
      x.reason === 'accepted' &&
      targets.includes(data.candidate.class_id) &&
      (x.policy === 'P0' || data.candidate.confidence >= release.confidence_threshold) &&
      sameFood(x.suggestion, data.candidate)
    );
  if (x.status !== 'uncertain' || x.suggestion !== null) return false;
  if (x.reason === 'outside_catalogue') return !targets.includes(data.candidate.class_id);
  if (x.reason === 'below_threshold')
    return (
      x.policy !== 'P0' &&
      targets.includes(data.candidate.class_id) &&
      data.candidate.confidence < release.confidence_threshold
    );
  return (
    x.policy === 'P2' &&
    targets.includes(data.candidate.class_id) &&
    data.candidate.confidence >= release.confidence_threshold &&
    ['no_bright_candidate', 'view_label_disagreement', 'view_box_disagreement'].includes(x.reason)
  );
}
function validate(response, body, requestId) {
  const d = body && body.data;
  if (!allowFixtures && header(response, 'X-HealthPal-Fixture')) return false;
  if (
    !(
      response.status === 200 &&
      body &&
      body.statusCode === 200 &&
      d &&
      d.schema_version === '1.0' &&
      d.request_id === requestId &&
      header(response, 'X-Request-ID') === requestId &&
      d.model_version === release.model_version &&
      d.model_sha256 === release.model_sha256 &&
      d.policy_version === release.policy_version &&
      d.catalogue_version === release.catalogue_version &&
      d.user_confirmation_required === true &&
      d.original_inference_passes === 1 &&
      d.image &&
      Number.isInteger(d.image.width) &&
      Number.isInteger(d.image.height) &&
      d.image.width > 0 &&
      d.image.height > 0 &&
      d.image.coordinate_space === 'decoded_exif_oriented_image' &&
      (d.candidate === null || food(d.candidate, d.image)) &&
      number(d.processing_ms) &&
      d.processing_ms >= 0
    )
  )
    return false;
  const passesP1 =
    d.candidate !== null &&
    targets.includes(d.candidate.class_id) &&
    d.candidate.confidence >= release.confidence_threshold;
  const expectedBright = (endpoint === 'compare' || policy === 'P2') && passesP1 ? 1 : 0;
  if (d.brightened_inference_passes !== expectedBright) return false;
  if (endpoint === 'recognize') return d.policy === policy && outcome(d, d);
  return (
    Array.isArray(d.results) &&
    d.results.length === 3 &&
    ['P0', 'P1', 'P2'].every((p) => d.results.filter((x) => x.policy === p).length === 1) &&
    d.results.every((x) => outcome(x, d))
  );
}
function send(image, requestId, phase) {
  const form = { file: http.file(image.bytes, image.filename, image.mime || 'image/jpeg') };
  if (endpoint === 'recognize') form.policy = policy;
  const started = Date.now();
  const response = http.post(url, form, {
    headers: { Authorization: `Bearer ${token}`, 'X-Request-ID': requestId },
    timeout,
    redirects: 0,
    responseCallback: http.expectedStatuses(200),
    tags: { name: `POST /food-vision/${endpoint}`, phase, policy, image_id: image.id },
  });
  const ended = Date.now();
  let body = null;
  try {
    body = response.json();
  } catch (_) {
    /* Keep failed sample, never print raw body/token. */
  }
  return { response, body, valid: validate(response, body, requestId), started, ended };
}

export function setup() {
  if (!warmup) return;
  for (let i = 0; i < images.length; i++) {
    const result = send(images[i], `hp-${runId}-w-${i}-${Date.now()}`, 'warmup');
    if (!result.valid)
      fail(
        `Warm-up failed (HTTP ${result.response.status}, image ${images[i].id}): check services, token and frozen release.`,
      );
  }
}
export default function () {
  const index = exec.scenario.iterationInTest;
  const image = images[index % images.length];
  const requestId = `hp-${runId}-${__VU}-${index}-${Date.now()}`;
  const { response, body, valid, started, ended } = send(image, requestId, 'measured');
  const d = body && body.data;
  const tags = { policy, image_id: image.id, endpoint };
  requests.add(1, tags);
  httpFailures.add(response.status !== 200, tags);
  contractFailures.add(!valid, tags);
  roundTrip.add(ended - started, tags);
  httpDuration.add(response.timings.duration, tags);
  if (valid) {
    aiProcessing.add(d.processing_ms, tags);
    brightPasses.add(d.brightened_inference_passes, tags);
    (endpoint === 'compare' ? d.results : [d]).forEach((x) =>
      outcomes.add(1, { ...tags, result_policy: x.policy, outcome: x.status, reason: x.reason }),
    );
  }
  check(
    response,
    {
      'measured HTTP 200': (r) => r.status === 200,
      'measured schema/release/policy contract': () => valid,
    },
    tags,
  );
  if (logSamples)
    console.log(
      `HP_SAMPLE ${JSON.stringify({
        run_id: runId,
        request_id: requestId,
        image_id: image.id,
        policy,
        vus,
        http_status: response.status,
        contract_ok: valid,
        fixture_only: allowFixtures,
        round_trip_ms: ended - started,
        http_duration_ms: response.timings.duration,
        processing_ms: valid ? d.processing_ms : null,
        brightened_passes: valid ? d.brightened_inference_passes : null,
        response_status: valid ? d.status : null,
        response_reason: valid ? d.reason : null,
      })}`,
    );
  if (think) sleep(think);
}
