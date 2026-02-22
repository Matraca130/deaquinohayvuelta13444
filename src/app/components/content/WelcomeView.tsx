import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import type { ViewType } from '@/app/context/AppContext';
import { useStudentDataContext } from '@/app/context/StudentDataContext';
import { courses } from '@/app/data/courses';
import { AxonPageHeader } from '@/app/components/shared/AxonPageHeader';
import { components, colors, headingStyle, layout } from '@/app/design-system';
import { 
  MoreHorizontal,
  Play,
  CheckCircle,
  FileText,
  ArrowRight,
  BookOpen,
  Layers,
  GraduationCap,
  Box,
} from 'lucide-react';

import { CourseCard } from '@/app/components/shared/CourseCard';
import { ActivityItem } from '@/app/components/shared/ActivityItem';

export function WelcomeView() {
  const { setActiveView } = useApp();
  const { profile, stats, isConnected, loading: studentLoading } = useStudentDataContext();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

  // Real student data
  const studentName = profile?.name?.split(' ')[0] || 'Dr. Reed';
  const streakDays = stats?.currentStreak ?? 0;
  const studyHours = stats ? Math.round(stats.totalStudyMinutes / 60) : 0;
  const cardsReviewed = stats?.totalCardsReviewed ?? 0;

  // Calculate course progress from real data
  const getCourseProgress = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return { progress: 0, completed: 0, total: 0 };

    let totalLessons = 0;
    let completedLessons = 0;

    course.semesters.forEach(sem => {
      sem.sections.forEach(sec => {
        sec.topics.forEach(topic => {
          if (topic.lessons) {
            totalLessons += topic.lessons.length;
            completedLessons += topic.lessons.filter(l => l.completed).length;
          }
        });
      });
    });

    return {
      progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      completed: completedLessons,
      total: totalLessons
    };
  };

  // Real course data
  const courseData = [
    {
      id: 'microbiology',
      title: 'Microbiologia',
      module: 'MODULO IV',
      icon: '\u{1F9A0}',
      iconBg: 'bg-purple-100',
      progressColor: 'bg-purple-500',
      percentColor: 'text-purple-600',
      ...getCourseProgress('anatomy')
    },
    {
      id: 'cell-biology',
      title: 'Biologia Celular',
      module: 'MODULO FINAL',
      icon: '\u{1F33F}',
      iconBg: 'bg-teal-100',
      progressColor: 'bg-teal-500',
      percentColor: 'text-teal-600',
      ...getCourseProgress('histology')
    },
    {
      id: 'histology',
      title: 'Histologia',
      module: 'MODULO II',
      icon: '\u{1F52C}',
      iconBg: 'bg-teal-100',
      progressColor: 'bg-teal-500',
      percentColor: 'text-teal-600',
      ...getCourseProgress('histology')
    },
    {
      id: 'anatomy',
      title: 'Anatomia Humana',
      module: 'MODULO I',
      icon: '\u{2764}\u{FE0F}',
      iconBg: 'bg-pink-100',
      progressColor: 'bg-pink-500',
      percentColor: 'text-pink-600',
      ...getCourseProgress('anatomy')
    },
  ];

  // Calculate daily performance based on real stats
  const calculateDailyPerformance = () => {
    if (!stats) return 0;
    const targetHours = 10;
    const percentage = Math.min(Math.round((studyHours / targetHours) * 100), 100);
    return percentage;
  };

  const dailyPerformance = calculateDailyPerformance();

  // Recent activities from real data
  const recentActivities = [
    {
      icon: <Play size={14} />,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'Video de Anatomia',
      subtitle: 'Sistema Cardiovascular \u00B7 Ha 20 min'
    },
    {
      icon: <CheckCircle size={14} />,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-100',
      title: isConnected ? `${cardsReviewed} Flashcards Revisados` : 'Quiz de Histologia',
      subtitle: isConnected ? `Total acumulado \u00B7 ${streakDays} dias seguidos` : 'Nota: 9.5/10 \u00B7 Ha 2 horas'
    },
    {
      icon: <FileText size={14} />,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: isConnected ? `${studyHours}h Estudadas` : 'Novo resumo',
      subtitle: isConnected ? 'Tempo total acumulado' : 'Ciclo de Krebs \u00B7 09:15'
    },
  ];

  // Shortcut cards — using design system icon pattern
  const statCards = [
    { title: 'Estudar', subtitle: 'Iniciar sessao de estudo', icon: BookOpen, color: components.shortcutCard.iconColor, bg: components.shortcutCard.iconBg, view: 'study-hub' as ViewType },
  ];

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* AxonPageHeader — consistent with all other pages */}
      <AxonPageHeader
        title={`Bem-vindo, ${studentName}`}
        subtitle={
          isConnected && stats
            ? `${streakDays} dias seguidos \u00B7 ${studyHours}h estudadas \u00B7 ${cardsReviewed} cards revisados`
            : '"A excelencia nao e um ato, mas um habito." \u2014 Aristoteles'
        }
        statsLeft={
          <div className="flex items-center gap-2">
            {(['today', 'week', 'month'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeFilter === f
                    ? components.filterButton.activeDark
                    : components.filterButton.inactiveDark
                }`}
              >
                {f === 'today' ? 'Hoje' : f === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        }
      />

      {/* Main scrollable content */}
      <div className={`flex-1 ${layout.content.paddingX} ${layout.content.paddingY} space-y-6 overflow-y-auto custom-scrollbar-light`}>

        {/* ═══ Two-column layout: courses + sidebar (FIRST) ═══ */}
        <div className="flex gap-6">
          {/* Left Content - Courses */}
          <div className="flex-1 min-w-0">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-teal-500" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide" style={headingStyle}>
                  Disciplinas em Curso
                </h3>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button 
                onClick={() => setActiveView('study-hub')}
                className="text-teal-600 hover:text-teal-700 font-semibold text-xs flex items-center gap-1 ml-4 flex-shrink-0"
              >
                Ver Todas
                <ArrowRight size={12} />
              </button>
            </div>

            {/* Courses Grid */}
            <div className={layout.grid.courses}>
              {courseData.map((course) => (
                <CourseCard 
                  key={course.id}
                  title={course.title}
                  module={course.module}
                  progress={course.progress}
                  progressText={`${course.completed}/${course.total} Aulas`}
                  icon={course.icon}
                  iconBg={course.iconBg}
                  progressColor={course.progressColor}
                  percentColor={course.percentColor}
                  onContinue={() => setActiveView('study')}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar - Performance & Activity */}
          <div className={`${layout.rightPanel.width} space-y-5 flex-shrink-0`}>
            {/* Daily Performance Card */}
            <div className={`${components.cardDark.base} ${components.cardDark.padding}`}>
              <h3 className="text-lg font-bold mb-6" style={headingStyle}>
                Desempenho {timeFilter === 'today' ? 'Diário' : timeFilter === 'week' ? 'Semanal' : 'Mensal'}
              </h3>
              
              {/* Circular Progress */}
              <div className="relative w-44 h-44 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="70"
                    stroke={components.progressCircle.strokeBg}
                    strokeWidth={components.progressCircle.strokeWidth}
                    fill="none"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="70"
                    stroke={components.progressCircle.strokeActive}
                    strokeWidth={components.progressCircle.strokeWidth}
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - dailyPerformance / 100)}`}
                    strokeLinecap={components.progressCircle.strokeLinecap}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold">{dailyPerformance}<span className="text-3xl">%</span></span>
                  <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-[0.2em] font-semibold">CONCLUIDO</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg font-bold mb-1">{studyHours} de 10 Horas</p>
                <p className="text-sm text-gray-300">
                  {dailyPerformance >= 80 ? 'Voce esta proximo da excelencia.' : 'Continue se dedicando!'}
                </p>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className={`${components.card.base} ${components.card.paddingLg}`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide" style={headingStyle}>
                  Atividade Recente
                </h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <ActivityItem 
                    key={index}
                    icon={activity.icon}
                    iconColor={activity.iconColor}
                    iconBg={activity.iconBg}
                    title={activity.title}
                    subtitle={activity.subtitle}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Quick Shortcut Cards (BELOW disciplines) ═══ */}
        <div>
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide" style={headingStyle}>
              Acesso Rapido
            </h3>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className={layout.grid.stats}>
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className={components.shortcutCard.base} onClick={() => setActiveView(stat.view)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${components.shortcutCard.iconSize} ${stat.bg} flex items-center justify-center`}>
                      <Icon size={20} className={stat.color} />
                    </div>
                    <ArrowRight size={16} className="text-gray-300" />
                  </div>
                  <h4 className="font-bold text-gray-900" style={headingStyle}>{stat.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}