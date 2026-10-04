'use client';

import React, { useState } from 'react';
import { Layers, Sparkles, RefreshCw, Camera, Check, Trash2 } from 'lucide-react';

export interface Garment {
  id: string;
  name: string;
  category: 'tops' | 'outerwear' | 'bottoms' | 'shoes';
  url: string;
}

interface Props {
  wardrobe: Garment[];
  onOpenVirtualTryOn?: () => void;
}

export default function MixMatchStudio({ wardrobe, onOpenVirtualTryOn }: Props) {
  const [currentVibe, setCurrentVibe] = useState('Casual Profesional');
  const [outfit, setOutfit] = useState<{
    tops: Garment | null;
    outerwear: Garment | null;
    bottoms: Garment | null;
    shoes: Garment | null;
  }>({
    tops: wardrobe.find(w => w.category === 'tops') || null,
    outerwear: wardrobe.find(w => w.category === 'outerwear') || null,
    bottoms: wardrobe.find(w => w.category === 'bottoms') || null,
    shoes: wardrobe.find(w => w.category === 'shoes') || null,
  });

  const generateRandomOutfit = () => {
    const filterCat = (cat: string) => wardrobe.filter(w => w.category === cat);
    const getRandom = (arr: Garment[]) => arr[Math.floor(Math.random() * arr.length)] || null;

    setOutfit({
      tops: getRandom(filterCat('tops')),
      outerwear: getRandom(filterCat('outerwear')),
      bottoms: getRandom(filterCat('bottoms')),
      shoes: getRandom(filterCat('shoes')),
    });
  };

  const clearOutfit = () => {
    setOutfit({ tops: null, outerwear: null, bottoms: null, shoes: null });
  };

  return (
    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel Central: Lienzo de Combinación */}
      <div className="lg:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 backdrop-blur-md flex flex-col items-center justify-center gap-6 shadow-2xl relative">
        <div className="absolute top-6 left-6 flex items-center gap-2 text-amber-300 text-xs font-bold">
          <Sparkles className="w-4 h-4" /> Estilo Actual: {currentVibe}
        </div>

        <div className="absolute top-6 right-6 flex items-center gap-2">
          {onOpenVirtualTryOn && (
            <button
              onClick={onOpenVirtualTryOn}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Probar en mi cuerpo
            </button>
          )}
          <button
            onClick={clearOutfit}
            title="Limpiar conjunto"
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-12">
          {Object.entries(outfit).map(([category, item]) => (
            <div key={category} className="flex flex-col items-center gap-2 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">{category}</span>
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center relative group">
                {item ? (
                  <>
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Check className="w-5 h-5 text-amber-400" />
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-neutral-600">Vacío</span>
                )}
              </div>
              <span className="text-xs text-white font-medium text-center truncate w-full">
                {item ? item.name : 'Sin asignar'}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={generateRandomOutfit}
          className="flex items-center gap-2 px-6 py-3 bg-amber-400 text-neutral-950 font-bold text-xs rounded-2xl shadow-lg hover:bg-amber-300 transition cursor-pointer mt-4"
        >
          <RefreshCw className="w-4 h-4" /> Generar Combinación Inteligente
        </button>
      </div>

      {/* Panel Lateral: Ocasiones y Vibes */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" /> Ocasiones y Estilos
        </h3>
        <div className="flex flex-col gap-2">
          {['Casual Profesional', 'Streetwear', 'Minimalista', 'Elegante', 'Deportivo', 'Noche de Gala'].map((vibe) => (
            <button
              key={vibe}
              onClick={() => setCurrentVibe(vibe)}
              className={`p-3 rounded-2xl text-xs font-bold border transition text-left cursor-pointer ${
                currentVibe === vibe 
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md' 
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}