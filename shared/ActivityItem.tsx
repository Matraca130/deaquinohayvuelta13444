import React from 'react';
import { components } from '@/app/design-system';

interface ActivityItemProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
}

/**
 * Shared ActivityItem — unified across HomeView, WelcomeView & StudentDataPanel.
 * Uses design-system tokens (components.activityItem.*).
 */
export function ActivityItem({ icon, iconColor, iconBg, title, subtitle }: ActivityItemProps) {
  return (
    <div className={components.activityItem.layout}>
      <div
        className={`${components.activityItem.iconSize} ${iconBg} flex items-center justify-center flex-shrink-0 ${iconColor}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">
          {title}
        </p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
