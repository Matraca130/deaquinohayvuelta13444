import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { courses } from '@/app/data/courses';
import { components, animation } from '@/app/design-system';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, BookOpen } from 'lucide-react';
import clsx from 'clsx';

export function CourseSwitcher() {
  const { currentCourse, setCurrentCourse } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors duration-200 group"
      >
        <div className={clsx(
          "w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm transition-colors duration-300",
          currentCourse.color
        )}>
          <BookOpen size={20} strokeWidth={2.5} />
        </div>
        <div className="text-left hidden md:block">
          <p className="text-gray-400 group-hover:text-gray-300 font-medium tracking-wide uppercase text-[14px] font-sans">Curso Atual</p>
          <p className="font-semibold text-gray-200 group-hover:text-white leading-none text-[16px] font-sans">{currentCourse.name}</p>
        </div>
        <ChevronDown 
          size={16} 
          className={clsx("text-gray-500 group-hover:text-white transition-transform duration-200 ml-1", isOpen && "rotate-180")} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={animation.dropdown.initial}
              animate={animation.dropdown.animate}
              exit={animation.dropdown.exit}
              transition={{ duration: animation.dropdown.duration, ease: animation.dropdown.ease }}
              className={`absolute top-full left-0 mt-2 w-64 ${components.courseSwitcher.dropdown} p-2 z-50 overflow-hidden ring-1 ring-black/5`}
            >
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Selecione o Curso
              </div>
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setCurrentCourse(course);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left mb-1 last:mb-0",
                    currentCourse.id === course.id 
                      ? "bg-black/5 shadow-inner" 
                      : "hover:bg-black/5"
                  )}
                >
                  <div className={clsx(
                    "w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px]",
                    course.color
                  )}>
                    <div className="w-2 h-2 bg-white rounded-full opacity-50" />
                  </div>
                  <span className={clsx(
                    "text-sm font-medium",
                    currentCourse.id === course.id ? "text-gray-900" : "text-gray-600"
                  )}>
                    {course.name}
                  </span>
                  {currentCourse.id === course.id && (
                    <motion.div 
                      layoutId="active-dot"
                      className={clsx("ml-auto w-1.5 h-1.5 rounded-full", course.color)}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}