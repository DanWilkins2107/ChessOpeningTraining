export function fakeRepo(
  tracked: string[],
  readFileSync: (file: string) => string,
) {
  const execFileSync = () =>
    Buffer.from(tracked.map((file) => `${file}\0`).join(''));

  return {
    childProcess: { execFileSync, default: { execFileSync } },
    fs: { readFileSync, default: { readFileSync } },
  };
}
