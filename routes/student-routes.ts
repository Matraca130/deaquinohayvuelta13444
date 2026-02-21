// ============================================================
// Axon — Student Routes (children of StudentLayout)
//
// ADDING A NEW STUDENT VIEW:
//   1. Create the component in /src/app/components/content/
//   2. Import it here
//   3. Add { path: 'my-slug', Component: MyView }
//   That's it — no other files need changes.
//
// PARALLEL-SAFE: Only student devs touch this file.
// ============================================================
import type { RouteObject } from 'react-router';

import { WelcomeView } from '@/app/components/content/WelcomeView';
import { DashboardView } from '@/app/components/content/DashboardView';
import { StudyHubView } from '@/app/components/content/StudyHubView';
import { StudyView } from '@/app/components/content/StudyView';
import { FlashcardView } from '@/app/components/content/FlashcardView';
import { ThreeDView } from '@/app/components/content/ThreeDView';
import { QuizView } from '@/app/components/content/QuizView';
import { ScheduleView } from '@/app/components/content/ScheduleView';
import { StudyOrganizerWizard } from '@/app/components/content/StudyOrganizerWizard';
import { ReviewSessionView } from '@/app/components/content/ReviewSessionView';
import { StudyDashboardsView } from '@/app/components/content/StudyDashboardsView';
import { KnowledgeHeatmapView } from '@/app/components/content/KnowledgeHeatmapView';
import { MasteryDashboardView } from '@/app/components/content/MasteryDashboardView';
import { StudentDataPanel } from '@/app/components/content/StudentDataPanel';

export const studentChildren: RouteObject[] = [
  { index: true,                    Component: WelcomeView },
  { path: 'dashboard',              Component: DashboardView },
  { path: 'study-hub',              Component: StudyHubView },
  { path: 'study',                  Component: StudyView },
  { path: 'flashcards',             Component: FlashcardView },
  { path: '3d',                     Component: ThreeDView },
  { path: 'quiz',                   Component: QuizView },
  { path: 'schedule',               Component: ScheduleView },
  { path: 'organize-study',         Component: StudyOrganizerWizard },
  { path: 'review-session',         Component: ReviewSessionView },
  { path: 'study-dashboards',       Component: StudyDashboardsView },
  { path: 'knowledge-heatmap',      Component: KnowledgeHeatmapView },
  { path: 'mastery-dashboard',      Component: MasteryDashboardView },
  { path: 'student-data',           Component: StudentDataPanel },
];
