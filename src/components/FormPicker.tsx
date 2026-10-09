import { artworks } from "../data/artworks";

export function FormPicker({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="form-picker" role="group" aria-label="Sculptural form">
      {artworks.map((artwork, index) => (
        <button
          key={artwork.number}
          aria-pressed={selected === index}
          onClick={() => onSelect(index)}
        >
          {artwork.title}
        </button>
      ))}
    </div>
  );
}
