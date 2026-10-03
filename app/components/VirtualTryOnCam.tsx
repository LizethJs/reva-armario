'use client';

import React, { useState } from 'react';
import { Camera, Sparkles, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Garment } from '../page';

interface VirtualTryOnCamProps {
  wardrobe: Garment[];
}

export default function VirtualTryOnCam({ wardrobe = [] }: VirtualTryOnCamProps) {
  const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];
  const topsList = safeWardrobe.filter(i => i?.category === 'tops');
  const bottomsList = safeWardrobe.filter(i => i?.category === 'bottoms');

  const [selectedTop, setSelectedTop] = useState<Garment | null>(topsList[0] || safeWardrobe[0] || null);
  const [selectedBottom, setSelectedBottom] = useState<Garment | null>(bottomsList[0] || safeWardrobe[1] || null);
  const [scale, setScale] = useState<number>(100);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleApplyAiFit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 animate-fadeIn">
      <div className="bg-neutral-900/80 border border-neutral-800 p-6 rounded-3xl backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" /> Probador Virtual & Calibración de Talla IA
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Simula cómo te queda el conjunto ajustando escala, posición y morfología.</p>
        </div>
        <button 
          onClick={handleApplyAiFit}
          className="px-4 py-2.5 bg-amber-300 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} /> Auto-Ajustar con IA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualizador de Avatar / Cámara */}
        <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-center relative aspect-[3/4] sm:aspect-auto sm:h-[500px] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <div className="w-48 h-96 border-2 border-dashed border-neutral-700 rounded-full flex items-center justify-center text-neutral-600 text-xs font-bold uppercase tracking-widest">
              Silueta Base
            </div>
          </div>

          {selectedTop?.url && (
            <div 
              className="absolute transition-all duration-300 pointer-events-none"
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale / 100})`,
                top: '25%'
              }}
            >
              <img src={selectedTop.url} alt="Top" className="w-40 h-40 object-cover rounded-2xl shadow-2xl border border-amber-300/40" />
            </div>
          )}

          {selectedBottom?.url && (
            <div 
              className="absolute transition-all duration-300 pointer-events-none"
              style={{
                transform: `translate(${offsetX}px, ${offsetY + 120}px) scale(${scale / 100})`,
                top: '45%'
              }}
            >
              <img src={selectedBottom.url} alt="Bottom" className="w-36 h-40 object-cover rounded-2xl shadow-2xl border border-amber-300/40" />
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 bg-neutral-900/90 border border-neutral-800 p-3 rounded-2xl backdrop-blur-md flex justify-between items-center text-xs text-neutral-300">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold"><CheckCircle2 className="w-4 h-4" /> IA de Ajuste Activa</span>
            <span>Escala: {scale}%</span>
          </div>
        </div>

        {/* Panel de Controles y Sliders de Calibración */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 flex flex-col gap-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-neutral-800 pb-3">
            <Sliders className="w-4 h-4 text-amber-300" /> Calibración Corporal & Talla
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-300 font-semibold">
                <span>Escala / Zoom Prenda</span>
                <span>{scale}%</span>
              </div>
              <input 
                type="range" 
                min="70" 
                max="140" 
                value={scale} 
                onChange={(e) => setScale(Number(e.target.value))}
                className="accent-amber-300 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-300 font-semibold">
                <span>Desplazamiento Horizontal (X)</span>
                <span>{offsetX}px</span>
              </div>
              <input 
                type="range" 
                min="-60" 
                max="60" 
                value={offsetX} 
                onChange={(e) => setOffsetX(Number(e.target.value))}
                className="accent-amber-300 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-300 font-semibold">
                <span>Desplazamiento Vertical (Y)</span>
                <span>{offsetY}px</span>
              </div>
              <input 
                type="range" 
                min="-40" 
                max="40" 
                value={offsetY} 
                onChange={(e) => setOffsetY(Number(e.target.value))}
                className="accent-amber-300 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}