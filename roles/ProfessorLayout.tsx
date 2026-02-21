// ============================================================
// Axon — Professor Layout (wraps RoleShell with PlatformDataProvider)
// ============================================================
import React from 'react';
import { RoleShell, type NavItemConfig } from './RoleShell';
import { PlatformDataProvider } from '@/app/context/PlatformDataContext';
import {
  LayoutDashboard, BookOpen, ListTree, CreditCard,
  Users, ClipboardList, Settings, GraduationCap, Brain,
} from 'lucide-react';

const NAV_ITEMS: NavItemConfig[] = [
  { label: 'Dashboard', path: '/professor', icon: <LayoutDashboard size={16} /> },
  { label: 'Cursos', path: '/professor/courses', icon: <BookOpen size={16} /> },
  { label: 'Curriculum', path: '/professor/curriculum', icon: <ListTree size={16} /> },
  { label: 'Flashcards', path: '/professor/flashcards', icon: <CreditCard size={16} /> },
  { label: 'Quizzes', path: '/professor/quizzes', icon: <ClipboardList size={16} /> },
  { label: 'Estudiantes', path: '/professor/students', icon: <Users size={16} /> },
  { label: 'IA Pedagogica', path: '/professor/ai', icon: <Brain size={16} /> },
  { label: 'Configuracion', path: '/professor/settings', icon: <Settings size={16} /> },
];

export function ProfessorLayout() {
  return (
    <PlatformDataProvider>
      <RoleShell
        role="professor"
        roleLabel="Profesor"
        roleIcon={<GraduationCap size={16} />}
        accentColor="purple"
        navItems={NAV_ITEMS}
      />
    </PlatformDataProvider>
  );
}