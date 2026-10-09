import { artworks } from "../data/artworks";
import { Arrow } from "./Arrow";

function StudyMark({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 70 70"
      className={`study-mark mark-${index}`}
      fill="none"
      aria-hidden="true"
    >
      {index === 0 ? (
        <>
          <ellipse
            cx="35"
            cy="35"
            rx="14"
            ry="27"
            transform="rotate(35 35 35)"
          />
          <ellipse
            cx="35"
            cy="35"
            rx="14"
            ry="27"
            transform="rotate(-35 35 35)"
          />
        </>
      ) : index === 1 ? (
        <path d="M35 9C43 9 44 18 52 21S63 37 55 45 47 62 35 60 23 56 15 46 7 27 18 22 26 9 35 9Z" />
      ) : (
        <>
          {[0, 1, 2, 3].map((i) => (
            <ellipse
              key={i}
              cx="35"
              cy={20 + i * 10}
              rx="23"
              ry="9"
              transform={`rotate(-15 35 ${20 + i * 10})`}
            />
          ))}
        </>
      )}
    </svg>
  );
}

export function Exhibition({
  selected,
  onSelect,
  onInspect,
  available,
}: {
  selected: number;
  onSelect: (index: number) => void;
  onInspect: () => void;
  available: boolean;
}) {
  const active = artworks[selected];
  return (
    <section
      id="experiments"
      className="exhibition"
      aria-labelledby="exhibition-title"
    >
      <div className="section-top">
        <span>
          <span className="live-dot" /> The experiment archive
        </span>
        <span>Three studies. No final answers.</span>
      </div>
      <div className="exhibition-heading">
        <h2 id="exhibition-title">
          Beautiful
          <br />
          exceptions.
        </h2>
        <p>
          Some ideas don’t fit in a frame.
          <br />
          These are a few of ours.
        </p>
      </div>
      <div className="exhibition-layout">
        <figure
          className="artwork-stage"
          aria-label={`${active.title}: ${active.description}`}
        >
          <span className="stage-corner corner-tl" />
          <span className="stage-corner corner-br" />
          <figcaption className="stage-caption">
            <span>{active.detail}</span>
            <button onClick={onInspect} disabled={!available}>
              Inspect artwork <span className="inspect-icon">+</span>
            </button>
          </figcaption>
        </figure>
        <div className="artwork-list" aria-label="Choose an artwork">
          {artworks.map((artwork, index) => (
            <button
              key={artwork.number}
              className="artwork-row"
              aria-pressed={selected === index}
              onClick={() => onSelect(index)}
              aria-label={`Show ${artwork.title}`}
            >
              <span className="study-number">/{artwork.number}</span>
              <StudyMark index={index} />
              <span className="study-info">
                <span className="study-title">{artwork.title}</span>
                <span className="study-kind">
                  {artwork.kind} <span>{artwork.year}</span>
                </span>
                {selected === index && (
                  <span className="study-description">
                    {artwork.description}
                  </span>
                )}
              </span>
              <Arrow diagonal />
            </button>
          ))}
          <div className="archive-note">
            <span className="live-dot" /> All forms are rendered live. Nothing
            stands still.
          </div>
        </div>
      </div>
    </section>
  );
}
