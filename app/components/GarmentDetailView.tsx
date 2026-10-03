'use client';

import React from 'react';
import { ArrowLeft, ShoppingBag, Globe, CheckCircle2, Heart } from 'lucide-react';
import { Garment } from '../page';

interface GarmentDetailViewProps {
  garment: Garment;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
}

export default function GarmentDetailView({ garment, onBack, onToggleFavorite }: GarmentDetailViewProps) {
  return (
    <div className="w-full max-w-3xl bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-8 animate-fadeIn">
      <div className="w-full md:w-1/2 relative aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
        <img src={garment.url} alt={garment.name} className="absolute inset-0 w-full h-full object-cover" />
        <button 
          onClick={() => onToggleFavorite(garment.id)}
          className="absolute top-4 right-4 p-2.5 rounded-xl bg-neutral-950/70 backdrop-blur-md border border-neutral-800 text-white hover:scale-110 transition cursor-pointer"
        >
          <Heart className={`w-5 h-5 ${garment.isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-300'}`} />
        </button>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer w-max">
            <ArrowLeft className="w-4 h-4" /> Volver al Armario
          </button>
          
          <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">{garment.brand}</span>
          <h2 className="text-2xl font-black text-white">{garment.name}</h2>
          <p className="text-lg font-bold text-amber-400">{garment.price}</p>
          <p className="text-xs text-neutral-300 leading-relaxed">{garment.description}</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-neutral-800 pt-4">
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <Globe className="w-4 h-4 text-amber-300" />
            <span>Disponibilidad en tu país: <strong className="text-white">Disponible para envío inmediato</strong></span>
          </div>

          <a 
            href={garment.storeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-amber-300 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Comprar en Tienda Oficial
          </a>
        </div>
      </div>
    </div>
  );
}