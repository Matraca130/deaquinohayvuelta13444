// ============================================================
// Axon — FadeIn Animation Wrapper
//
// IMPORT: import { FadeIn } from '@/app/components/shared/FadeIn';
//
// Usage:
//   <FadeIn>content</FadeIn>
//   <FadeIn delay={0.1}>staggered content</FadeIn>
//   <FadeIn direction="left">slide from left</FadeIn>
//
// Previously duplicated in OwnerDashboardPage and OwnerMembersPage.
// ============================================================

import React from 'react';
import { motion } from 'motion/react';

interface FadeInProps {
  children: React.ReactNode;
  /** Delay in seconds (default: 0) */
  delay?: number;
  /** Direction to animate from (default: 'up') */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Animation duration in seconds (default: 0.35) */
  duration?: number;
  /** Extra className on wrapper div */
  className?: string;
}

const OFFSET: Record<string, { x: number; y: number }> = {
  up:    { x: 0,   y: 12 },
  down:  { x: 0,   y: -12 },
  left:  { x: 12,  y: 0 },
  right: { x: -12, y: 0 },
  none:  { x: 0,   y: 0 },
};

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.35,
  className = '',
}: FadeInProps) {
  const offset = OFFSET[direction];

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Stagger delay constant for KPI cards and list items */
export const STAGGER_DELAY = 0.06;
