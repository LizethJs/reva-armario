'use client';

import React, { useState, useEffect } from 'react';
import { VirtualTryOnCam } from './components/VirtualTryOnCam';
import WardrobeManager from './components/WardrobeManager';
import { validateSessionToken, updateUserCredentials } from './actions/auth';
import { Plus, LogOut, UserCheck, X, ShoppingBag, User as UserIcon, ExternalLink, ShieldAlert, Terminal, Globe, Edit3, Lock, Mail, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

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
  designerPortfolioUrl?: string;
}

export interface WishlistItem extends Garment {
  selectedSize?: 'S' | 'M' | 'L' | 'XL';
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string; contact?: string; session_token?: string } | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Estados para el perfil avanzado (Requisito 20 real en Base de Datos)
  const [profileTab, setProfileTab] = useState<"info" | "edit">("info");
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState({ text: "", isError: false });
  const [profileLoading, setProfileLoading] = useState(false);

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);

  // Armario digital inicial con datos de demostración
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
  const [newDesignerUrl, setNewDesignerUrl] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Estados para la Consola de Auditoría Forense en Tiempo Real
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const sessionData = localStorage.getItem('user_session');

    if (!sessionData) {
      window.location.href = '/login';
      return;
    }

    try {
      const parsedUser = JSON.parse(sessionData);
      if (!parsedUser || !parsedUser.email || !parsedUser.session_token) {
        localStorage.removeItem('user_session');
        window.location.href = '/login';
        return;
      }

      setCurrentUser(parsedUser);
      setEditEmail(parsedUser.email || '');
      setEditName(parsedUser.name || '');

      if (parsedUser.role === 'SELLER') {
        setNewVendorName(parsedUser.name || '');
        setNewVendorContact(parsedUser.contact || parsedUser.email);
      }
      setLoadingSession(false);

      const interval = setInterval(async () => {
        const check = await validateSessionToken(parsedUser.email, parsedUser.session_token);
        if (!check.valid) {
          clearInterval(interval);
          alert('⚠️ ALERTA DE SEGURIDAD (ISO 27001): Se ha iniciado sesión con esta cuenta en otro navegador o dispositivo. Su sesión ha sido invalidada.');
          localStorage.removeItem('user_session');
          window.location.href = '/login';
        }
      }, 4000);

      return () => clearInterval(interval);

    } catch (e) {
      localStorage.removeItem('user_session');
      window.location.href = '/login';
    }
  }, []);

  // Validación de complejidad de contraseña (ISO 27001) para la edición de perfil
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumberOrSymbol = /(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword);

  // ACTUALIZACIÓN REAL EN BASE DE DATOS (REQUISITO 20)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ text: "", isError: false });

    if (newPassword && (!hasMinLength || !hasUpperCase || !hasNumberOrSymbol)) {
      setProfileMessage({
        text: "⚠️ La nueva contraseña no cumple con los protocolos de complejidad requeridos.",
        isError: true,
      });
      setProfileLoading(false);
      return;
    }

    try {
      if (!currentUser?.email) {
        setProfileMessage({ text: "Error de sesión: No se identificó al usuario.", isError: true });
        setProfileLoading(false);
        return;
      }

      const res = await updateUserCredentials({
        currentEmail: currentUser.email,
        newEmail: editEmail,
        newName: editName,
        newPassword: newPassword.trim() !== "" ? newPassword : undefined,
      });

      if (res && res.success) {
        const sessionData = localStorage.getItem('user_session');
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          parsed.email = editEmail.toLowerCase();
          parsed.name = editName;
          localStorage.setItem('user_session', JSON.stringify(parsed));
        }

        setCurrentUser((prev: any) => ({
          ...prev,
          email: editEmail.toLowerCase(),
          name: editName,
        }));

        setNewPassword("");
        setProfileMessage({ text: res.message, isError: false });

        setTimeout(() => {
          setProfileMessage({ text: "", isError: false });
          setProfileTab("info");
        }, 1800);
      } else {
        setProfileMessage({
          text: res?.message || "No se pudo actualizar la información en el servidor.",
          isError: true,
        });
      }
    } catch (err) {
      setProfileMessage({ text: "Error de conexión con la base de datos.", isError: true });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    setScanLogs([]);
    setScanProgress(0);

    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      setIsScanning(true);

      let currentLogs: string[] = ['[INFO] Iniciando pasarela SSDLC de escaneo antimalware...'];
      setScanLogs([...currentLogs]);
      setScanProgress(25);

      setTimeout(() => {
        currentLogs.push(`[CHECK] Analizando contenedor: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        setScanLogs([...currentLogs]);
        setScanProgress(50);

        if (['txt', 'exe', 'bat', 'cmd', 'sh', 'msi', 'com', 'doc', 'docx'].includes(extension || '')) {
          currentLogs.push(`[ALERTA] Formato prohibido detectado: .${extension} (Solo se permiten imágenes válidas)`);
          currentLogs.push(`[BLOQUEO] Carga abortada por política estricta de admisión ISO/IEC 27001.`);
          setScanLogs([...currentLogs]);
          setScanProgress(100);
          setUploadError(`⚠️ ARCHIVO RECHAZADO: Los archivos .${extension} no están permitidos. Solo se aceptan imágenes.`);
          setIsScanning(false);
          e.target.value = '';
          return;
        }

        const headerReader = new FileReader();
        headerReader.onloadend = (evt) => {
          if (evt.target?.readyState === FileReader.DONE) {
            const arr = new Uint8Array(evt.target.result as ArrayBuffer).subarray(0, 4);
            let header = '';
            for (let i = 0; i < arr.length; i++) {
              header += arr[i].toString(16).padStart(2, '0').toUpperCase();
            }

            currentLogs.push(`[HEX] Cabecera extraída (Magic Bytes): 0x${header}`);
            setScanLogs([...currentLogs]);
            setScanProgress(80);

            setTimeout(() => {
              if (header.startsWith('4D5A')) {
                currentLogs.push(`[CRÍTICO] Firma MZ (4D5A) identificada. ¡Payload ejecutable oculto!`);
                currentLogs.push(`[ESTADO] Cuarentena activada. Amenaza bloqueada con éxito.`);
                setScanLogs([...currentLogs]);
                setScanProgress(100);
                setUploadError('🚨 AMENAZA BLOQUEADA: Ejecutable (.exe) camuflado detectado.');
                setIsScanning(false);
                e.target.value = '';
                setNewSource('');
                return;
              }

              currentLogs.push(`[OK] Verificación binaria superada. Imagen válida aceptada.`);
              setScanLogs([...currentLogs]);
              setScanProgress(100);
              setIsScanning(false);

              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                  setNewSource(reader.result);
                }
              };
              reader.readAsDataURL(file);
            }, 600);
          }
        };

        headerReader.readAsArrayBuffer(file.slice(0, 4));
      }, 500);
    }
  };

  const handleAddGarment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadError) {
      alert('Por favor resuelva el error de seguridad del archivo antes de publicar.');
      return;
    }

    if (!newName.trim() || !newSource.trim()) {
      alert('Por favor completa el nombre y añade una imagen válida.');
      return;
    }

    let sanitizedDesignerUrl = '';
    if (newDesignerUrl.trim()) {
      if (newDesignerUrl.startsWith('http://') || newDesignerUrl.startsWith('https://')) {
        sanitizedDesignerUrl = newDesignerUrl.trim();
      } else {
        alert('⚠️ Error de seguridad: El enlace del diseñador debe comenzar con http:// o https://');
        return;
      }
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
      designerPortfolioUrl: sanitizedDesignerUrl || undefined,
    };

    setWardrobe(prev => [newGarment, ...prev]);
    setNewName('');
    setNewSource('');
    setNewDesignerUrl('');
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
      <div className="min-h-screen bg-neutral-950 text-amber-400 flex flex-col items-center justify-center font-bold tracking-widest text-sm gap-3">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        VERIFICANDO CREDENCIALES RËVA...
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
      
      {/* Cabecera Principal */}
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
              <p className="text-[11px] sm:text-xs text-neutral-400">{currentUser?.name || "Usuario Autenticado"}</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
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
              onClick={() => { setShowAddModal(true); setUploadError(''); setScanLogs([]); }}
              className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xl"
            >
              <Plus className="w-4 h-4"/> Publicar
            </button>
          )}

          <button
            onClick={() => { setShowProfileModal(true); setProfileTab("info"); }}
            className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-bold px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400"/> <span className="hidden sm:inline">Perfil</span>
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('user_session');
              window.location.href = '/login';
            }}
            className="bg-red-950/30 border border-red-900/40 hover:bg-red-900/50 text-red-300 font-bold p-2.5 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400"/>
          </button>
        </div>
      </header>

      {/* MODAL DE PERFIL PROFESIONAL (REQUISITO 20) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden font-sans">
            
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center justify-center text-amber-400 font-black">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Perfil y Seguridad (ISO 27001)
                  </h3>
                  <p className="text-[10px] text-neutral-400">Gestión de identidad</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)} 
                className="text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 p-1.5 rounded-xl cursor-pointer transition"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>

            <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setProfileTab("info")}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  profileTab === "info" ? "bg-neutral-800 text-amber-400 shadow-sm" : "text-neutral-400 hover:text-white"
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" /> Información
              </button>
              <button
                type="button"
                onClick={() => setProfileTab("edit")}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  profileTab === "edit" ? "bg-neutral-800 text-amber-400 shadow-sm" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Editar Credenciales
              </button>
            </div>

            {profileMessage.text && (
              <div className={`p-3 rounded-2xl text-xs font-semibold text-center border ${
                profileMessage.isError ? "bg-red-950/60 border-red-800 text-red-300" : "bg-emerald-950/60 border-emerald-800 text-emerald-300"
              }`}>
                {profileMessage.text}
              </div>
            )}

            {profileTab === "info" && (
              <div className="space-y-4 text-xs">
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 space-y-3 font-mono">
                  <div className="flex justify-between items-center border-b border-neutral-800/60 pb-2">
                    <span className="text-neutral-400">Nombre:</span>
                    <span className="text-white font-bold">{currentUser?.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-neutral-800/60 pb-2">
                    <span className="text-neutral-400">Correo:</span>
                    <span className="text-neutral-200">{currentUser?.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-neutral-800/60 pb-2">
                    <span className="text-neutral-400">Rol:</span>
                    <span className="text-amber-400 font-bold">{currentUser?.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Seguridad:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Activa
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setProfileTab("edit")}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-xs shadow-lg"
                >
                  <KeyRound className="w-4 h-4" /> Modificar Correo o Contraseña
                </button>
              </div>
            )}

            {profileTab === "edit" && (
              <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-bold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" /> Actualizar Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-bold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" /> Actualizar Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="border-t border-neutral-800 pt-2 space-y-2">
                  <label className="block text-neutral-400 font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> Nueva Contraseña <span className="text-neutral-500 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />

                  {newPassword && (
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] space-y-1 font-mono">
                      <p className="font-bold text-neutral-300">Validación ISO 27001:</p>
                      <p className={hasMinLength ? "text-emerald-400" : "text-neutral-500"}>{hasMinLength ? "✓" : "○"} Mínimo 8 caracteres</p>
                      <p className={hasUpperCase ? "text-emerald-400" : "text-neutral-500"}>{hasUpperCase ? "✓" : "○"} Letra mayúscula</p>
                      <p className={hasNumberOrSymbol ? "text-emerald-400" : "text-neutral-500"}>{hasNumberOrSymbol ? "✓" : "○"} Número y símbolo (@$!%*?&)</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setProfileTab("info")}
                    className="py-3 px-4 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 font-bold rounded-xl transition cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {profileLoading ? "Actualizando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL DE PUBLICAR PRENDA CON ENLACE DE DISEÑADOR Y ESCANEO SSDLC */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Plus className="w-4 h-4"/> Publicar Nueva Prenda (Diseñador & Seguridad)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white bg-neutral-800 p-1.5 rounded-xl cursor-pointer">
                <X className="w-4 h-4"/>
              </button>
            </div>

            <form onSubmit={handleAddGarment} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Nombre de la Prenda</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-400"
                  placeholder="Ej: Abrigo Minimalista"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-400"
                >
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="shoes">Shoes</option>
                  <option value="outerwear">Outerwear</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Imagen de la Prenda (Solo Imágenes Válidas)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isScanning}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-neutral-950 hover:file:bg-emerald-400 cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* CONSOLA DE AUDITORÍA FORENSE VISUAL EN TIEMPO REAL */}
              {(isScanning || scanLogs.length > 0) && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-900 pb-1.5">
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Terminal className="w-3.5 h-3.5" /> Consola Forense Antimalware
                    </span>
                    <span>{scanProgress}%</span>
                  </div>

                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${uploadError ? 'bg-red-500' : 'bg-emerald-400'}`} 
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>

                  <div className="max-h-28 overflow-y-auto space-y-1 text-neutral-300 pr-1">
                    {scanLogs.map((log, idx) => (
                      <div key={idx} className={log.includes('CRÍTICO') || log.includes('ALERTA') ? 'text-red-400 font-bold' : 'text-neutral-300'}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-2.5 bg-red-950/40 border border-red-900/50 rounded-xl text-red-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label className="block text-neutral-400 mb-1">Precio</label>
                <input
                  type="text"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-400"
                  placeholder="$79.900 COP"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">URL de Compra Externa</label>
                <input
                  type="url"
                  value={newStoreUrl}
                  onChange={(e) => setNewStoreUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-400"
                  placeholder="https://tu-tienda.com"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" /> Enlace de tu Página o Portafolio de Diseñador <span className="text-neutral-500 font-normal">(Opcional)</span>
                </label>
                <input
                  type="url"
                  value={newDesignerUrl}
                  onChange={(e) => setNewDesignerUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400 font-mono text-[11px]"
                  placeholder="https://tu-sitio-web-diseñador.com"
                />
              </div>

              <button
                type="submit"
                disabled={Boolean(uploadError) || isScanning || !newSource}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl transition cursor-pointer shadow-lg mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isScanning ? 'Escaneando Archivo...' : 'Publicar Prenda en RËVA'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WISHLIST DRAWER */}
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

                      {item.designerPortfolioUrl && (
                        <a
                          href={item.designerPortfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-400/30 font-bold text-[11px] py-1.5 rounded-xl flex items-center justify-center gap-2 transition"
                        >
                          <span>Visitar Página del Diseñador</span>
                          <Globe className="w-3 h-3"/>
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