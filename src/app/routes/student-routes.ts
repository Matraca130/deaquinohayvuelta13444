// ============================================================
// Axon — Student Routes (children of StudentLayout)
//
// ACTIVE VIEWS:
//   /student             → WelcomeView (index)
//   /student/study-hub   → StudyHubView (topic browser)
//   /student/study       → StudyView (session de estudo — tripleta)
//   /student/flashcards  → FlashcardStudy (sesión FSRS)
//   /student/progress    → StudentProgressDashboard
// ============================================================
import type { RouteObject } from 'react-router';

import { WelcomeView } from '@/app/components/content/WelcomeView';
import { StudyHubView } from '@/app/components/content/StudyHubView';
import { StudyView } from '@/app/components/content/StudyView';
import { FlashcardStudy } from '@/app/components/content/FlashcardStudy';
import { StudentProgressDashboard } from '@/app/components/content/StudentProgressDashboard';

export const studentChildren: RouteObject[] = [
  { index: true,          Component: WelcomeView },
  { path: 'study-hub',    Component: StudyHubView },
  { path: 'study',        Component: StudyView },
  { path: 'flashcards',   Component: FlashcardStudy },
  { path: 'progress',     Component: StudentProgressDashboard },
];