import React from 'react';
import { useApp, type ViewType } from '@/app/context/AppContext';
import { components, animation, layout } from '@/app/design-system';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Settings, 
  Users,
  Home,
  Brain,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  id: ViewType;
  label: string;
  icon: LucideIcon;
}

export function Sidebar() {
  const { activeView, setActiveView, isSidebarOpen, setSidebarOpen, currentCourse } = useApp();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'study-hub', label: 'Estudar', icon: BookOpen },
    { id: 'quiz', label: 'Quizzes', icon: Brain },
  ];

  const secondaryItems = [
    { id: 'community', label: 'Comunidade', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ width: layout.sidebar.width }}
      animate={{ width: isSidebarOpen ? layout.sidebar.width : layout.sidebar.collapsedWidth }}
      className="h-full border-r border-white/5 flex flex-col overflow-hidden relative shrink-0 z-10"
      style={{ backgroundColor: components.sidebar.bgOuter }}
    >
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6" style={{ backgroundColor: components.sidebar.bgInner }}>
        
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className={components.sidebar.sectionLabel}>Menu</p>
          {navItems.map((item) => {
            const isActive = activeView === item.id || (item.id === 'study-hub' && activeView === 'study');
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }}
                className={clsx(
                  components.sidebar.navItem.base,
                  isActive 
                    ? clsx(components.sidebar.navItem.active, currentCourse.accentColor.replace('text-', 'text-')) 
                    : components.sidebar.navItem.inactive
                )}
              >
                <Icon size={20} className={isActive ? "text-current" : "text-gray-500 group-hover:text-white"} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className={clsx("ml-auto w-1.5 h-1.5 rounded-full", currentCourse.color)}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1">
          <p className={components.sidebar.sectionLabel}>Outros</p>
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={clsx(components.sidebar.navItem.base, components.sidebar.navItem.inactive)}
              >
                <Icon size={20} className="text-gray-500 group-hover:text-white" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}