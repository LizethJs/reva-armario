'use client';

import React, { useState } from 'react';
import { Garment } from '../page';
import { Heart, Trash2, ExternalLink, Tag, Sparkles, ShoppingBag, Store } from 'lucide-react';

interface WardrobeManagerProps {
  wardrobe: Garment[];
  onToggleFavorite: (id: string) => void;
  onRemoveGarment: (id: string) => void;
  onAddToCart: (garment: Garment) => void;
  userRole?: string;
}

export default function WardrobeManager({
  wardrobe,
  onToggleFavorite,
  onRemoveGarment,
  onAddToCart,
  userRole
}: WardrobeManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredWardrobe = wardrobe.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesFavorite = onlyFavorites ? item.favorite : true;
    return matchesCategory && matchesFavorite;
  });

  return (
    <div className="w-full max-w-6xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <h2 className="text-sm font-black tracking-widest text-amber-400 uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Catálogo, Terceros y Carrito Comercial
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Prendas oficiales y de terceros con trazabilidad de proveedor, enlaces externos y pasarela simulada.
          </p>
        </div>

        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border ${
            onlyFavorites
              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-lg shadow-amber-400/20'
              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-amber-400/50'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-neutral-950' : 'text-amber-400'}`} />
          {onlyFavorites ? 'Mostrando Favoritos' : 'Filtrar Favoritos'}
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Todas las Prendas' },
          { id: 'tops', label: 'Tops' },
          { id: 'bottoms', label: 'Bottoms' },
          { id: 'shoes', label: 'Zapatos' },
          { id: 'outerwear', label: 'Exterior' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-neutral-800 text-amber-400 border border-amber-400/40'
                : 'bg-neutral-950/60 text-neutral-400 border border-neutral-800 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filteredWardrobe.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-neutral-950/40 rounded-2xl border border-neutral-800/50">
          <Tag className="w-8 h-8 text-neutral-600 animate-pulse" />
          <p className="text-xs text-neutral-400 font-medium">No se encontraron prendas con los filtros actuales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredWardrobe.map(item => (
            <div
              key={item.id}
              className="group bg-neutral-950/60 border border-neutral-800/80 hover:border-amber-400/50 rounded-2xl p-4 flex flex-col gap-4 transition-all duration-300 shadow-xl relative overflow-hidden"
            >
              <div className="relative w-full h-52 bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-800/60">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-2"
                />

                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-neutral-950/80 backdrop-blur-md rounded-full flex items-center justify-center border border-neutral-800 text-amber-400 hover:scale-110 transition cursor-pointer shadow-md"
                  title="Marcar como favorito"
                >
                  <Heart className={`w-4 h-4 ${item.favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'}`} />
                </button>

                {item.vendorName && (
                  <span className="absolute bottom-3 left-3 bg-neutral-950/90 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-lg border border-neutral-800 text-emerald-400 flex items-center gap-1">
                    <Store className="w-3 h-3" /> {item.vendorName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-bold text-white truncate">{item.name}</h3>
                  {item.price && (
                    <span className="text-xs font-black text-amber-400 whitespace-nowrap">{item.price}</span>
                  )}
                </div>
                {item.vendorContact && (
                  <span className="text-[10px] text-neutral-400">Contacto: {item.vendorContact}</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-900">
                <button
                  onClick={() => onAddToCart(item)}
                  className="bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-neutral-950 border border-amber-400/30 px-3 py-2 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Añadir al Carrito
                </button>

                <div className="flex items-center gap-2">
                  {item.storeUrl && (
                    <a
                      href={item.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-white p-2 bg-neutral-900 rounded-xl border border-neutral-800 transition flex items-center gap-1 text-[10px]"
                      title="Enlace de tienda externa"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    </a>
                  )}

                  {(userRole === 'ADMIN' || userRole === 'SELLER') && (
                    <button
                      onClick={() => onRemoveGarment(item.id)}
                      className="text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-900/40 p-2 rounded-xl transition cursor-pointer"
                      title="Eliminar prenda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}