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

function scorePosition(
  x: number, y: number, popupW: number, popupH: number,
  vw: number, vh: number, anchorRect: DOMRect, placement: string
): number {
  const overflowLeft = Math.max(0, -x);
  const overflowTop = Math.max(0, -y);
  const overflowRight = Math.max(0, x + popupW - vw);
  const overflowBottom = Math.max(0, y + popupH - vh);
  const overflow = overflowLeft + overflowTop + overflowRight + overflowBottom;

  const popupCx = x + popupW / 2;
  const popupCy = y + popupH / 2;
  const anchorCx = anchorRect.left + anchorRect.width / 2;
  const anchorCy = anchorRect.top + anchorRect.height / 2;
  const distToAnchor = Math.hypot(popupCx - anchorCx, popupCy - anchorCy);

  const anchorOnRightHalf = anchorCx > vw / 2;
  const anchorOnBottomHalf = anchorCy > vh / 2;
  let alignmentPenalty = 0;

  const isVerticalPlacement = placement.startsWith('top') || placement.startsWith('bottom');
  if (!isVerticalPlacement) alignmentPenalty += 500;

  if (isVerticalPlacement) {
    if (anchorOnRightHalf && placement.endsWith('-start')) alignmentPenalty += 50;
    if (!anchorOnRightHalf && placement.endsWith('-end')) alignmentPenalty += 50;
  }

  if (placement.startsWith('bottom') && anchorOnBottomHalf) alignmentPenalty += 20;
  if (placement.startsWith('top') && !anchorOnBottomHalf) alignmentPenalty += 20;

  return (overflow * 100000) + alignmentPenalty + (distToAnchor * 0.1);
}

function calculatePopupPosition(
  anchorRect: DOMRect, popupW: number, popupH: number, gap: number, margin: number
): PopupPosition {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const anchorCx = anchorRect.left + anchorRect.width / 2;

  const candidates: { placement: string; x: number; y: number }[] = [];

  const addHorizontalVariants = (baseY: number, baseName: string) => {
    candidates.push({ placement: baseName, x: anchorCx - popupW / 2, y: baseY });
    candidates.push({ placement: `${baseName}-start`, x: anchorRect.left, y: baseY });
    candidates.push({ placement: `${baseName}-end`, x: anchorRect.right - popupW, y: baseY });
    candidates.push({ placement: `${baseName}-shift-left`, x: anchorCx - popupW * 0.25, y: baseY });
    candidates.push({ placement: `${baseName}-shift-right`, x: anchorCx - popupW * 0.75, y: baseY });
  };

  const addVerticalVariants = (baseX: number, baseName: string) => {
    const anchorCy = anchorRect.top + anchorRect.height / 2;
    candidates.push({ placement: baseName, x: baseX, y: anchorCy - popupH / 2 });
  };

  addHorizontalVariants(anchorRect.bottom + gap, 'bottom');
  addHorizontalVariants(anchorRect.top - popupH - gap, 'top');
  addVerticalVariants(anchorRect.right + gap, 'right');
  addVerticalVariants(anchorRect.left - popupW - gap, 'left');

  let best = candidates[0];
  let bestScore = Infinity;

  for (const c of candidates) {
    const s = scorePosition(c.x, c.y, popupW, popupH, vw, vh, anchorRect, c.placement);
    if (s < bestScore) { bestScore = s; best = c; }
  }

  if (!best) best = candidates[0];

  const minX = margin;
  const maxX = vw - popupW - margin;
  const minY = margin;
  const maxY = vh - popupH - margin;

  const left = popupW > (vw - margin * 2) ? margin : clamp(best.x, minX, maxX);
  const top = popupH > (vh - margin * 2) ? margin : clamp(best.y, minY, maxY);

  let arrowLeft: number | undefined;
  let arrowTop: number | undefined;

  if (best.placement.startsWith('top') || best.placement.startsWith('bottom')) {
    arrowLeft = anchorCx - left;
    arrowLeft = clamp(arrowLeft, 12, popupW - 12);
  }
  if (best.placement.startsWith('left') || best.placement.startsWith('right')) {
    const anchorCy = anchorRect.top + anchorRect.height / 2;
    arrowTop = anchorCy - top;
    arrowTop = clamp(arrowTop, 12, popupH - 12);
  }

  return { left, top, placement: best.placement, arrowLeft, arrowTop };
}

export function useSmartPopupPosition({
  isOpen, anchorRef, popupRef, gap = 10, margin = 12,
}: UseSmartPopupPositionProps) {
  const [position, setPosition] = useState<PopupPosition>({
    left: 0, top: 0, placement: 'bottom',
  });

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current || !popupRef.current) return;

    const updatePosition = () => {
      if (!anchorRef.current || !popupRef.current) return;
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const popupW = popupRef.current.offsetWidth;
      const popupH = popupRef.current.offsetHeight;
      if (popupW === 0 || popupH === 0) return;
      const newPosition = calculatePopupPosition(anchorRect, popupW, popupH, gap, margin);
      setPosition(newPosition);
    };

    updatePosition();

    const resizeObserver = new ResizeObserver(() => updatePosition());
    resizeObserver.observe(popupRef.current);

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
