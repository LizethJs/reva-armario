'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Garment } from '../page';
import { Camera, CameraOff, Sparkles, RefreshCw, Ruler, Move, Wand2 } from 'lucide-react';
import { cleanImageBackground } from '../utils/imageCleaner';

interface VirtualTryOnCamProps {
  wardrobe: Garment[];
  onAddToCart: (garment: Garment, size: 'S' | 'M' | 'L' | 'XL') => void;
}

export function VirtualTryOnCam({ wardrobe, onAddToCart }: VirtualTryOnCamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(wardrobe[0] || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Talla y URL de la prenda procesada
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL'>('M');
  const [processedGarmentUrl, setProcessedGarmentUrl] = useState<string>('');
  const [isCleaning, setIsCleaning] = useState(false);
  
  // Seguimiento dinámico del torso
  const [torsoPosition, setTorsoPosition] = useState({ top: 62, left: 50 });

  // Al cambiar de prenda, cargamos la original por defecto
  useEffect(() => {
    if (selectedGarment) {
      setProcessedGarmentUrl(selectedGarment.url);
    }
  }, [selectedGarment]);

  // Función para ejecutar la limpieza por botón
  const handleCleanBackground = async () => {
    if (!selectedGarment) return;
    setIsCleaning(true);
    try {
      const cleaned = await cleanImageBackground(selectedGarment.url);
      setProcessedGarmentUrl(cleaned);
    } catch (err) {
      console.error("Error al limpiar fondo:", err);
    } finally {
      setIsCleaning(false);
    }
  };

  // Seguimiento corporal fluido en tiempo real
  const trackBodyMovement = useCallback(() => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = 120;
      canvas.height = 90;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;

      let sumX = 0;
      let sumY = 0;
      let count = 0;

      const startX = Math.floor(canvas.width * 0.25);
      const endX = Math.floor(canvas.width * 0.75);
      const startY = Math.floor(canvas.height * 0.2);
      const endY = Math.floor(canvas.height * 0.65);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * canvas.width + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          if (brightness > 40 && brightness < 210) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      }

      if (count > 80) {
        const avgX = sumX / count;
        const avgY = sumY / count;
        const targetLeft = 50 + ((avgX / canvas.width) - 0.5) * 50;
        const targetTop = 62 + ((avgY / canvas.height) - 0.5) * 25;

        setTorsoPosition(prev => ({
          left: prev.left + (targetLeft - prev.left) * 0.2,
          top: prev.top + (targetTop - prev.top) * 0.2,
        }));
      }
    }
  }, [isCameraActive]);

  useEffect(() => {
    let animationId: number;
    const loop = () => {
      trackBodyMovement();
      animationId = requestAnimationFrame(loop);
    };
    if (isCameraActive) animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [isCameraActive, trackBodyMovement]);

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta el acceso a la cámara web.");
      }
      let stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: mode },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error("Error de cámara:", err);
      setCameraError("Permiso de cámara denegado o dispositivo ocupado.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (isCameraActive) startCamera(newMode);
  };

  const getSizeScale = () => {
    switch (selectedSize) {
      case 'S': return 0.82;
      case 'M': return 1.0;
      case 'L': return 1.18;
      case 'XL': return 1.36;
      default: return 1.0;
    }
  };

  const isBottom = selectedGarment?.category === 'bottoms';
  const scaleMultiplier = getSizeScale();
  const finalTopPosition = isBottom ? 76 : torsoPosition.top;

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  return (
    <div className="w-full max-w-6xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <h2 className="text-sm font-black tracking-widest text-amber-400 uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Probador AR Profesional - RËVA
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Prueba prendas, limpia fondos con un clic y ajusta tu talla ideal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botón de Limpieza Mágica de Fondo */}
          <button 
            onClick={handleCleanBackground}
            disabled={isCleaning}
            className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
            title="Quitar fondo blanco o de tienda de la imagen"
          >
            <Wand2 className={`w-4 h-4 ${isCleaning ? 'animate-spin' : ''}`} /> 
            {isCleaning ? 'Limpiando...' : 'Quitar Fondo'}
          </button>

          {/* Selector de Talla (S, M, L, XL) */}
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-2xl p-1 text-xs">
            <span className="px-2.5 text-neutral-400 font-bold flex items-center gap-1"><Ruler className="w-3.5 h-3.5 text-amber-400"/> Talla:</span>
            {(['S', 'M', 'L', 'XL'] as const).map(sz => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-2.5 py-1 rounded-xl font-extrabold transition cursor-pointer ${selectedSize === sz ? 'bg-amber-400 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'}`}
              >
                {sz}
              </button>
            ))}
          </div>

          {!isCameraActive ? (
            <button onClick={() => startCamera(facingMode)} className="bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg">
              <Camera className="w-4 h-4" /> Activar Cámara
            </button>
          ) : (
            <button onClick={stopCamera} className="bg-red-950/40 border border-red-900/50 hover:bg-red-900/50 text-red-300 font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer">
              <CameraOff className="w-4 h-4 text-red-400" /> Apagar
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="bg-red-950/30 border border-red-900/40 text-red-300 p-4 rounded-2xl text-xs text-center font-medium">
          {cameraError}
        </div>
      )}

      {/* Visor con Cámara y Prenda */}
      <div className="relative w-full aspect-video sm:aspect-[21/9] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center shadow-inner">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-100' : ''} transition-opacity duration-500 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950/80 backdrop-blur-sm p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shadow-xl">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Cámara en espera de activación</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Activa la cámara para probarte la ropa en tiempo real.</p>
            </div>
          </div>
        )}

        {/* Prenda superpuesta */}
        {isCameraActive && selectedGarment && (
          <div 
            className="absolute pointer-events-none transition-all duration-75 ease-out flex items-center justify-center"
            style={{
              top: `${finalTopPosition}%`,
              left: `${torsoPosition.left}%`,
              transform: `translate(-50%, -50%) scale(${scaleMultiplier})`
            }}
          >
            <div className="relative w-72 sm:w-96 h-80 sm:h-[420px] flex items-center justify-center">
              <img
                src={processedGarmentUrl}
                alt={selectedGarment.name}
                className="max-w-full max-h-full object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)]"
              />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-neutral-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/40 text-[10px] text-amber-400 font-bold whitespace-nowrap shadow-lg flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-amber-400" /> {selectedGarment.name} • Talla {selectedSize}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selector de prendas y botón directo para añadir al carrito */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Selecciona prenda del armario:</span>
          {selectedGarment && (
            <button
              onClick={() => onAddToCart(selectedGarment, selectedSize)}
              className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-500/40 text-xs font-extrabold px-4 py-1.5 rounded-xl transition cursor-pointer"
            >
              + Añadir Talla {selectedSize} al Carrito (${selectedGarment.price || 50})
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {wardrobe.map(garment => (
            <button
              key={garment.id}
              onClick={() => setSelectedGarment(garment)}
              className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all shrink-0 cursor-pointer ${
                selectedGarment?.id === garment.id
                  ? 'bg-amber-400/10 border-amber-400 text-white shadow-lg shadow-amber-400/10'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center p-1 border border-neutral-800 overflow-hidden">
                <img src={garment.url} alt={garment.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white max-w-[120px] truncate">{garment.name}</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase">${garment.price || 50}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}