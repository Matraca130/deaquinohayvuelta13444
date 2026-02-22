import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { useStudentDataContext } from '@/app/context/StudentDataContext';
import { useAuth } from '@/app/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Bell, Settings, HelpCircle, LogOut, ChevronRight,
  BookOpen, Award, Flame, Clock, Trophy, CreditCard,
  MessageSquare, Shield, Moon, Zap, Target, TrendingUp, ChevronDown,
  ArrowLeftRight,
} from 'lucide-react';
import { headingStyle, components, colors } from '@/app/design-system';

export function UserProfileDropdown() {
  const { setActiveView, theme, setTheme } = useApp();
  const { profile, isConnected } = useStudentDataContext();
  const { user, memberships, activeMembership, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Use auth user data, fallback to student data context, then defaults
  const displayName = user?.name || (isConnected && profile ? profile.name : 'Estudante');
  const displayEmail = user?.email || (isConnected && profile ? profile.email : 'estudante@axon.med.br');
  const displayShortName = user?.name?.split(' ')[0] || (isConnected && profile ? profile.name.split(' ')[0] : 'Estudante');
  const activeRole = activeMembership?.role || 'student';
  const activeInstitution = activeMembership?.institution?.name || '';

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  const handleNavigate = (view: string) => {
    setActiveView(view as any);
    setIsOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleSwitchRole = () => {
    setIsOpen(false);
    if (memberships.length > 1) {
      navigate('/select-role', { replace: true });
    } else {
      const role = activeMembership?.role || memberships[0]?.role || 'student';
      const dest = ['professor', 'admin', 'owner'].includes(role) ? '/professor' : '/student';
      navigate(dest, { replace: true });
    }
  };

  const canSwitchRole = memberships.length > 1 ||
    ['professor', 'admin', 'owner'].includes(activeMembership?.role || memberships[0]?.role || '');

  return (
    <div className="flex items-center gap-1.5" ref={dropdownRef}>
      {/* Schedule shortcut */}
      <button
        onClick={() => setActiveView('schedule')}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.07] transition-all group"
        title="Cronograma"
      >
        <div className="relative">
          <Calendar size={18} className="group-hover:text-teal-400 transition-colors" />
        </div>
        <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] rounded-full bg-emerald-400 ring-2 ring-[#1a1a1a]" />
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.07] transition-all group"
        title={theme === 'dark' ? 'Tema Escuro' : 'Tema Claro'}
      >
        
      </button>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.07] transition-all group" title="Notificações">
        <Bell size={18} className="group-hover:text-teal-400 transition-colors" />
        <span className="absolute top-1 right-1 flex items-center justify-center w-[15px] h-[15px] rounded-full bg-teal-500 text-[8px] font-bold text-white ring-2 ring-[#1a1a1a]">3</span>
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-white/[0.08] mx-2" />

      {/* User profile trigger */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 cursor-pointer group pl-1 pr-1 py-1 rounded-xl hover:bg-white/[0.05] transition-all"
        >
          <div className="text-right hidden md:block">
            <p className="text-[13px] font-medium text-white/90 group-hover:text-white transition-colors leading-tight">{displayShortName}</p>
            <p className="text-[10px] text-teal-400/70 font-medium tracking-wide uppercase">{activeRole}</p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1659353887222-630895f23cc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZG9jdG9yJTIwbWluaW1hbGlzdGljfGVufDF8fHx8MTc2OTAzMzY1M3ww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="User"
              className="w-8 h-8 rounded-full object-cover ring-[1.5px] ring-white/15 group-hover:ring-teal-500/50 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-[9px] h-[9px] rounded-full bg-emerald-400 ring-[1.5px] ring-[#1a1a1a]" />
          </div>
        </button>

        {/* ═══ Dropdown Panel ═══ */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full right-0 mt-2 w-[280px] bg-[#1c1c24] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
            >
              {/* ── User header ── */}
              <div className="relative px-4 pt-4 pb-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent" />
                <div className="relative flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1659353887222-630895f23cc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZG9jdG9yJTIwbWluaW1hbGlzdGljfGVufDF8fHx8MTc2OTAzMzY1M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/30"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#1c1c24]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-white truncate">{displayName}</p>
                    <p className="text-[11px] text-gray-400 truncate">{displayEmail}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/20 shrink-0">
                    <Zap size={9} className="text-teal-400" />
                    <span className="text-[9px] font-semibold text-teal-300 uppercase tracking-wider">{activeRole}</span>
                  </span>
                </div>
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* ── Menu items ── */}
              <div className="py-1 px-1.5 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
                <DropdownItem icon={<BookOpen size={15} />} label="Meus Cursos" badge="3" onClick={() => handleNavigate('study-hub')} />
                <DropdownItem icon={<Target size={15} />} label="Cronograma" onClick={() => handleNavigate('schedule')} />
                <DropdownItem icon={<TrendingUp size={15} />} label="Desempenho" onClick={() => handleNavigate('dashboard')} />
                <DropdownItem icon={<Award size={15} />} label="Conquistas" badge="Novo" badgeColor="emerald" />

                <div className="h-px bg-white/[0.06] mx-2.5 my-1" />

                <DropdownItem icon={<Settings size={15} />} label="Configurações" />
                <DropdownItem icon={<CreditCard size={15} />} label="Assinatura" />
                <DropdownItem icon={<Moon size={15} />} label="Aparência" />
                <DropdownItem icon={<Shield size={15} />} label="Privacidade" />

                <div className="h-px bg-white/[0.06] mx-2.5 my-1" />

                <DropdownItem icon={<HelpCircle size={15} />} label="Central de Ajuda" />
                <DropdownItem icon={<MessageSquare size={15} />} label="Feedback" />
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* ── Switch role + Logout ── */}
              <div className="p-1.5 space-y-0.5">
                {canSwitchRole && (
                  <button
                    onClick={handleSwitchRole}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
                  >
                    <ArrowLeftRight size={15} />
                    <span className="text-[13px] font-medium">Trocar Papel</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
                >
                  <LogOut size={15} />
                  <span className="text-[13px] font-medium">Sair da Conta</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Dropdown menu item ── */
function DropdownItem({
  icon,
  label,
  subtitle,
  badge,
  badgeColor = 'sky',
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'sky' | 'emerald';
  onClick?: () => void;
}) {
  const badgeBg = badgeColor === 'emerald'
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
    : 'bg-teal-500/15 text-teal-400 border-teal-500/20';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all group"
    >
      <span className="text-gray-500 group-hover:text-teal-400 transition-colors shrink-0">{icon}</span>
      <span className="flex-1 text-left text-[13px] font-medium truncate">{label}</span>
      {badge ? (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${badgeBg}`}>
          {badge}
        </span>
      ) : (
        <ChevronRight size={13} className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
      )}
    </button>
  );
}