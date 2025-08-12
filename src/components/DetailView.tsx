"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DetailViewProps } from "./types";
import { getSectionInfo } from './sectionData';

export default function DetailView({ selectedSection, onClose }: DetailViewProps) {
  const info = selectedSection !== null ? getSectionInfo(selectedSection) : undefined;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (selectedSection !== null) {
      document.addEventListener('keydown', handleKey);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKey);
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selectedSection, handleKey]);

  useEffect(() => {
    if (selectedSection !== null && containerRef.current) {
      const focusable = containerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }, [selectedSection]);

  if (!mounted) return null;

  const overlay = (
    <AnimatePresence>
      {selectedSection !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={info?.title ?? `Section ${selectedSection}`}
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-3 md:p-5 backdrop-blur-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(120,255,180,0.12),transparent_65%),linear-gradient(135deg,#03080c,#101f2c,#0c1a24)]"
        >
            <motion.div
              initial={{ y: 42, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.25,0.46,0.45,0.94] }}
              className="relative flex h-[calc(100dvh_-_2rem)] w-full max-w-[1200px] flex-col overflow-hidden rounded-[38px] border border-emerald-200/30 bg-[linear-gradient(135deg,#071018,#102e45_35%,#16475f_70%,#071017)] shadow-[0_0_0_1px_rgba(150,255,210,0.25),0_8px_34px_-6px_rgba(0,0,0,0.65),0_0_42px_-4px_rgba(120,255,180,0.18)] md:h-[calc(100dvh_-_4rem)] md:rounded-[46px] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_22%_18%,rgba(120,255,180,0.28),transparent_62%)] before:opacity-45 after:pointer-events-none after:absolute after:inset-0 after:mix-blend-overlay after:opacity-30 after:[background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] after:[background-size:48px_48px]"
            >
              <div className="relative flex h-full w-full flex-col">
                <div className="flex items-start gap-4 px-6 pb-4 pt-6 md:px-10 md:pt-10">
                  <h1 className="flex-1 bg-[linear-gradient(90deg,#c8ffe6_0%,#59ffb0_45%,#d5ffe6_100%)] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl lg:text-6xl [text-shadow:0_0_6px_rgba(120,255,180,0.55),0_0_18px_rgba(120,255,180,0.35)]">
                    {info?.title ?? `Section ${selectedSection}`}
                  </h1>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200/40 bg-white/10 text-emerald-100 shadow-[0_0_0_1px_rgba(120,255,200,0.3),0_0_14px_-2px_rgba(120,255,180,0.4)] transition hover:-translate-y-0.5 hover:border-emerald-200/70 hover:bg-white/20 hover:shadow-[0_0_0_1px_rgba(120,255,200,0.5),0_0_18px_-2px_rgba(120,255,180,0.55)]"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-3 px-6 md:px-10 text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-200/70">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(120,255,180,0.6)]" />
                  <span className="bg-gradient-to-r from-emerald-200/80 via-emerald-400/80 to-emerald-200/80 bg-clip-text text-transparent">4K GLASS PANEL</span>
                  <span className="rounded-full bg-emerald-300/20 px-2 py-0.5 text-[9px] font-bold text-emerald-200/80 ring-1 ring-emerald-300/40 backdrop-blur-sm">ACTIVATED</span>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 md:px-10 md:pb-10" role="document">
                  <div className="flex flex-col gap-8 text-emerald-50 text-base/relaxed md:text-lg/relaxed">
                    {info?.description && (
                      <p className="relative rounded-xl border border-emerald-200/10 bg-emerald-100/5 p-5 text-[0.93rem] leading-relaxed shadow-inner shadow-emerald-900/40 backdrop-blur-sm md:text-[1.02rem] md:leading-[1.65]">
                        <span className="pointer-events-none absolute inset-0 rounded-xl [background:linear-gradient(125deg,rgba(120,255,200,0.15),rgba(120,255,200,0)_48%)]" />
                        <span className="relative block opacity-95">{info.description}</span>
                      </p>
                    )}
                    {(info?.image ?? info?.video) && (
                      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {info?.image && (
                          <motion.figure
                            key={info.image}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15 }}
                            className="group relative m-0 flex flex-col gap-2 rounded-2xl border border-emerald-200/25 bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0)_60%)] p-3 shadow-[0_0_0_1px_rgba(120,255,200,0.25),0_8px_22px_-8px_rgba(0,0,0,0.6)] backdrop-blur-sm"
                          >
                            <img
                              src={info.image}
                              alt={info.title}
                              loading="lazy"
                              className="h-auto w-full rounded-xl shadow-lg shadow-black/40 ring-1 ring-emerald-300/10 transition group-hover:brightness-110 group-hover:shadow-[0_0_0_1px_rgba(120,255,200,0.4),0_0_24px_-4px_rgba(120,255,180,0.45)]"
                            />
                            <figcaption className="text-xs uppercase tracking-wide text-emerald-200/60">
                              {info.title} image
                            </figcaption>
                          </motion.figure>
                        )}
                        {info?.video && (
                          <motion.figure
                            key={info.video}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="group relative m-0 flex flex-col gap-2 rounded-2xl border border-emerald-200/25 bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0)_60%)] p-3 shadow-[0_0_0_1px_rgba(120,255,200,0.25),0_8px_22px_-8px_rgba(0,0,0,0.6)] backdrop-blur-sm"
                          >
                            <video
                              src={info.video}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="h-auto w-full rounded-xl shadow-lg shadow-black/40 ring-1 ring-emerald-300/10 transition group-hover:brightness-110 group-hover:shadow-[0_0_0_1px_rgba(120,255,200,0.4),0_0_24px_-4px_rgba(120,255,180,0.45)]"
                            />
                            <figcaption className="text-xs uppercase tracking-wide text-emerald-200/60">
                              {info.title} video
                            </figcaption>
                          </motion.figure>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-10 flex justify-end">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="rounded-full bg-[conic-gradient(at_50%_50%,#5dffb4,#43e494,#5dffb4)] px-9 py-3 text-sm font-semibold tracking-wide text-emerald-950 shadow-[0_0_0_1px_rgba(120,255,200,0.4),0_8px_28px_-8px_rgba(0,0,0,0.7),0_0_24px_-6px_rgba(120,255,180,0.5)] ring-1 ring-emerald-300/40 transition hover:shadow-[0_0_0_1px_rgba(120,255,200,0.55),0_10px_34px_-8px_rgba(0,0,0,0.75),0_0_34px_-4px_rgba(120,255,180,0.65)] hover:brightness-105"
                    >
                      ← Back
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}
