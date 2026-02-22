import React from 'react';
import { components, headingStyle } from '@/app/design-system';

interface CourseCardProps {
  title: string;
  module: string;
  progress: number;
  progressText: string;
  icon: string;
  iconBg: string;
  progressColor: string;
  percentColor: string;
  onContinue: () => void;
}

/**
 * Shared CourseCard — unified across HomeView, WelcomeView & StudentDataPanel.
 * Uses design-system tokens (components.courseCard / progressBar / progressCircle).
 */
export function CourseCard({
  title,
  module,
  progress,
  progressText,
  icon,
  iconBg,
  progressColor,
  percentColor,
  onContinue,
}: CourseCardProps) {
  // SVG circle params
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={components.courseCard.base}>
      {/* Top row: icon + progress circle */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`${components.courseCard.iconSize} ${iconBg} flex items-center justify-center flex-shrink-0 text-2xl`}
        >
          {icon}
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg width="48" height="48" className="-rotate-90">
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={components.progressCircle.strokeWidthSmall}
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke={components.progressCircle.strokeColorSmall}
              strokeWidth={components.progressCircle.strokeWidthSmall}
              strokeLinecap={components.progressCircle.strokeLinecap}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <span className={`absolute text-[10px] font-semibold ${percentColor}`}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-bold text-gray-900 mb-1" style={headingStyle}>
        {title}
      </h4>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-3">
        {module}
      </p>

      {/* Progress row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">Progresso</span>
        <span className="text-xs font-semibold text-gray-700">{progressText}</span>
      </div>

      {/* Progress bar */}
      <div className={components.progressBar.track + ' mb-4'}>
        <div
          className={`${components.progressBar.fill} ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* CTA button */}
      <button onClick={onContinue} className={components.courseCard.ctaButton}>
        Continuar Estudo
      </button>
    </div>
  );
}
