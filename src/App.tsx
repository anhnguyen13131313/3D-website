import { lazy, Suspense, useCallback, useRef, useState } from "react";
import { Arrow } from "./components/Arrow";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useExperienceMotion } from "./hooks/useExperienceMotion";
import type { Chapter } from "./hooks/useExperienceMotion";
import { Exhibition } from "./components/Exhibition";
import { Inspector } from "./components/Inspector";
import { SceneBoundary } from "./components/SceneBoundary";
import { ShaderLab } from "./components/ShaderLab";
import type { MotionState } from "./data/artworks";
import {
  artworkSurfaces,
  sanitizeSurface,
  surfacePresets,
} from "./data/surfaces";
import type { SurfaceSettings } from "./data/surfaces";
import "./App.css";

const SceneCanvas = lazy(() => import("./scene/SceneCanvas"));

function App() {
  const [surfaceOverride, setSurfaceOverride] =
    useState<SurfaceSettings | null>(null);
  const [overridePreset, setOverridePreset] = useState<string | null>(null);
  const [labOpen, setLabOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(0);
  const [chapter, setChapter] = useState<Chapter>("hero");
  const [inspecting, setInspecting] = useState(false);
  const [inspectorTarget, setInspectorTarget] = useState<HTMLDivElement | null>(
    null,
  );
  const root = useRef<HTMLDivElement>(null);
  const systemReduced = useReducedMotion();
  const [motionPaused, setMotionPaused] = useState(false);
  const reduced = systemReduced || motionPaused;
  const motion = useRef<MotionState>({ hero: 0, gallery: 0, finale: 0 });
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => {
    setFailed(true);
    setInspecting(false);
  }, []);
  const closeInspector = useCallback(() => setInspecting(false), []);
  useExperienceMotion(root, motion, reduced, setChapter);
  const activeForm = chapter === "gallery" || inspecting ? selected : 0;
  const surface = surfaceOverride ?? artworkSurfaces[activeForm];
  const presetId = overridePreset ?? artworkSurfaces[activeForm].id;
  const choosePreset = (id: string) => {
    const preset = surfacePresets.find((value) => value.id === id);
    if (!preset) return;
    setSurfaceOverride(sanitizeSurface(preset));
    setOverridePreset(id);
  };
  const editSurface = (changes: Partial<SurfaceSettings>) => {
    setSurfaceOverride((previous) =>
      sanitizeSurface({
        ...artworkSurfaces[activeForm],
        ...previous,
        ...changes,
      }),
    );
    setOverridePreset("custom");
  };
  const resetSurface = () => {
    setSurfaceOverride(null);
    setOverridePreset(null);
  };
  return (
    <div
      className={`experience chapter-${chapter}${reduced ? " motion-reduced" : ""}`}
      ref={root}
    >
      <a className="skip-link" href="#main">
        Skip to experience
      </a>
      <header className="header">
        <a className="wordmark" href="#" aria-label="Chrome Lab, back to start">
          CHROME<span>//</span>LAB<sup>®</sup>
        </a>
        <span className="header-note">Independent digital experiments</span>
        <nav aria-label="Main navigation">
          <a href="#experiments">
            Experiments <span>03</span>
          </a>
          <a href="#about">
            The lab <Arrow diagonal />
          </a>
        </nav>
      </header>
      {!ready && !failed && (
        <div className="scene-status" role="status">
          <span /> Shaping matter…
        </div>
      )}
      {failed && (
        <div className="scene-status" role="status">
          Static edition · 3D is unavailable on this device
        </div>
      )}
      {(!ready || failed) && (
        <div className="sculpture-fallback" aria-hidden="true" />
      )}
      {!failed && (
        <SceneBoundary onError={onError}>
          <Suspense fallback={null}>
            <SceneCanvas
              artwork={activeForm}
              surface={surfaceOverride}
              reduced={reduced}
              motion={motion}
              inspecting={inspecting}
              portalTarget={inspecting ? inspectorTarget : null}
              onReady={onReady}
              onError={onError}
            />
          </Suspense>
        </SceneBoundary>
      )}
      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-intro">
            <span className="live-dot" /> A playground for the not-yet-possible.
          </div>
          <h1 id="hero-title" className="hero-title">
            <span>MATTER.</span>
            <span>UNBOUND.</span>
            <span className="title-period" aria-hidden="true">
              *
            </span>
          </h1>
          <div className="specimen-label">
            <span className="crosshair">+</span>
            <span>
              Specimen 001
              <br />
              Continuum / Liquid chrome
            </span>
          </div>
          <div className="hero-bottom">
            <a className="enter-link" href="#experiments">
              <span className="circle-arrow">
                <Arrow />
              </span>
              <span>
                Enter the lab<small>Scroll to experiment</small>
              </span>
            </a>
            <p>
              We bend the rules of the physical.
              <br />
              And make room for the unexpected.
            </p>
            <div className="material-toolbar">
              <div
                className="material-control"
                role="group"
                aria-label="Sculpture material"
              >
                <span>Surface</span>
                <button
                  aria-pressed={presetId === "chrome"}
                  onClick={() => choosePreset("chrome")}
                >
                  Chrome
                </button>
                <button
                  aria-pressed={presetId === "glass"}
                  onClick={() => choosePreset("glass")}
                >
                  Glass
                </button>
              </div>
              <button
                className="lab-entry"
                disabled={!ready || failed}
                onClick={() => {
                  setLabOpen(true);
                  setInspecting(true);
                }}
              >
                Surface lab <span>+</span>
              </button>
            </div>
          </div>
          <div className="hero-index">
            <span>Move your cursor. Shift your perspective.</span>
            <span>
              Digital matter, real curiosity. <span className="pink">↘</span>
            </span>
          </div>
        </section>
        <div className="manifesto" aria-hidden="true">
          <div className="manifesto-line">
            NO FIXED FORM. <span>ONLY POSSIBILITIES.</span> NO FIXED FORM.
          </div>
          <span className="manifesto-star">✳</span>
        </div>
        <Exhibition
          selected={selected}
          onSelect={setSelected}
          onInspect={() => {
            setLabOpen(false);
            setInspecting(true);
          }}
          available={ready && !failed}
        />
        <section id="about" className="finale" aria-labelledby="finale-title">
          <div className="finale-intro">
            <span className="live-dot" /> This is CHROME//LAB.
            <p>
              An independent space where art, technology,
              <br />
              and a healthy disregard for the ordinary collide.
            </p>
          </div>
          <h2 id="finale-title">
            STAY
            <br />
            CURIOUS<span className="pink">.</span>
          </h2>
          <div className="finale-bottom">
            <p>
              The next experiment starts
              <br />
              with a different perspective.
            </p>
            <a href="#top" className="return-link">
              One more look{" "}
              <span className="circle-arrow">
                <Arrow />
              </span>
            </a>
          </div>
          <footer>
            <a className="wordmark" href="#top">
              CHROME<span>//</span>LAB
            </a>
            <span>Made of curiosity. © 2026</span>
            <button
              className="motion-toggle"
              aria-pressed={reduced}
              disabled={systemReduced}
              onClick={() => setMotionPaused((value) => !value)}
            >
              {reduced ? "Motion reduced" : "Reduce motion"}{" "}
              <span className="pink">{reduced ? "○" : "↗"}</span>
            </button>
          </footer>
        </section>
      </main>
      <Inspector
        open={inspecting}
        artwork={selected}
        onClose={closeInspector}
        onTarget={setInspectorTarget}
        labOpen={labOpen}
        onLabOpen={() => setLabOpen(true)}
        onSelect={setSelected}
        lab={
          <ShaderLab
            selected={selected}
            onSelect={setSelected}
            surface={surface}
            presetId={presetId}
            onPreset={choosePreset}
            onEdit={editSurface}
            onReset={resetSurface}
          />
        }
      />
    </div>
  );
}
export default App;
