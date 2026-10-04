'use client';

import React from 'react';
import { ShoppingBag, ExternalLink, Tag } from 'lucide-react';
import { Garment } from '../page';

interface Props {
  wardrobe?: Garment[];
}

export default function OutfitCatalog({ wardrobe = [] }: Props) {
  const fallbackTop = wardrobe[0] || { id: 'fallback-1', name: 'Prenda Base', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', category: 'tops' };
  const fallbackBottom = wardrobe[1] || wardrobe[0] || { id: 'fallback-2', name: 'Pantalón Base', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500', category: 'bottoms' };

  const storeCatalog = [
    { 
      id: 'c1', 
      name: 'Look Urbano Esencial', 
      price: '$89.99 USD', 
      storeName: 'Zara Official', 
      buyUrl: 'https://www.zara.com',
      top: fallbackTop,
      bottom: fallbackBottom
    },
  ];

  return (
    <div className="w-full max-w-6xl bg-neutral-900 border border-neutral-800 p-8 rounded-3xl flex flex-col gap-6 shadow-2xl mt-8">
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-6 h-6 text-amber-400" />
        <div>
          <h2 className="text-base font-bold text-white">Catálogo Global y Enlaces de Compra</h2>
          <p className="text-xs text-neutral-400">Conjuntos recomendados combinados con prendas de tu armario.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {storeCatalog.map(item => (
          <div key={item.id} className="bg-neutral-950 border border-neutral-800 rounded-3xl p-4 flex flex-col gap-4 shadow-xl">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 relative">
              <img src={item.top?.url} alt={item.name} className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 bg-neutral-900/90 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-neutral-800 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {item.price}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-white">{item.name}</span>
              <span className="text-[11px] text-neutral-400">Tienda: <strong className="text-neutral-200">{item.storeName}</strong></span>
            </div>
            <a 
              href={item.buyUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Comprar Conjunto <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}