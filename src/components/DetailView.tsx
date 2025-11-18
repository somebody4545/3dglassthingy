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
          className="fixed inset-0 z-[100000000] flex items-center justify-center bg-black/70 p-4 md:p-8"
        >
            <motion.div
              initial={{ y: 42, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.25,0.46,0.45,0.94] }}
              className="relative flex h-[calc(100dvh_-_2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-[0_10px_40px_rgba(0,0,0,0.65)] md:h-[calc(100dvh_-_4rem)]"
            >
              <div className="relative flex h-full w-full flex-col">
                <div className="flex items-start gap-4 px-6 pb-4 pt-6 md:px-10 md:pt-10">
                  <h1 className="flex-1 text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
                    {info?.title ?? `Section ${selectedSection}`}
                  </h1>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-slate-200 transition hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-3 px-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 md:px-10">
                  <span className="text-slate-300">About</span>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 md:px-10 md:pb-10" role="document">
                  <div className="flex flex-col gap-8 text-emerald-50 text-base/relaxed md:text-lg/relaxed">
                    {info?.description && (
                      <p className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-[0.93rem] leading-relaxed text-slate-200 shadow-inner md:text-[1.02rem] md:leading-[1.65]">
                        {info.description}
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
                            className="group relative m-0 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3 shadow-lg shadow-black/50"
                          >
                            <img
                              src={info.image}
                              alt={info.title}
                              loading="lazy"
                              className="h-auto w-full rounded-lg object-cover shadow-md transition group-hover:opacity-90"
                            />
                            <figcaption className="text-xs uppercase tracking-wide text-slate-400">
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
                            className="group relative m-0 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3 shadow-lg shadow-black/50"
                          >
                            <video
                              src={info.video}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="h-auto w-full rounded-lg object-cover shadow-md transition group-hover:opacity-90"
                            />
                            <figcaption className="text-xs uppercase tracking-wide text-slate-400">
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
                      className="rounded-full border border-emerald-400 px-8 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400 hover:text-slate-950"
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
