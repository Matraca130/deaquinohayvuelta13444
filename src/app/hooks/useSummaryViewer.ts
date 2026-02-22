// ============================================================
// useSummaryViewer — Reader UI state
// Manages: zoom, fullscreen, outline, scroll tracking, tools
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import React from 'react';

// ── Types ──

export type ReaderTool = 'cursor' | 'highlight' | 'pen';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

// ── Hook ──

export function useSummaryViewer(sectionCount: number) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showOutline, setShowOutline] = useState(true);
  const [activeTool, setActiveTool] = useState<ReaderTool>('cursor');
  const [highlightColor, setHighlightColor] = useState<HighlightColor>('yellow');
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [mounted, setMounted] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fade-in on mount
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Auto-update currentSection via IntersectionObserver
  useEffect(() => {
    if (!sectionCount || !mounted) return;

    const timeout = setTimeout(() => {
      const sectionEls = Array.from({ length: sectionCount }, (_, idx) =>
        document.getElementById(`section-${idx}`)
      ).filter(Boolean) as HTMLElement[];

      if (!sectionEls.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          if (visible.length > 0) {
            const id = visible[0].target.id;
            const idx = parseInt(id.replace('section-', ''), 10);
            if (!isNaN(idx)) {
              setCurrentSection(idx);
            }
          }
        },
        {
          rootMargin: '-80px 0px -60% 0px',
          threshold: 0,
        }
      );

      sectionEls.forEach(el => observer.observe(el));

      // Store for cleanup
      (scrollContainerRef as any)._observer = observer;
    }, 300);

    return () => {
      clearTimeout(timeout);
      const obs = (scrollContainerRef as any)?._observer;
      if (obs) obs.disconnect();
    };
  }, [sectionCount, mounted]);

  // ── Actions ──

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 10, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 10, 50));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {
          setIsFullscreen(false);
        });
      }
    }
  }, []);

  const scrollToSection = useCallback((index: number) => {
    setCurrentSection(index);
    const el = document.getElementById(`section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return {
    // UI state
    zoom,
    isFullscreen,
    currentSection,
    showOutline,
    setShowOutline,
    activeTool,
    setActiveTool,
    highlightColor,
    setHighlightColor,
    showAnnotations,
    setShowAnnotations,
    mounted,

    // Ref
    scrollContainerRef,

    // Actions
    handleZoomIn,
    handleZoomOut,
    toggleFullscreen,
    scrollToSection,
  };
}
