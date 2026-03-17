export function extractHashtags(text: string): string {
  const regex = /\B#\w+/g;
  const matches = text.match(regex);
  return matches ? matches.join(',') : '';
}
