import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { AxonBrand, AxonBadge, AxonWatermark } from '@/app/components/shared/AxonLogo';
import { components, headingStyle } from '@/app/design-system';

interface AxonPageHeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  backLabel?: string;
  actionButton?: React.ReactNode;
  statsLeft?: React.ReactNode;
  statsRight?: React.ReactNode;
}

export function AxonPageHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Voltar',
  actionButton,
  statsLeft,
  statsRight,
}: AxonPageHeaderProps) {
  return (
    <div className={components.pageHeader.wrapper}>
      {/* Diagonal AXON watermark */}
      <AxonWatermark />

      <div className="relative z-10">
        {/* Top bar: back + brand badge */}
        <div className="flex items-center justify-between mb-4">
          {onBack ? (
            <button onClick={onBack} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm transition-colors font-medium">
              <ChevronLeft size={16} /> {backLabel}
            </button>
          ) : (
            <div />
          )}
          <AxonBadge />
        </div>

        {/* Main title area */}
        <div className="flex items-end justify-between gap-8 mb-3">
          <div className="flex-1 min-w-0">
            <h1 className={`${components.pageHeader.title} mb-1.5 flex items-baseline gap-4`} style={headingStyle}>
              <span>{title}</span>
              <AxonBrand />
            </h1>
            <h2 className={components.pageHeader.subtitle} style={headingStyle}>{subtitle}</h2>
          </div>

          {/* Right side — action button */}
          {actionButton}
        </div>

        {/* Bottom stats row */}
        {(statsLeft || statsRight) && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200/60">
            {statsLeft || <div />}
            {statsRight || <div />}
          </div>
        )}
      </div>
    </div>
  );
}