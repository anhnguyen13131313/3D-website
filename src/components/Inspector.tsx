import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { artworks } from "../data/artworks";
import { FormPicker } from "./FormPicker";

export function Inspector({
  open,
  artwork,
  onClose,
  onTarget,
  labOpen,
  onLabOpen,
  onSelect,
  lab,
}: {
  open: boolean;
  artwork: number;
  onClose: () => void;
  onTarget: (element: HTMLDivElement | null) => void;
  labOpen: boolean;
  onLabOpen: () => void;
  onSelect: (index: number) => void;
  lab: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current!;
    const focused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.documentElement.style.overflow = previousOverflow;
      focused?.focus({ preventScroll: true });
    };
  }, [open]);
  return createPortal(
    <dialog
      ref={dialog}
      className={`inspector${labOpen ? " has-lab" : ""}`}
      aria-labelledby="inspector-title"
      onCancel={onClose}
      onClose={onClose}
    >
      <div ref={onTarget} className="inspector-viewport" />
      <div className="inspector-top">
        <div>
          <span className="pink">Specimen /{artworks[artwork].number}</span>
          <h2 id="inspector-title">{artworks[artwork].title}</h2>
        </div>
        <div className="inspector-actions">
          {!labOpen && (
            <button className="lab-entry" onClick={onLabOpen}>
              Surface lab <span>+</span>
            </button>
          )}
          <button
            className="close-inspector"
            onClick={onClose}
            autoFocus
            aria-label="Close artwork inspection"
          >
            Close <span>×</span>
          </button>
        </div>
      </div>
      {labOpen ? (
        lab
      ) : (
        <div className="inspector-forms">
          <FormPicker selected={artwork} onSelect={onSelect} />
        </div>
      )}
      <p className="inspector-help">
        Drag to orbit. Scroll or pinch to get closer.
        <br />
        <span>Press Esc to return to the exhibition.</span>
      </p>
    </dialog>,
    document.body,
  );
}
