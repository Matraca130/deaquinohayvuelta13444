// ============================================================
// Axon — Student Layout (React Router sub-routes)
//
// Replaces the old monolithic Layout.tsx + StudentArea.tsx.
// Each student view is now a separate route rendered via <Outlet />.
//
// ARCHITECTURE:
//   RouterProvider
//     └─ RequireAuth
//         └─ StudentLayout          ← THIS FILE
//             └─ AppProvider         (course, topic, studyPlans, sidebar state)
//                 └─ StudentDataProvider  (profile, stats, sessions)
//                     └─ StudentShell     (sidebar + header + Outlet)
//
// ADDING A NEW VIEW:
//   1. Create /src/app/components/content/MyNewView.tsx
//   2. Add ONE line in routes.tsx:
//        { path: 'my-new', Component: MyNewView }
//   3. (Optional) Add nav item in STUDENT_NAV below
//   That's it. No other files to edit.
// ============================================================

import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { AppProvider } from '@/app/context/AppContext';
import { StudentDataProvider } from '@/app/context/StudentDataContext';
import { useApp } from '@/app/context/AppContext';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { TopicSidebar } from '@/app/components/layout/TopicSidebar';
import { CourseSwitcher } from '@/app/components/layout/CourseSwitcher';
import { AxonLogo } from '@/app/components/shared/AxonLogo';
import { UserProfileDropdown } from '@/app/components/layout/UserProfileDropdown';
import { AxonAIAssistant } from '@/app/components/ai/AxonAIAssistant';
import { components, animation } from '@/app/design-system';
import { motion } from 'motion/react';
import { Menu } from 'lucide-react';

// ── Inner shell (needs AppContext available) ──────────────────

function StudentShell() {
  const { activeView, setActiveView, isSidebarOpen, setSidebarOpen, isStudySessionActive } = useApp();
  const [isAIOpen, setAIOpen] = React.useState(false);
  const location = useLocation();

  const showTopicSidebar = (activeView === 'study-hub' || activeView === 'study') && !isStudySessionActive;

  // Derive a stable key from the URL for page transitions
  const routeKey = location.pathname;

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Top Navigation Bar */}
        <header className={`${components.header.height} ${components.header.bg} ${components.header.border} flex items-center justify-between px-[14px] z-20 shrink-0 py-[2px] m-[0px]`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className={`${components.header.menuBtn} hover:text-white transition-all duration-200`}
              title={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
            >
              <Menu size={20} />
            </button>

            {/* Logo Area - Click to Home */}
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2.5 mr-4 hover:opacity-80 transition-opacity"
            >
              <AxonLogo size="sm" theme="light" />
            </button>

            {/* Course Switcher */}
            <CourseSwitcher />
          </div>

          {/* Right side header actions */}
          <div className="flex items-center gap-1.5">
            <UserProfileDropdown />
          </div>
        </header>

        {/* Content Area — topic sidebar + main side by side on study views */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Permanent Topic Sidebar */}
          {showTopicSidebar && <TopicSidebar />}

          {/* Main content — Outlet renders the matched child route */}
          <main className="flex-1 overflow-y-auto relative min-w-0">
            <motion.div
              key={routeKey}
              initial={animation.pageTransition.initial}
              animate={animation.pageTransition.animate}
              transition={{ duration: animation.pageTransition.duration }}
              className="h-full w-full"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AxonAIAssistant isOpen={isAIOpen} onClose={() => setAIOpen(false)} />
    </div>
  );
}

// ── Public export: wraps providers + shell ────────────────────

export function StudentLayout() {
  return (
    <AppProvider>
      <StudentDataProvider>
        <StudentShell />
      </StudentDataProvider>
    </AppProvider>
  );
}
