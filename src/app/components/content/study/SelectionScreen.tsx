// ============================================================
// SelectionScreen — Video/Summary picker for a topic session
// Extracted from StudyView.tsx
// ============================================================
import React from 'react';
import { motion } from 'motion/react';
import { Play, FileText } from 'lucide-react';

export function SelectionScreen({ onSelect, topic, courseColor, accentColor }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 w-full overflow-y-auto z-10"
    >
      <div className="flex flex-col items-center justify-center min-h-full p-8">
        <div className="text-center max-w-2xl mb-12">
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-teal-50 border border-teal-200 mb-4 inline-block text-teal-600"
        >
          Sess\u00e3o de Estudo
        </motion.span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">{topic.title}</h1>
        <p className="text-lg text-gray-500 line-clamp-2">{topic.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Video Card */}
        <button 
          onClick={() => onSelect('video')}
          className="group relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gray-900 group-hover:scale-105 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1768644675767-40b294727e10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGFuYXRvbXklMjBtZWRpY2FsJTIwc3R1ZHl8ZW58MXx8fHwxNzY5MDMzMDMxfDA&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="Video" 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Play size={32} className="ml-1 fill-current" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Videoaula</h3>
            <p className="text-white/70 text-sm font-medium">Assistir explica\u00e7\u00e3o visual</p>
          </div>
        </button>

        {/* Summary Card */}
        <button 
          onClick={() => onSelect('summary')}
          className="group relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white border border-gray-100"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-teal-500 transition-colors duration-300" />
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 group-hover:bg-gray-50 transition-colors" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-900 p-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 bg-teal-50">
              <FileText size={32} className="text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Resumo Did\u00e1tico</h3>
            <p className="text-gray-500 text-sm font-medium">Ler material completo</p>
          </div>
        </button>
      </div>
      </div>
    </motion.div>
  );
}
