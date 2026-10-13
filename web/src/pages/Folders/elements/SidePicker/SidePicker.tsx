import './SidePicker.css';

const SIDES = ['white', 'black'] as const;

export function SidePicker() {
  return (
    <fieldset className="side-picker">
      <legend className="side-picker-legend">Side</legend>
      <div className="side-picker-options">
        {SIDES.map((side) => (
          <label key={side} className="side-picker-option">
            <input
              className="side-picker-input"
              type="radio"
              name="side"
              value={side}
              defaultChecked={side === SIDES[0]}
            />
            <span className="side-picker-name">{side}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
