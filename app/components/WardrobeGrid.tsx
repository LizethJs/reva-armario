import React, { useState } from 'react';
import { Heart, Trash2, Scissors } from 'lucide-react';
import { Garment } from '../page';

interface Props {
  wardrobe: Garment[];
  onOpenDetail: (garment: Garment) => void;
  onToggleFavorite: (id: string) => void;
  onAddNewClick: () => void;
}

export default function WardrobeGrid({ wardrobe, onOpenDetail, onToggleFavorite, onAddNewClick }: Props) {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredWardrobe = filterCategory === 'all' 
    ? wardrobe 
    : wardrobe.filter(item => item.category === filterCategory);

  return (
    <div className="w-full max-w-5xl relative z-10">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['all', 'tops', 'bottoms', 'shoes', 'accessories'].map((cat) => (
            <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition cursor-pointer ${filterCategory === cat ? 'bg-neutral-100 text-neutral-950 font-bold shadow-md' : 'bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:text-white'}`}>
              {cat === 'all' ? 'Todas las prendas' : cat}
            </button>
          ))}
        </div>

        <button onClick={onAddNewClick} className="w-full sm:w-auto bg-amber-300 hover:bg-amber-400 text-neutral-950 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-300/10 cursor-pointer">
          <Scissors className="w-4 h-4" /> Añadir Prenda con IA
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {filteredWardrobe.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onOpenDetail(item)} 
            className="relative bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/80 rounded-3xl p-5 flex flex-col items-center justify-between group transition duration-300 shadow-xl cursor-pointer hover:border-amber-300/40 hover:-translate-y-1"
          >
            <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }} className={`absolute top-3 right-3 p-2 rounded-full transition z-20 cursor-pointer ${item.isFavorite ? 'text-red-400 bg-red-500/10' : 'text-neutral-500 hover:text-red-400 bg-neutral-950/60'}`}>
              <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-red-400' : ''}`} />
            </button>

            <div className="h-44 w-full flex items-center justify-center relative z-10 py-2">
              <img src={item.url} alt={item.name} className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300" />
            </div>

            <div className="w-full mt-3 pt-3 border-t border-neutral-800/60 z-10 flex justify-between items-center">
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-neutral-200 truncate max-w-[110px]">{item.name}</p>
                <span className="text-[11px] font-extrabold text-amber-300">{item.price || '$35.00'}</span>
              </div>
              <button className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg transition cursor-pointer opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}