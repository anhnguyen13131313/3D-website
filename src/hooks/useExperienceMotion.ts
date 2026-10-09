import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MotionState } from "../data/artworks";

gsap.registerPlugin(ScrollTrigger);
export type Chapter = "hero" | "gallery" | "finale";

export function useExperienceMotion(
  root: RefObject<HTMLDivElement | null>,
  motion: RefObject<MotionState>,
  reduced: boolean,
  onChapter: (chapter: Chapter) => void,
) {
  useLayoutEffect(() => {
    const measure = () => {
      const rect = document
        .querySelector(".artwork-stage")
        ?.getBoundingClientRect();
      // Mutable ref is the shared GSAP/R3F frame model, not React render state.
      if (rect) {
        // oxlint-disable-next-line react/immutability
        motion.current.stage = {
          x: (rect.left + rect.width / 2) / window.innerWidth - 0.5,
          y: 0.5 - (rect.top + (rect.height - 80) / 2) / window.innerHeight,
          width: rect.width / window.innerWidth,
          height: (rect.height - 100) / window.innerHeight,
        };
      }
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const context = gsap.context(() => {
      if (!reduced)
        gsap.from(".hero-intro, .hero-title > span, .hero-bottom", {
          y: 35,
          opacity: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all",
        });
      const notify = () => {
        onChapter(
          motion.current.finale > 0.3
            ? "finale"
            : motion.current.gallery > 0.45
              ? "gallery"
              : "hero",
        );
      };
      ScrollTrigger.create({
        trigger: "#top",
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          motion.current.hero = self.progress;
          notify();
        },
      });
      ScrollTrigger.create({
        trigger: "#experiments",
        start: "top bottom",
        end: "top 10%",
        onUpdate: (self) => {
          motion.current.gallery = self.progress;
          notify();
        },
      });
      ScrollTrigger.create({
        trigger: "#about",
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => {
          motion.current.finale = self.progress;
          notify();
        },
      });
      if (!reduced) {
        gsap.to(".hero-title", {
          y: -100,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: "#top",
            start: "20% top",
            end: "bottom 30%",
            scrub: 0.7,
          },
        });
        gsap.fromTo(
          ".manifesto-line",
          { xPercent: 10 },
          {
            xPercent: -10,
            ease: "none",
            scrollTrigger: {
              trigger: ".manifesto",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      }
      ScrollTrigger.refresh();
      notify();
    }, root);
    return () => {
      context.revert();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [root, motion, reduced, onChapter]);
}
