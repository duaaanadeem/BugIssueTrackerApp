"use client";

export default function ChipGroup({
  items = [],
  options = [],
  value,
  onChange,
}) {
  const list = items.length > 0 ? items : options;

  return (
    <div className="chip-row">
      {list.map((item, index) => (
        <button
          key={`${item}-${index}`}
          type="button"
          className={`chip ${value === item ? "chip-active" : ""}`}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}