'use client';

import React, { useState } from 'react';
import { Palette, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function ColorPaletteAI() {
  const [selectedPalette, setSelectedPalette] = useState([
    { name: 'Blanco Nieve', hex: '#FFFFFF' },
    { name: 'Negro Carbón', hex: '#121212' },
    { name: 'Azul Acero', hex: '#2563EB' },
    { name: 'Gris Neutro', hex: '#737373' },
  ]);

  const palettes = [
    { title: 'Monocromático Urbano', colors: ['#FFFFFF', '#121212', '#525252', '#A3A3A3'] },
    { title: 'Elegancia Nocturna', colors: ['#1E1B4B', '#312E81', '#0F172A', '#E2E8F0'] },
    { title: 'Casual Cálido', colors: ['#78350F', '#B45309', '#FDE68A', '#292524'] },
  ];

  return (
    <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Generador de Paletas */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" /> Paletas de Colores Armonizadas por IA
        </h3>
        <p className="text-xs text-neutral-400">Combina los colores de tus prendas según teoría cromática profesional.</p>
        
        <div className="flex flex-col gap-4 mt-2">
          {palettes.map((pal, idx) => (
            <div key={idx} className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-2xl flex flex-col gap-3">
              <span className="text-xs font-bold text-white">{pal.title}</span>
              <div className="flex gap-3">
                {pal.colors.map((hex, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl border border-neutral-700 shadow-inner" style={{ backgroundColor: hex }}></div>
                    <span className="text-[9px] text-neutral-500">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Temas de Fondo y Siluetas */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" /> Temas de Fondo & Siluetas 3D
        </h3>
        <p className="text-xs text-neutral-400">Personaliza el entorno virtual de la cámara para tus pruebas de estilo.</p>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          {['Estudio Minimalista', 'Calle Urbana', 'Oficina Ejecutiva', 'Pasarela de Moda'].map((theme, i) => (
            <div key={i} className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer hover:border-amber-400 transition">
              <span className="text-xs font-bold text-white">{theme}</span>
              <span className="text-[10px] text-amber-400 font-medium">Activar entorno</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}