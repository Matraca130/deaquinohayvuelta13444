// ============================================================
// Axon — ItemGrid (reusable hierarchy level grid)
// Renders a grid of cards for courses, semesters, sections, etc.
// ============================================================

import React from 'react';
import { motion } from 'motion/react';
import { FolderOpen, ChevronRight } from 'lucide-react';

interface ItemGridProps<T extends { id: string }> {
  items: T[];
  icon: React.ReactNode;
  emptyLabel: string;
  getLabel: (item: T) => string;
  getSubLabel?: (item: T) => string;
  getColor?: (item: T) => string;
  onSelect: (item: T) => void;
}

export function ItemGrid<T extends { id: string }>({
  items,
  icon,
  emptyLabel,
  getLabel,
  getSubLabel,
  getColor,
  onSelect,
}: ItemGridProps<T>) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 dark:text-gray-500">
        <FolderOpen size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-sm font-medium">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item, idx) => {
        const color = getColor?.(item);
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => onSelect(item)}
            className="group bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 text-left hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-50 dark:bg-purple-950/50"
                style={color ? { backgroundColor: `${color}15`, color } : undefined}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                  {getLabel(item)}
                </p>
                {getSubLabel && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                    {getSubLabel(item)}
                  </p>
                )}
              </div>
              <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-purple-400 shrink-0 mt-1 transition-colors" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}