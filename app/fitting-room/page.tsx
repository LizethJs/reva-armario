"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getGarments } from "../actions/garments";

export default function FittingRoomPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [garments, setGarments] = useState<any[]>([]);
  const [selectedGarment, setSelectedGarment] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loadingGarments, setLoadingGarments] = useState(true);

  useEffect(() => {
    loadGarmentsList();
  }, []);

  async function loadGarmentsList() {
    setLoadingGarments(true);
    const res = await getGarments();
    if (res.success && res.garments) {
      setGarments(res.garments);
      if (res.garments.length > 0) {
        setSelectedGarment(res.garments[0]);
      }
    }
    setLoadingGarments(false);
  }

  // Iniciar la cámara web para la detección de pose
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      alert("No se pudo acceder a la cámara. Verifica los permisos en el navegador.");
    }
  };

  // Detener la cámara web
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-neutral-900 p-6 rounded-2xl border border-neutral-800 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-amber-400">
              PROBADOR VIRTUAL RËVA
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Superposición de prendas 3D y estimación de medidas en tiempo real
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/wardrobe")}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl text-xs transition"
            >
              Ir al Armario
            </button>
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-xs transition shadow-lg"
              >
                Activar Cámara
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold rounded-xl text-xs transition"
              >
                Detener Cámara
              </button>
            )}
          </div>
        </div>

        {/* ÁREA PRINCIPAL: CANVAS Y SELECCIÓN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* VISUALIZADOR DE CÁMARA / PROBADOR */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-4 flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden">
            <video
              ref={videoRef}
              className={`rounded-2xl w-full max-w-[640px] h-[480px] object-cover ${
                !isCameraActive ? "hidden" : "block"
              }`}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className={`absolute w-full max-w-[640px] h-[480px] pointer-events-none ${
                !isCameraActive ? "hidden" : "block"
              }`}
            />

            {!isCameraActive && (
              <div className="text-center space-y-3 p-8">
                <div className="w-16 h-16 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-amber-400 font-bold text-xl">
                  📷
                </div>
                <h3 className="text-sm font-bold text-white">Cámara Inactiva</h3>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Haz clic en "Activar Cámara" para iniciar la superposición virtual de la prenda seleccionada.
                </p>
              </div>
            )}
          </div>

          {/* CATALOGO LATERAL DE SELECCIÓN */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-4">
                Prenda Seleccionada
              </h2>

              {loadingGarments ? (
                <p className="text-xs text-neutral-500">Cargando prendas...</p>
              ) : garments.length === 0 ? (
                <p className="text-xs text-neutral-400">No hay prendas disponibles en el armario.</p>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center gap-3">
                    {selectedGarment?.url && (
                      <img
                        src={selectedGarment.url}
                        alt={selectedGarment.name}
                        className="w-16 h-16 object-cover rounded-xl border border-neutral-800"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedGarment?.name}</h4>
                      <p className="text-[10px] text-amber-400 font-semibold">{selectedGarment?.price}</p>
                      <span className="text-[9px] uppercase bg-neutral-800 px-2 py-0.5 rounded text-neutral-300 mt-1 inline-block">
                        {selectedGarment?.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-neutral-400 pt-2">Cambiar Prenda:</h3>
                  <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {garments.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGarment(g)}
                        className={`p-1 rounded-xl border transition overflow-hidden ${
                          selectedGarment?.id === g.id
                            ? "border-amber-400 bg-amber-400/10"
                            : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                        }`}
                      >
                        <img src={g.url} alt={g.name} className="w-full h-14 object-cover rounded-lg" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedGarment?.storeUrl && (
              <a
                href={selectedGarment.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold rounded-xl text-xs text-center transition block mt-4 border border-neutral-700"
              >
                Ver en Tienda Oficial ↗
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}