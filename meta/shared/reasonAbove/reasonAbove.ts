const COMMENT = /^\s*\/\/\s?(.*)$/;

export function reasonAbove(
  lines: string[],
  index: number,
  marker: string,
): boolean {
  let topmost: string | null = null;

  for (let above = index - 1; above >= 0; above -= 1) {
    const comment = COMMENT.exec(lines[above]);
    if (comment === null) break;
    topmost = comment[1];
  }

  return (
    topmost !== null && new RegExp(String.raw`^${marker}: \S`).test(topmost)
  );
}
