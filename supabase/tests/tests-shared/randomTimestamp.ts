export function randomTimestamp() {
  return new Date(Math.floor(Math.random() * Date.now())).toISOString();
}
