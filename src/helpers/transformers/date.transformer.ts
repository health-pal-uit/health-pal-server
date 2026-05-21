import { Transform } from 'class-transformer';

export function TransformToISODate() {
  return Transform(({ value }) => {
    // If it's already ISO 8601 format with datetime (contains 'T'), return as-is
    if (value.includes('T')) {
      return value;
    }

    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  });
}
