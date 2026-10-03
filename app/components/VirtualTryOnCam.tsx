'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Sparkles, Sliders, RefreshCw, CheckCircle2, VideoOff, CameraOff } from 'lucide-react';
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

  // Estados para la Cámara Web en Vivo
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Iniciar la cámara web
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setCameraError("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
      setIsCameraActive(false);
    }
  };

  // Detener la cámara web
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    // Iniciar cámara automáticamente al montar el componente
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

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
            <Sparkles className="w-5 h-5 text-amber-300" /> Probador Virtual con Cámara en Vivo & IA
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Visualiza cómo te quedan las prendas de tu armario sobre tu transmisión en directo.</p>
        </div>
        <div className="flex items-center gap-2">
          {isCameraActive ? (
            <button 
              onClick={stopCamera}
              className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <CameraOff className="w-3.5 h-3.5" /> Apagar Cámara
            </button>
          ) : (
            <button 
              onClick={startCamera}
              className="px-4 py-2.5 bg-amber-300 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <Camera className="w-3.5 h-3.5" /> Encender Cámara
            </button>
          )}
          <button 
            onClick={handleApplyAiFit}
            className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 border border-neutral-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} /> Auto-Ajustar IA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualizador con Cámara Web real y Prendas Encima */}
        <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-3xl p-4 flex flex-col items-center justify-center relative aspect-[3/4] sm:aspect-auto sm:h-[520px] overflow-hidden shadow-2xl">
          
          {/* Elemento de video de la cámara web */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-w-full inset-h-full w-full h-full object-cover rounded-2xl -scale-x-100 opacity-90"
          />

          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/90 text-neutral-400 gap-3 p-6 text-center z-10">
              <VideoOff className="w-10 h-10 text-amber-300/60" />
              <p className="text-xs">La cámara está desactivada o el navegador no tiene permisos.</p>
              <button 
                onClick={startCamera}
                className="px-4 py-2 bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
              >
                Conectar Cámara
              </button>
            </div>
          )}

          {cameraError && (
            <div className="absolute top-4 left-4 right-4 bg-red-950/80 border border-red-500/50 p-3 rounded-xl text-red-200 text-xs text-center z-20">
              {cameraError}
            </div>
          )}

          {/* Prenda Superior superpuesta */}
          {selectedTop?.url && isCameraActive && (
            <div 
              className="absolute transition-all duration-150 pointer-events-none z-10 flex justify-center items-center"
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale / 100})`,
                top: '22%',
                width: '180px'
              }}
            >
              <img 
                src={selectedTop.url} 
                alt="Top Try On" 
                className="w-full h-44 object-cover rounded-2xl shadow-2xl border-2 border-amber-300/60 bg-neutral-900/40 backdrop-blur-xs" 
              />
            </div>
          )}

          {/* Prenda Inferior superpuesta */}
          {selectedBottom?.url && isCameraActive && (
            <div 
              className="absolute transition-all duration-150 pointer-events-none z-10 flex justify-center items-center"
              style={{
                transform: `translate(${offsetX}px, ${offsetY + 130}px) scale(${scale / 100})`,
                top: '46%',
                width: '160px'
              }}
            >
              <img 
                src={selectedBottom.url} 
                alt="Bottom Try On" 
                className="w-full h-44 object-cover rounded-2xl shadow-2xl border-2 border-amber-300/60 bg-neutral-900/40 backdrop-blur-xs" 
              />
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 bg-neutral-900/80 border border-neutral-700/60 p-3 rounded-2xl backdrop-blur-md flex justify-between items-center text-xs text-neutral-200 z-20">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold"><CheckCircle2 className="w-4 h-4" /> Calibrador en Vivo Activo</span>
            <span>Zoom: {scale}%</span>
          </div>
        </div>

        {/* Panel de Controles y Selector de Prendas para probar */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 flex flex-col gap-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-neutral-800 pb-3">
            <Sliders className="w-4 h-4 text-amber-300" /> Controles & Selección de Ropa
          </div>

          <div className="flex flex-col gap-4">
            {/* Selector de parte Superior */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">Prenda Superior (Top)</label>
              <select 
                value={selectedTop?.id || ''} 
                onChange={(e) => {
                  const found = safeWardrobe.find(i => i.id === e.target.value);
                  setSelectedTop(found || null);
                }}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-300 outline-none"
              >
                <option value="">-- Sin Top --</option>
                {topsList.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.brand})</option>
                ))}
              </select>
            </div>

            {/* Selector de parte Inferior */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">Prenda Inferior (Bottom)</label>
              <select 
                value={selectedBottom?.id || ''} 
                onChange={(e) => {
                  const found = safeWardrobe.find(i => i.id === e.target.value);
                  setSelectedBottom(found || null);
                }}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-300 outline-none"
              >
                <option value="">-- Sin Bottom --</option>
                {bottomsList.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.brand})</option>
                ))}
              </select>
            </div>

            <hr className="border-neutral-800 my-1" />

            {/* Sliders de Zoom y Posición */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-300 font-semibold">
                <span>Escala / Zoom Prenda</span>
                <span>{scale}%</span>
              </div>
              <input 
                type="range" 
                min="70" 
                max="150" 
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
                min="-80" 
                max="80" 
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
                min="-60" 
                max="60" 
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