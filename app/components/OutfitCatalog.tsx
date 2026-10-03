import React from 'react';
import { Globe } from 'lucide-react';
import { OutfitSet, Garment } from '../page';

interface Props {
  onOpenOutfit: (outfit: OutfitSet) => void;
  wardrobe: Garment[];
}

export default function OutfitCatalog({ onOpenOutfit, wardrobe }: Props) {
  const outfitCatalogs: OutfitSet[] = [
    {
      id: 'g-1',
      name: 'Business Casual Ejecutivo',
      vibe: 'Business Casual',
      season: 'Entretiempo',
      top: wardrobe[0],
      jacket: { id: 'j1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80', category: 'tops', name: 'Blazer Negro', price: '$120 USD' },
      bottom: wardrobe[1],
      bag: { id: 'b1', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80', category: 'accessories', name: 'Clutch', price: '$200 USD' },
      shoes: wardrobe[2],
      isGlobal: true
    },
    {
      id: 'g-2',
      name: 'Urban Chic Parisino',
      vibe: 'Casual',
      season: 'Verano',
      top: wardrobe[0],
      bottom: wardrobe[1],
      shoes: wardrobe[2],
      isGlobal: true
    }
  ];

  return (
    <div className="w-full max-w-4xl flex flex-col items-center relative z-10">
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <h2 className="text-sm font-semibold text-neutral-300">Catálogo de Atuendos (Haz clic en un look para abrir el estudio detallado)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        {outfitCatalogs.map((outfit) => (
          <div 
            key={outfit.id} 
            onClick={() => onOpenOutfit(outfit)}
            className="bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-xl cursor-pointer transition group hover:border-amber-300/40 hover:-translate-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold bg-amber-300/10 text-amber-300 border border-amber-300/30 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Conjunto Estilista
              </span>
              <span className="text-xs text-neutral-400 font-semibold">{outfit.vibe}</span>
            </div>

            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">{outfit.name}</h3>

            <div className="grid grid-cols-2 gap-3 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80">
              <div className="h-24 flex items-center justify-center">
                <img src={outfit.top?.url || wardrobe[0]?.url} alt="Top" className="max-h-24 object-contain filter drop-shadow" />
              </div>
              <div className="h-24 flex items-center justify-center">
                <img src={outfit.bottom?.url || wardrobe[1]?.url} alt="Bottom" className="max-h-24 object-contain filter drop-shadow" />
              </div>
            </div>

            <span className="text-xs text-center text-amber-300 font-semibold underline">Abrir editor de prendas separadas →</span>
          </div>
        ))}
      </div>
    </div>
  );
}