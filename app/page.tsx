'use client';

import React, { useState } from 'react';
import { Shirt, Sparkles, Calendar, Layers, Camera } from 'lucide-react';
import WardrobeGrid from './components/WardrobeGrid';
import UploadView from './components/UploadView';
import GarmentDetailView from './components/GarmentDetailView';
import OutfitCatalog from './components/OutfitCatalog';
import OutfitDetailView from './components/OutfitDetailView';
import AvatarDailyView from './components/AvatarDailyView';
import VirtualTryOnCam from './components/VirtualTryOnCam';

export interface Garment {
  id: string;
  url: string;
  name: string;
  brand: string;
  price: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  description: string;
  isAvailableInCountry: boolean;
  storeUrl: string;
  isFavorite: boolean;
}

export interface OutfitSet {
  id: string;
  name: string;
  vibe: string;
  season: string;
  top?: Garment;
  bottom?: Garment;
  shoes?: Garment;
  isGlobal: boolean;
}

const INITIAL_WARDROBE: Garment[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    name: 'Camiseta Minimalista Oversize',
    brand: 'COS',
    price: '$45.00 USD',
    category: 'tops',
    description: 'Algodón orgánico de alta densidad con corte estructurado.',
    isAvailableInCountry: true,
    storeUrl: 'https://www.cos.com',
    isFavorite: true
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=80',
    name: 'Pantalón Chino Tailored',
    brand: 'Zara Studio',
    price: '$69.00 USD',
    category: 'bottoms',
    description: 'Pantalón de pinzas con caída fluida y elegante.',
    isAvailableInCountry: true,
    storeUrl: 'https://www.zara.com',
    isFavorite: false
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=80',
    name: 'Sneakers Retro White',
    brand: 'NikeLab',
    price: '$110.00 USD',
    category: 'shoes',
    description: 'Diseño clásico de perfil bajo en piel premium.',
    isAvailableInCountry: true,
    storeUrl: 'https://www.nike.com',
    isFavorite: true
  }
];

export default function Home() {
  const [currentView, setCurrentView] = useState<'wardrobe' | 'upload' | 'detail' | 'outfits' | 'outfitDetail' | 'avatar' | 'tryon'>('wardrobe');
  const [wardrobe, setWardrobe] = useState<Garment[]>(INITIAL_WARDROBE);
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitSet | null>(null);

  const handleToggleFavorite = (id: string) => {
    setWardrobe(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  };

  const handleSaveGarment = (newGarment: Garment) => {
    setWardrobe(prev => [newGarment, ...prev]);
    setCurrentView('wardrobe');
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center p-4 sm:p-8 font-sans selection:bg-amber-300 selection:text-neutral-950">
      <nav className="w-full max-w-5xl flex flex-wrap justify-between items-center gap-4 bg-neutral-900/90 border border-neutral-800 px-6 py-4 rounded-3xl backdrop-blur-xl shadow-2xl mb-8">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('wardrobe')}>
          <div className="w-9 h-9 rounded-xl bg-amber-300 flex items-center justify-center text-neutral-950 font-black shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white">Smart Wardrobe AI</h1>
            <p className="text-[10px] text-amber-300 font-semibold tracking-widest uppercase">Estilismo & IA Avanzada</p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button 
            onClick={() => setCurrentView('wardrobe')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${currentView === 'wardrobe' ? 'bg-amber-300 text-neutral-950 shadow-md' : 'text-neutral-300 hover:text-white bg-neutral-950/50 border border-neutral-800'}`}
          >
            <Shirt className="w-4 h-4" /> Armario
          </button>
          
          <button 
            onClick={() => setCurrentView('outfits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${currentView === 'outfits' || currentView === 'outfitDetail' ? 'bg-amber-300 text-neutral-950 shadow-md' : 'text-neutral-300 hover:text-white bg-neutral-950/50 border border-neutral-800'}`}
          >
            <Layers className="w-4 h-4" /> Catálogo Outfits
          </button>

          <button 
            onClick={() => setCurrentView('avatar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${currentView === 'avatar' ? 'bg-amber-300 text-neutral-950 shadow-md' : 'text-neutral-300 hover:text-white bg-neutral-950/50 border border-neutral-800'}`}
          >
            <Calendar className="w-4 h-4" /> Agenda & Días
          </button>

          <button 
            onClick={() => setCurrentView('tryon')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${currentView === 'tryon' ? 'bg-amber-300 text-neutral-950 shadow-md' : 'text-neutral-300 hover:text-white bg-neutral-950/50 border border-neutral-800'}`}
          >
            <Camera className="w-4 h-4" /> Probador & Cámara
          </button>
        </div>
      </nav>

      <div className="w-full flex justify-center pb-12">
        {currentView === 'wardrobe' && (
          <WardrobeGrid 
            wardrobe={wardrobe} 
            onUploadClick={() => setCurrentView('upload')}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetail={(g) => { setSelectedGarment(g); setCurrentView('detail'); }}
          />
        )}

        {currentView === 'upload' && (
          <UploadView 
            onSave={handleSaveGarment} 
            onBack={() => setCurrentView('wardrobe')} 
          />
        )}

        {currentView === 'detail' && selectedGarment && (
          <GarmentDetailView 
            garment={selectedGarment} 
            onBack={() => setCurrentView('wardrobe')}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView === 'outfits' && (
          <OutfitCatalog 
            wardrobe={wardrobe}
            onOpenOutfit={(outfit) => { setSelectedOutfit(outfit); setCurrentView('outfitDetail'); }}
          />
        )}

        {currentView === 'outfitDetail' && selectedOutfit && (
          <OutfitDetailView 
            outfit={selectedOutfit}
            wardrobe={wardrobe}
            onOpenOutfit={(o) => setSelectedOutfit(o)}
            onBack={() => setCurrentView('outfits')}
          />
        )}

        {currentView === 'avatar' && (
          <AvatarDailyView 
            wardrobe={wardrobe}
            onGoToCatalog={() => setCurrentView('outfits')}
          />
        )}

        {currentView === 'tryon' && (
          <VirtualTryOnCam 
            wardrobe={wardrobe}
          />
        )}
      </div>
    </main>
  );
}