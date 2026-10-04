'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VirtualTryOnCam } from './components/VirtualTryOnCam';
import WardrobeManager from './components/WardrobeManager';
import { Plus, LogOut, UserCheck, X, Mail, Crown, Store, ShoppingBag, CreditCard, CheckCircle2, Building2, Phone, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';

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
  // Datos del tercero/vendedor exigidos para el Módulo 7 y ZAP
  vendorName?: string;
  vendorContact?: string;
}

export interface CartItem extends Garment {
  quantity: number;
}

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string; contact?: string } | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const [wardrobe, setWardrobe] = useState<Garment[]>([
    {
      id: '1',
      name: 'Top Estilo Corset Urbano',
      category: 'tops',
      vibe: 'Streetwear',
      url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80',
      favorite: true,
      price: '$45.000 COP',
      storeUrl: 'https://co.shein.com',
      description: 'Prenda de estudio en alta resolución con silueta limpia para probador virtual de precisión.',
      vendorName: 'RËVA Studio Official',
      vendorContact: '+57 300 1234567'
    },
    {
      id: '2',
      name: 'Chaqueta Bomber Oversize',
      category: 'outerwear',
      vibe: 'Casual',
      url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&auto=format&fit=crop&q=80',
      favorite: true,
      price: '$120.000 COP',
      storeUrl: 'https://co.shein.com',
      description: 'Chaqueta estilo urbano colombiano con texturas definidas y aislamiento ligero.',
      vendorName: 'Urbanwear Col S.A.S',
      vendorContact: 'NIT 900.888.777-1'
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
  
  // Campos obligatorios de Tercero / Vendedor para el Módulo 7 y análisis ZAP
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
      // Auto-llenar con los datos del usuario si es SELLER
      if (parsedUser.role === 'SELLER') {
        setNewVendorName(parsedUser.name || '');
        setNewVendorContact(parsedUser.contact || parsedUser.email);
      }
    } catch (e) {
      router.push('/login');
    }
    setLoadingSession(false);
  }, [router]);

  const removeBackgroundFromImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  };

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
    if (currentUser?.role === 'USER') {
      alert('Acceso denegado: Los clientes estándar no tienen permisos para subir prendas.');
      return;
    }

    if (!newName.trim() || !newSource.trim() || !newVendorName.trim() || !newVendorContact.trim()) {
      alert('Por favor complete los campos obligatorios, incluyendo el Nombre del Vendedor y su Número de Contacto / NIT.');
      return;
    }

    setIsProcessingBg(true);
    const processedUrl = await removeBackgroundFromImage(newSource);

    const newGarment: Garment = {
      id: Date.now().toString(),
      name: newName,
      category: newCategory,
      vibe: newVibe,
      url: processedUrl,
      favorite: false,
      price: newPrice || '$50.000 COP',
      storeUrl: newStoreUrl || 'https://co.shein.com',
      description: newDescription || 'Prenda ofrecida por vendedor tercero registrado.',
      vendorName: newVendorName,
      vendorContact: newVendorContact
    };

    setWardrobe(prev => [newGarment, ...prev]);
    setNewName('');
    setNewSource('');
    setNewPrice('');
    setNewStoreUrl('');
    setNewDescription('');
    setIsProcessingBg(false);
    setShowAddModal(false);
  };

  const handleToggleFavorite = (id: string) => {
    setWardrobe(prev =>
      prev.map(item => (item.id === id ? { ...item, favorite: !item.favorite } : item))
    );
  };

  const handleRemoveGarment = (id: string) => {
    setWardrobe(prev => prev.filter(item => item.id !== id));
  };

  const handleAddToCart = (garment: Garment) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === garment.id);
      if (existing) {
        return prev.map(item => item.id === garment.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...garment, quantity: 1 }];
    });
    setShowCartDrawer(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const numericPrice = parseInt(item.price?.replace(/[^0-9]/g, '') || '0', 10);
      return total + numericPrice * item.quantity;
    }, 0);
  };

  const handleProcessCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
      setCart([]);
    }, 1500);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-neutral-950 text-amber-400 flex items-center justify-center font-bold tracking-widest text-sm animate-pulse">
        CARGANDO ENTORNO RËVA (ZAP AUDIT READY)...
      </div>
    );
  }

  const getRoleBadgeStyle = (role?: string) => {
    if (role === 'ADMIN') return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (role === 'SELLER') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    return 'bg-amber-400/10 text-amber-400 border-amber-400/30';
  };

  const getRoleIcon = (role?: string) => {
    if (role === 'ADMIN') return <Crown className="w-3.5 h-3.5 text-purple-400" />;
    if (role === 'SELLER') return <Store className="w-3.5 h-3.5 text-emerald-400" />;
    return <UserIcon className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center p-4 sm:p-8 gap-8 selection:bg-amber-400 selection:text-neutral-950">
      
      {/* Cabecera Prémium con perfil y carrito */}
      <header className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 p-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur opacity-30 animate-pulse"></div>
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-lg text-xl tracking-wider">
              R
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-black tracking-widest text-white">RËVA</h1>
              <span className={`border text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${getRoleBadgeStyle(currentUser?.role)}`}>
                {getRoleIcon(currentUser?.role)} {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">Bienvenido(a), <span className="text-neutral-200 font-semibold">{currentUser?.name || currentUser?.email}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="relative bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-amber-400/50 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Carrito</span>
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-neutral-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowProfileModal(true)}
            className="group bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-amber-400/50 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Mi Perfil y Contacto
          </button>

          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SELLER') && (
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer shadow-xl shadow-amber-400/20"
            >
              <Plus className="w-4 h-4" /> Registrar Prenda Tercero
            </button>
          )}

          <button
            onClick={() => {
              localStorage.removeItem('user_session');
              router.push('/login');
            }}
            className="bg-red-950/30 border border-red-900/40 hover:bg-red-900/50 text-red-300 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" /> Salir
          </button>
        </div>
      </header>

      {/* MODAL DE PERFIL Y DATOS DE CONTACTO (Funcionalidad clave solicitada) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-2xl flex flex-col gap-6 relative">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Detalles de Perfil y Contacto Comercial
              </h3>
              <button onClick={() => setShowProfileModal(false)} className="text-neutral-400 hover:text-white bg-neutral-800 p-1.5 rounded-xl cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black text-2xl">
                {currentUser?.name?.charAt(0).toUpperCase() || 'R'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white">{currentUser?.name || 'Usuario RËVA'}</span>
                <span className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-amber-400" /> {currentUser?.email}
                </span>
                <span className="text-xs text-neutral-300 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> {currentUser?.contact || 'No registrado (Actualizar en registro)'}
                </span>
                <span className={`mt-2 inline-flex items-center self-start border text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase gap-1 ${getRoleBadgeStyle(currentUser?.role)}`}>
                  {getRoleIcon(currentUser?.role)} {currentUser?.role}
                </span>
              </div>
            </div>

            <div className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-2xl text-[11px] text-neutral-400 space-y-1.5">
              <p className="font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Estado de Cuenta y Trazabilidad (Módulo 7)
              </p>
              <p>Tu rol actual te permite interactuar con el catálogo. Si eres Vendedor/Tercero, tus productos publicados mostrarán automáticamente tu nombre de tienda y contacto para auditorías con OWASP ZAP.</p>
            </div>

            <button onClick={() => setShowProfileModal(false)} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-2xl transition cursor-pointer">
              Cerrar Ventana
            </button>
          </div>
        </div>
      )}

      {/* DRAWER DEL CARRITO Y CHECKOUT */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div className="flex flex-col gap-6 h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Carrito y Checkout (ZAP Target)
                </h3>
                <button onClick={() => setShowCartDrawer(false)} className="text-neutral-400 hover:text-white bg-neutral-800 p-1.5 rounded-xl cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {checkoutSuccess ? (
                <div className="my-auto text-center flex flex-col items-center gap-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                  <h4 className="text-sm font-bold text-white">¡Transacción Registrada!</h4>
                  <p className="text-xs text-neutral-400">Orden de compra procesada correctamente.</p>
                  <button onClick={() => setCheckoutSuccess(false)} className="mt-4 px-6 py-2.5 bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl cursor-pointer">
                    Nueva Compra
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="my-auto text-center flex flex-col items-center gap-2 text-neutral-500">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                  <p className="text-xs">Tu carrito está vacío.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                      <div className="flex items-center gap-3">
                        <img src={item.url} alt={item.name} className="w-12 h-12 object-cover rounded-xl bg-neutral-900" />
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                          <span className="text-[11px] text-amber-400 font-bold">{item.price}</span>
                          <span className="text-[10px] text-neutral-500 block">Vendedor: {item.vendorName || 'RËVA'}</span>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-400 hover:text-red-300 p-2 text-xs cursor-pointer">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!checkoutSuccess && cart.length > 0 && (
              <div className="border-t border-neutral-800 pt-4 flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400 text-xs">Total:</span>
                  <span className="text-amber-400 font-black">${calculateTotal().toLocaleString()} COP</span>
                </div>
                <button
                  onClick={handleProcessCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  {isCheckingOut ? 'Validando pasarela...' : 'Simular Pago Seguro'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR PRENDA (TERCEROS / VENDEDORES - MÓDULO 7) */}
      {showAddModal && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SELLER') && (
        <form onSubmit={handleAddGarment} className="w-full max-w-xl bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex flex-col gap-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Publicar Producto (Terceros / Vendedores)
            </h3>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-xs text-neutral-400 hover:text-white bg-neutral-800 px-2.5 py-1 rounded-lg cursor-pointer">
              ✕ Cerrar
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Nombre de la Prenda" value={newName} onChange={e => setNewName(e.target.value)} className="bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400" required />
            <input type="text" placeholder="Precio (Ej: $75.000 COP)" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none" required />
          </div>

          {/* Campos obligatorios del tercero para la regla solicitada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Nombre del Vendedor / Tienda" value={newVendorName} onChange={e => setNewVendorName(e.target.value)} className="bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400" required />
            <input type="text" placeholder="Número de Contacto / NIT del Vendedor" value={newVendorContact} onChange={e => setNewVendorContact(e.target.value)} className="bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400" required />
          </div>

          {/* Enlace de tienda externa mantenido intacto */}
          <input type="url" placeholder="Enlace externo de compra (Ej: https://...)" value={newStoreUrl} onChange={e => setNewStoreUrl(e.target.value)} className="bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none" />

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-neutral-400">Imagen de la prenda (Subir o URL):</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-neutral-950 cursor-pointer" />
            <input type="url" placeholder="O pega la URL de la imagen aquí" value={newSource} onChange={e => setNewSource(e.target.value)} className="bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none" />
          </div>

          <button type="submit" disabled={isProcessingBg} className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2">
            {isProcessingBg ? 'Procesando con auto-recorte...' : <><Plus className="w-4 h-4" /> Publicar Prenda Comercial</>}
          </button>
        </form>
      )}

      {/* Probador virtual y cámara */}
      <VirtualTryOnCam wardrobe={wardrobe} />

      {/* Gestor de Armario (Muestra Favoritos, Enlaces de tienda externos y Datos de Terceros) */}
      <WardrobeManager 
        wardrobe={wardrobe} 
        onToggleFavorite={handleToggleFavorite} 
        onRemoveGarment={handleRemoveGarment}
        onAddToCart={handleAddToCart}
        userRole={currentUser?.role}
      />

    </main>
  );
}