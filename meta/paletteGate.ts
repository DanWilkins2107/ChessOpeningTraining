import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SCANNED = /\.(tsx?|css)$/;

// The one file colour literals belong in; move it and this must move with it.
const TOKENS = 'src/theme.css';

const NAMED_COLOURS =
  'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'.split(
    ' ',
  );

const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![0-9a-f])/gi;
const COLOUR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([^)]*\)?/gi;
const NAMED = new RegExp(
  `(?<![\\w-])(?:${NAMED_COLOURS.join('|')})(?![\\w-])`,
  'gi',
);

const repoRoot = path.join(import.meta.dirname, '..');

export function colourLiteralsIn(file: string, source: string): string[] {
  const isStylesheet = file.endsWith('.css');
  return source
    .split(/\r?\n/)
    .flatMap((line) => [
      ...(line.match(HEX) ?? []),
      ...(line.match(COLOUR_FUNCTION) ?? []),
      ...(isStylesheet ? (valueSide(line).match(NAMED) ?? []) : []),
    ]);
}

export function strayColourLiterals(): string[] {
  return scannedFiles().flatMap((file) =>
    colourLiteralsIn(file, readTextFile(file)).map(
      (literal) => `${file}: ${literal.trim()}`,
    ),
  );
}

function valueSide(line: string): string {
  const colon = line.indexOf(':');
  return colon === -1 ? '' : line.slice(colon + 1);
}

function scannedFiles(): string[] {
  return execFileSync('git', ['ls-files', '-z', 'src'], { cwd: repoRoot })
    .toString('utf8')
    .split('\0')
    .filter((file) => SCANNED.test(file) && file !== TOKENS);
}

function readTextFile(file: string): string {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}
