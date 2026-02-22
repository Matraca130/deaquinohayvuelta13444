import { useEffect, useState, useLayoutEffect, RefObject } from 'react';

interface PopupPosition {
  left: number;
  top: number;
  placement: string;
  arrowLeft?: number;
  arrowTop?: number;
}

interface UseSmartPopupPositionProps {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement>;
  popupRef: RefObject<HTMLElement>;
  gap?: number;
  margin?: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Calculates a score for a candidate position.
 * Lower score is better.
 */
function scorePosition(
  x: number,
  y: number,
  popupW: number,
  popupH: number,
  vw: number,
  vh: number,
  anchorRect: DOMRect,
  placement: string
): number {
  // Check overflow with strict boundaries
  const overflowLeft = Math.max(0, -x);
  const overflowTop = Math.max(0, -y);
  const overflowRight = Math.max(0, x + popupW - vw);
  const overflowBottom = Math.max(0, y + popupH - vh);

  const overflow = overflowLeft + overflowTop + overflowRight + overflowBottom;

  // Center of the popup
  const popupCx = x + popupW / 2;
  const popupCy = y + popupH / 2;

  // Center of the anchor
  const anchorCx = anchorRect.left + anchorRect.width / 2;
  const anchorCy = anchorRect.top + anchorRect.height / 2;

  // Distance from anchor center (Keep it close!)
  const distToAnchor = Math.hypot(popupCx - anchorCx, popupCy - anchorCy);

  // Screen quadrant logic
  const anchorOnRightHalf = anchorCx > vw / 2;
  const anchorOnBottomHalf = anchorCy > vh / 2;

  let alignmentPenalty = 0;

  // Penalize Left/Right placements to ensure "line is readable" (Top/Bottom preferred for text)
  const isVerticalPlacement = placement.startsWith('top') || placement.startsWith('bottom');
  if (!isVerticalPlacement) {
    alignmentPenalty += 500; // Strong preference for Top/Bottom
  }

  // Smart Alignment Penalty (Horizontal)
  if (isVerticalPlacement) {
    if (anchorOnRightHalf) {
       // On right side, prefer end-aligned (growing left) or centered
       if (placement.endsWith('-start')) alignmentPenalty += 50; 
    } else {
       // On left side, prefer start-aligned (growing right) or centered
       if (placement.endsWith('-end')) alignmentPenalty += 50;
    }
  }

  // Smart Vertical Bias
  if (placement.startsWith('bottom') && anchorOnBottomHalf) alignmentPenalty += 20;
  if (placement.startsWith('top') && !anchorOnBottomHalf) alignmentPenalty += 20;

  // Score weighting:
  // 1. Overflow: Critical (Multiplied hugely to be the deciding factor)
  // 2. Alignment/Type: High (Prefer Top/Bottom)
  // 3. Distance: Low (Keep it attached)
  return (overflow * 100000) + (alignmentPenalty) + (distToAnchor * 0.1);
}

/**
 * Calculates the best popup position based on anchor and viewport
 */
function calculatePopupPosition(
  anchorRect: DOMRect,
  popupW: number,
  popupH: number,
  gap: number,
  margin: number
): PopupPosition {
  // Use clientWidth/Height to exclude scrollbars
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  const anchorCx = anchorRect.left + anchorRect.width / 2;
  const anchorCy = anchorRect.top + anchorRect.height / 2;

  // Candidates: possible positions around the anchor
  const candidates: { placement: string; x: number; y: number }[] = [];

  // Helper to add horizontal variants
  const addHorizontalVariants = (baseY: number, baseName: string) => {
    // Center aligned
    candidates.push({
      placement: baseName,
      x: anchorCx - popupW / 2,
      y: baseY,
    });
    // Start aligned (Left edge aligned - grows right)
    candidates.push({
      placement: `${baseName}-start`,
      x: anchorRect.left,
      y: baseY,
    });
    // End aligned (Right edge aligned - grows left)
    candidates.push({
      placement: `${baseName}-end`,
      x: anchorRect.right - popupW,
      y: baseY,
    });
    // Shifted variants for better fit near edges
    candidates.push({
      placement: `${baseName}-shift-left`,
      x: anchorCx - popupW * 0.25,
      y: baseY,
    });
    candidates.push({
      placement: `${baseName}-shift-right`,
      x: anchorCx - popupW * 0.75,
      y: baseY,
    });
  };

  // Helper to add vertical variants
  const addVerticalVariants = (baseX: number, baseName: string) => {
    candidates.push({
      placement: baseName,
      x: baseX,
      y: anchorCy - popupH / 2,
    });
  };

  addHorizontalVariants(anchorRect.bottom + gap, 'bottom');
  addHorizontalVariants(anchorRect.top - popupH - gap, 'top');
  addVerticalVariants(anchorRect.right + gap, 'right');
  addVerticalVariants(anchorRect.left - popupW - gap, 'left');

  let best = candidates[0];
  let bestScore = Infinity;

  for (const c of candidates) {
    const s = scorePosition(c.x, c.y, popupW, popupH, vw, vh, anchorRect, c.placement);
    if (s < bestScore) {
      bestScore = s;
      best = c;
    }
  }

  // Safety fallback
  if (!best) {
      best = candidates[0];
  }

  // Strict Clamping to Viewport
  // Ensure the popup is fully within [margin, vw - margin] range
  const minX = margin;
  const maxX = vw - popupW - margin;
  const minY = margin;
  const maxY = vh - popupH - margin;

  // If the popup is larger than the viewport, pin to start
  const left = popupW > (vw - margin * 2) ? margin : clamp(best.x, minX, maxX);
  const top = popupH > (vh - margin * 2) ? margin : clamp(best.y, minY, maxY);

  let arrowLeft: number | undefined;
  let arrowTop: number | undefined;

  if (best.placement.startsWith('top') || best.placement.startsWith('bottom')) {
    arrowLeft = anchorCx - left;
    // Constrain arrow to be within the popup box (with 12px padding for border-radius)
    arrowLeft = clamp(arrowLeft, 12, popupW - 12);
  }

  if (best.placement.startsWith('left') || best.placement.startsWith('right')) {
    arrowTop = anchorCy - top;
    arrowTop = clamp(arrowTop, 12, popupH - 12);
  }

  return {
    left,
    top,
    placement: best.placement,
    arrowLeft,
    arrowTop,
  };
}

export function useSmartPopupPosition({
  isOpen,
  anchorRef,
  popupRef,
  gap = 10,
  margin = 12, // Increased margin for safety
}: UseSmartPopupPositionProps) {
  const [position, setPosition] = useState<PopupPosition>({
    left: 0,
    top: 0,
    placement: 'bottom',
  });

  // We use useLayoutEffect to measure before paint when possible, 
  // though for a conditional render it acts like useEffect.
  useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current || !popupRef.current) return;

    const updatePosition = () => {
      if (!anchorRef.current || !popupRef.current) return;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      
      // IMPORTANT: Use offsetWidth/Height to get un-transformed dimensions.
      // getBoundingClientRect() includes scaling (like scale(0.95)), which throws off collision detection
      // when the element expands to scale(1).
      const popupW = popupRef.current.offsetWidth;
      const popupH = popupRef.current.offsetHeight;

      if (popupW === 0 || popupH === 0) return;

      const newPosition = calculatePopupPosition(anchorRect, popupW, popupH, gap, margin);
      setPosition(newPosition);
    };

    // Initial calculation
    updatePosition();

    // Observe size changes (e.g. content loading, expanding textareas)
    const resizeObserver = new ResizeObserver(() => {
        updatePosition();
    });
    resizeObserver.observe(popupRef.current);

    // Also update on window resize/scroll
    const handleWindowEvents = () => updatePosition();
    window.addEventListener('resize', handleWindowEvents);
    window.addEventListener('scroll', handleWindowEvents, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowEvents);
      window.removeEventListener('scroll', handleWindowEvents, true);
    };
  }, [isOpen, anchorRef, popupRef, gap, margin]);

  return position;
}
