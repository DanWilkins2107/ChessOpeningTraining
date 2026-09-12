import './page.css';

const colours = [
  { token: '--surface-page', chip: 'chip-surface-page' },
  { token: '--surface-raised', chip: 'chip-surface-raised' },
  { token: '--border', chip: 'chip-border' },
  { token: '--ink', chip: 'chip-ink' },
  { token: '--ink-muted', chip: 'chip-ink-muted' },
  { token: '--accent', chip: 'chip-accent' },
  { token: '--accent-hover', chip: 'chip-accent-hover' },
];

const sizes = [
  { token: '--text-xl', line: 'line-xl' },
  { token: '--text-lg', line: 'line-lg' },
  { token: '--text-base', line: 'line-base' },
  { token: '--text-sm', line: 'line-sm' },
];

const radii = [
  { token: '--radius-sm', box: 'box-radius-sm' },
  { token: '--radius-md', box: 'box-radius-md' },
  { token: '--radius-pill', box: 'box-radius-pill' },
];

const gaps = [
  { token: '--gap-sm', row: 'row-gap-sm' },
  { token: '--gap-md', row: 'row-gap-md' },
  { token: '--gap-lg', row: 'row-gap-lg' },
];

export function Theme() {
  return (
    <div className="theme">
      <h1 className="theme-title">Design tokens</h1>

      <section className="section">
        <h2 className="section-heading">Colour</h2>
        <ul className="swatches">
          {colours.map(({ token, chip }) => (
            <li className="swatch" key={token}>
              <span className={`chip ${chip}`} />
              <code className="token">{token}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-heading">Surfaces</h2>
        <div className="card">
          <p className="card-title">A raised card</p>
          <p className="card-body">
            Ink on a raised surface, lifted off the page with a border and the
            shadow token.
          </p>
          <p className="card-muted">Muted ink for secondary copy.</p>
          <button className="button" type="button">
            Accent button
          </button>
        </div>
      </section>

      <section className="section">
        <h2 className="section-heading">Type</h2>
        {sizes.map(({ token, line }) => (
          <p className={`line ${line}`} key={token}>
            Sicilian Defence <code className="token">{token}</code>
          </p>
        ))}
      </section>

      <section className="section">
        <h2 className="section-heading">Radius</h2>
        <ul className="boxes">
          {radii.map(({ token, box }) => (
            <li className="box-item" key={token}>
              <span className={`box ${box}`} />
              <code className="token">{token}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-heading">Gap</h2>
        {gaps.map(({ token, row }) => (
          <div className="gap-row" key={token}>
            <code className="token">{token}</code>
            <div className={`blocks ${row}`}>
              <span className="block" />
              <span className="block" />
              <span className="block" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
