'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VirtualTryOnCam } from './components/VirtualTryOnCam';
import WardrobeManager from './components/WardrobeManager';
import { Plus, LogOut, UserCheck, X, Mail, Crown, Store, ShoppingBag, Sparkles, User as UserIcon, Settings, Trash2, ExternalLink } from 'lucide-react';

export interface Garment {
  id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'outerwear';
  vibe?: string;
  url: string;
  favorite?: boolean;
  price?: string;
  storeUrl?: string;
  description?: string;
  vendorName?: string;
  vendorContact?: string;
}

export interface WishlistItem extends Garment {
  selectedSize?: 'S' | 'M' | 'L' | 'XL';
}

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string; contact?: string } | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);

  const [wardrobe, setWardrobe] = useState<Garment[]>([
    {
      id: '1',
      name: 'Vestido Midi Satinado Asimétrico',
      category: 'tops',
      vibe: 'Elegante / Nocturno',
      url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
      price: '$89.900 COP',
      storeUrl: 'https://co.shein.com',
      description: 'Vestido de tirantes con acabado satinado de alta calidad.',
      vendorName: 'Boutique Urbana Co',
      favorite: false
    },
    {
      id: '2',
      name: 'Chaqueta Oversized Efecto Cuero',
      category: 'outerwear',
      vibe: 'Streetwear / Grunge',
      url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
      price: '$149.900 COP',
      storeUrl: 'https://www.zara.com/co/',
      description: 'Chaqueta estilo biker amplia en cuerina premium.',
      vendorName: 'Global Trends Store',
      favorite: true
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'tops' | 'bottoms' | 'shoes' | 'outerwear'>('tops');
  const [newVibe, setNewVibe] = useState('Casual');
  const [newSource, setNewSource] = useState('');
  const [newPrice, setNewPrice] = useState('$59.900 COP');
  const [newStoreUrl, setNewStoreUrl] = useState('https://co.shein.com');
  const [newDescription, setNewDescription] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [isProcessingBg, setIsProcessingBg] = useState(false);

  useEffect(() => {
    const sessionData = localStorage.getItem('user_session');
    if (!sessionData) {
      router.push('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(sessionData);
      setCurrentUser(parsedUser);
      if (parsedUser.role === 'SELLER') {
        setNewVendorName(parsedUser.name || '');
        setNewVendorContact(parsedUser.contact || parsedUser.email);
      }
    } catch (e) {
      router.push('/login');
    }
    setLoadingSession(false);
  }, [router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewSource(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGarment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSource.trim()) {
      alert('Por favor completa el nombre y añade una imagen.');
      return;
    }

    const newGarment: Garment = {
      id: Date.now().toString(),
      name: newName,
      category: newCategory,
      vibe: newVibe,
      url: newSource,
      favorite: false,
      price: newPrice || '$50.000 COP',
      storeUrl: newStoreUrl || 'https://co.shein.com',
      description: newDescription || 'Prenda comercial de tercero.',
      vendorName: currentUser?.role === 'SELLER' ? currentUser.name : 'Administrador RËVA',
    };

    setWardrobe(prev => [newGarment, ...prev]);
    setNewName('');
    setNewSource('');
    setShowAddModal(false);
  };

  const handleToggleFavorite = (id: string) => {
    setWardrobe(prev => prev.map(item => (item.id === id ? { ...item, favorite: !item.favorite } : item)));
  };

  const handleRemoveGarment = async (id: string) => {
    setWardrobe(prev => prev.filter(item => item.id !== id));
  };

  const handleAddToCart = (garment: Garment, size: 'S' | 'M' | 'L' | 'XL' = 'M') => {
    setWishlist(prev => {
      const existing = prev.find(item => item.id === garment.id && item.selectedSize === size);
      if (existing) return prev;
      return [...prev, { ...garment, selectedSize: size }];
    });
    setShowWishlistDrawer(true);
  };

  const handleRemoveFromWishlist = (id: string, size?: string) => {
    setWishlist(prev => prev.filter(item => !(item.id === id && (!size || item.selectedSize === size))));
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-neutral-950 text-amber-400 flex items-center justify-center font-bold tracking-widest text-sm animate-pulse">
        CARGANDO ENTORNO RËVA...
      </div>
    );
  }

  const getRoleBadgeStyle = (role?: string) => {
    if (role === 'ADMIN') return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (role === 'SELLER') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    return 'bg-amber-400/10 text-amber-400 border-amber-400/30';
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center p-3 sm:p-6 md:p-8 gap-6 selection:bg-amber-400 selection:text-neutral-950 overflow-x-hidden">
      
      {/* Cabecera Responsiva */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-lg text-lg sm:text-xl tracking-wider">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-widest text-white">RËVA</h1>
                <span className={`border text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${getRoleBadgeStyle(currentUser?.role)}`}>
                  {currentUser?.role}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400">Plataforma de Terceros</p>
            </div>
          </div>
        </div>

        {/* Botones de Navegación Adaptados a Móvil */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center w-full md:w-auto">
          <button
            onClick={() => setShowWishlistDrawer(true)}
            className="relative bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400"/>
            <span className="hidden sm:inline">Wishlist</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-neutral-950 text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {wishlist.length}
              </span>
            )}
          </button>

          {currentUser?.role === 'SELLER' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xl"
            >
              <Plus className="w-4 h-4"/> Publicar
            </button>
          )}

          <button
            onClick={() => setShowProfileModal(true)}
            className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-bold px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400"/> <span className="hidden sm:inline">Perfil</span>
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('user_session');
              router.push('/login');
            }}
            className="bg-red-950/30 border border-red-900/40 hover:bg-red-900/50 text-red-300 font-bold p-2.5 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400"/>
          </button>
        </div>
      </header>

      {/* WISHLIST DRAWER RESPONSIVE */}
      {showWishlistDrawer && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-neutral-900 border-l border-neutral-800 h-full p-4 sm:p-6 flex flex-col justify-between shadow-2xl">
            <div className="flex flex-col gap-6 h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4"/> Mi Wishlist / Intereses
                </h3>
                <button onClick={() => setShowWishlistDrawer(false)} className="text-neutral-400 hover:text-white bg-neutral-800 p-1.5 rounded-xl cursor-pointer">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                {wishlist.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-10">Tu wishlist está vacía.</p>
                ) : (
                  wishlist.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex flex-col gap-3 bg-neutral-950 p-3 sm:p-4 rounded-2xl border border-neutral-800">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={item.url} alt={item.name} className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl bg-neutral-900 border border-neutral-800" />
                          <div>
                            <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                            <span className="text-[11px] text-amber-400 font-black">{item.price}</span>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveFromWishlist(item.id, item.selectedSize)} className="text-neutral-500 hover:text-red-400 text-xs">✕</button>
                      </div>

                      {item.storeUrl && (
                        <a
                          href={item.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs py-2 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
                        >
                          <span>Comprar en Tienda Externa</span>
                          <ExternalLink className="w-3.5 h-3.5"/>
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPONENTES PRINCIPALES */}
      <div className="w-full max-w-6xl flex flex-col gap-6">
        <VirtualTryOnCam onAddToCart={handleAddToCart} wardrobe={wardrobe} />
        <WardrobeManager 
          onAddToCart={handleAddToCart} 
          onRemoveGarment={handleRemoveGarment} 
          onToggleFavorite={handleToggleFavorite} 
          userRole={currentUser?.role} 
          wardrobe={wardrobe} 
        />
      </div>

    </main>
  );
}