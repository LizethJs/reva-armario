'use client';

import React, { useState } from 'react';
import { Calendar, Sparkles, User, ArrowRight } from 'lucide-react';
import { Garment } from '../page';

interface AvatarDailyViewProps {
  wardrobe: Garment[];
  onGoToCatalog: () => void;
}

export default function AvatarDailyView({ wardrobe, onGoToCatalog }: AvatarDailyViewProps) {
  const [activeDay, setActiveDay] = useState('Lunes');
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-neutral-900/80 border border-neutral-800 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-300" /> Agenda Semanal & Estilismo por Días
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Planifica tus outfits para toda la semana sin repetir prendas.</p>
        </div>
        <button onClick={onGoToCatalog} className="px-4 py-2 bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5">
          Ver Catálogo Completo <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${activeDay === day ? 'bg-amber-300 text-neutral-950 shadow-lg' : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:text-white'}`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-widest bg-amber-300/10 px-3 py-1 rounded-full border border-amber-300/25 w-max">Outfit para {activeDay}</span>
          <h3 className="text-2xl font-black text-white">Look Casual & Profesional</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">Combinación sugerida por IA para las actividades programadas este día en tu calendario.</p>
          <div className="flex gap-3 pt-2">
            {wardrobe[0] && <img src={wardrobe[0].url} alt="" className="w-16 h-16 rounded-2xl object-cover border border-neutral-800" />}
            {wardrobe[1] && <img src={wardrobe[1].url} alt="" className="w-16 h-16 rounded-2xl object-cover border border-neutral-800" />}
            {wardrobe[2] && <img src={wardrobe[2].url} alt="" className="w-16 h-16 rounded-2xl object-cover border border-neutral-800" />}
          </div>
        </div>

        <div className="w-full md:w-1/2 aspect-video bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden">
          <User className="w-12 h-12 text-neutral-700" />
          <span className="text-xs text-neutral-400 font-medium">Avatar 3D Sincronizado para {activeDay}</span>
        </div>
      </div>
    </div>
  );
}