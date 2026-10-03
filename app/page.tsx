'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, Shirt, Layers } from 'lucide-react';

// Interfaz global de prendas compartida
export interface Garment {
  id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  url: string;
}

// Carga dinámica para evitar errores de SSR con la cámara y TensorFlow
const VirtualTryOnCam = dynamic(() => import('./components/VirtualTryOnCam'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] bg-neutral-950 border border-neutral-800 rounded-3xl flex items-center justify-center text-neutral-400 gap-2">
      <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
      <span>Cargando Probador Virtual con IA...</span>
    </div>
  ),
});

export default function Home() {
  const [wardrobe, setWardrobe] = useState<Garment[]>([
    {
      id: '1',
      name: 'Camiseta Básica Negra',
      category: 'tops',
      url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: '2',
      name: 'Pantalón Jeans Clásico',
      category: 'bottoms',
      url: 'https://images.unsplash.com/photo-1542272604-787c96355353?w=500&auto=format&fit=crop&q=60',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'tryon' | 'wardrobe'>('tryon');

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-neutral-900/40 border border-neutral-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <Shirt className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Armario Virtual IA
            </h1>
            <p className="text-xs text-neutral-400">Gestiona tu ropa y pruébatela en tiempo real con Inteligencia Artificial</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('tryon')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tryon'
                ? 'bg-amber-400 text-neutral-950 shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Probador Virtual
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'wardrobe'
                ? 'bg-amber-400 text-neutral-950 shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Mi Armario ({wardrobe.length})
          </button>
        </div>
      </header>

      <section className="w-full flex flex-col items-center">
        {activeTab === 'tryon' ? (
          <VirtualTryOnCam wardrobe={wardrobe} />
        ) : (
          <div className="w-full max-w-7xl bg-neutral-900/60 border border-neutral-800 p-8 rounded-3xl text-center">
            <h2 className="text-lg font-bold text-white mb-2">Sección de Armario</h2>
            <p className="text-xs text-neutral-400">Aquí puedes ver y administrar las prendas cargadas en tu guardarropa.</p>
          </div>
        )}
      </section>
    </main>
  );
}