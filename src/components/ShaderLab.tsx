import { useState } from "react";
import type { CSSProperties } from "react";
import { FormPicker } from "./FormPicker";
import { surfacePresets } from "../data/surfaces";
import type { SurfaceProperty, SurfaceSettings } from "../data/surfaces";

const controls: {
  key: SurfaceProperty;
  label: string;
  ends: [string, string];
}[] = [
  { key: "roughness", label: "Roughness", ends: ["Mirror", "Satin"] },
  { key: "metalness", label: "Metalness", ends: ["Pigment", "Metal"] },
  { key: "transmission", label: "Transmission", ends: ["Solid", "Glass"] },
  { key: "iridescence", label: "Iridescence", ends: ["Neutral", "Spectral"] },
];

export function ShaderLab({
  selected,
  onSelect,
  surface,
  presetId,
  onPreset,
  onEdit,
  onReset,
}: {
  selected: number;
  onSelect: (index: number) => void;
  surface: SurfaceSettings;
  presetId: string;
  onPreset: (id: string) => void;
  onEdit: (changes: Partial<SurfaceSettings>) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<{ source: string; value: string } | null>(
    null,
  );
  const hex = draft?.source === surface.color ? draft.value : surface.color;
  const valid = /^#[0-9a-f]{6}$/i.test(hex);
  return (
    <aside className="shader-lab" aria-labelledby="lab-title">
      <div className="lab-heading">
        <span className="pink">Material playground</span>
        <h2 id="lab-title">
          Surface <br />
          studies.
        </h2>
        <p>Same matter. A different feeling.</p>
      </div>
      <div className="lab-form">
        <span className="lab-label">Form</span>
        <FormPicker selected={selected} onSelect={onSelect} />
      </div>
      <div className="lab-presets" role="group" aria-label="Material presets">
        {surfacePresets.map((preset) => (
          <button
            key={preset.id}
            className={`surface-preset preset-${preset.id}`}
            aria-pressed={presetId === preset.id}
            onClick={() => onPreset(preset.id)}
          >
            <span className="preset-swatch" />
            <span>
              {preset.name}
              <small>{preset.note}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="lab-tint">
        <label htmlFor="lab-hex">Tint</label>
        <div>
          <input
            type="color"
            aria-label="Tint color picker"
            value={surface.color}
            onChange={(event) => {
              setDraft(null);
              onEdit({ color: event.target.value });
            }}
          />
          <input
            id="lab-hex"
            value={hex}
            spellCheck={false}
            aria-invalid={!valid}
            maxLength={7}
            onChange={(event) => {
              const value = event.target.value;
              if (/^#[0-9a-f]{6}$/i.test(value)) {
                setDraft(null);
                onEdit({ color: value });
              } else {
                setDraft({ source: surface.color, value });
              }
            }}
            onBlur={() => setDraft(null)}
          />
        </div>
      </div>
      <div className="lab-sliders">
        {controls.map((control) => (
          <div className="lab-control" key={control.key}>
            <div>
              <label htmlFor={`lab-${control.key}`}>{control.label}</label>
              <output htmlFor={`lab-${control.key}`}>
                {surface[control.key].toFixed(2)}
              </output>
            </div>
            <input
              id={`lab-${control.key}`}
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={surface[control.key]}
              onChange={(event) =>
                onEdit({ [control.key]: Number(event.target.value) })
              }
              style={
                {
                  "--range-progress": `${surface[control.key] * 100}%`,
                } as CSSProperties
              }
            />
            <div className="range-ends">
              <span>{control.ends[0]}</span>
              <span>{control.ends[1]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="lab-footer">
        <p>
          Transmission shows best with low metalness.
          <br />
          Your surface stays with you as forms change.
        </p>
        <button onClick={onReset}>
          Reset material <span>↺</span>
        </button>
      </div>
    </aside>
  );
}
