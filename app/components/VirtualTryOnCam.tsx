'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Sparkles, Loader2, ZoomIn, ZoomOut, Target, AlertTriangle } from 'lucide-react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { Garment } from '../page';

interface VirtualTryOnCamProps {
  wardrobe: Garment[];
}

export default function VirtualTryOnCam({ wardrobe = [] }: VirtualTryOnCamProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const poseDetectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const animationFrameId = useRef<number>();

  const topsList = wardrobe.filter(i => i?.category === 'tops');
  const bottomsList = wardrobe.filter(i => i?.category === 'bottoms');

  const [selectedTop, setSelectedTop] = useState<Garment | null>(topsList[0] || null);
  const [selectedBottom, setSelectedBottom] = useState<Garment | null>(bottomsList[0] || null);
  
  const [detectorLoading, setDetectorLoading] = useState(false);
  const [detectorError, setDetectorError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const [poseData, setPoseData] = useState({
    leftShoulder: { x: 0, y: 0 },
    rightShoulder: { x: 0, y: 0 },
    leftHip: { x: 0, y: 0 },
    rightHip: { x: 0, y: 0 },
    isDetected: false,
  });

  const [zoom, setZoom] = useState(1);

  // Inicializar detector MoveNet
  const initializeDetector = useCallback(async () => {
    setDetectorLoading(true);
    setDetectorError(null);
    try {
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig: poseDetection.MoveNetModelConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      poseDetectorRef.current = await poseDetection.createDetector(model, detectorConfig);
      console.log("MoveNet Detector inicializado con éxito.");
    } catch (err) {
      console.error("Error al iniciar MoveNet:", err);
      setDetectorError("No se pudo cargar el motor de IA de postura.");
    } finally {
      setDetectorLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        initializeDetector();
      }
    } catch (err) {
      console.error("Error de cámara:", err);
      setDetectorError("Permite el acceso a la cámara web en tu navegador.");
    }
  }, [initializeDetector]);

  const detectPose = useCallback(async () => {
    if (!videoRef.current || !poseDetectorRef.current || videoRef.current.readyState < 2) {
      animationFrameId.current = requestAnimationFrame(detectPose);
      return;
    }

    try {
      const poses = await poseDetectorRef.current.estimatePoses(videoRef.current, { flipHorizontal: false });
      
      if (poses.length > 0 && poses[0].keypoints) {
        const keypoints = poses[0].keypoints;
        
        const leftS = keypoints[5];
        const rightS = keypoints[6];
        const leftH = keypoints[11];
        const rightH = keypoints[12];

        if (leftS && rightS && leftS.score! > 0.3 && rightS.score! > 0.3) {
          setPoseData({
            leftShoulder: { x: leftS.x, y: leftS.y },
            rightShoulder: { x: rightS.x, y: rightS.y },
            leftHip: leftH ? { x: leftH.x, y: leftH.y } : { x: leftS.x, y: leftS.y + 150 },
            rightHip: rightH ? { x: rightH.x, y: rightH.y } : { x: rightS.x, y: rightS.y + 150 },
            isDetected: true,
          });
        } else {
          setPoseData(prev => ({ ...prev, isDetected: false }));
        }
      }
    } catch (err) {
      console.error("Error estimando pose:", err);
    }

    animationFrameId.current = requestAnimationFrame(detectPose);
  }, []);

  useEffect(() => {
    if (cameraActive && !detectorLoading) {
      detectPose();
    }
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [cameraActive, detectPose, detectorLoading]);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      if (poseDetectorRef.current) {
        poseDetectorRef.current.dispose();
      }
    };
  }, [startCamera]);

  const shoulderWidth = Math.abs(poseData.rightShoulder.x - poseData.leftShoulder.x);
  const torsoHeight = Math.abs(((poseData.leftHip.y + poseData.rightHip.y) / 2) - ((poseData.leftShoulder.y + poseData.rightShoulder.y) / 2));
  const torsoCenterX = (poseData.leftShoulder.x + poseData.rightShoulder.x) / 2;

  const getTopStyle = () => {
    if (!poseData.isDetected || !selectedTop) return { display: 'none' };
    const baseWidth = 200;
    const calculatedWidth = shoulderWidth * 1.4;
    const scale = (calculatedWidth / baseWidth) * zoom;

    return {
      position: 'absolute' as 'absolute',
      left: `${torsoCenterX}px`,
      top: `${(poseData.leftShoulder.y + poseData.rightShoulder.y) / 2}px`,
      width: `${baseWidth}px`,
      transform: `translate(-50%, -12%) scale(${scale})`,
      zIndex: 10,
      opacity: 0.95,
      pointerEvents: 'none' as 'pointer-events',
      transition: 'all 0.1s ease-out'
    };
  };

  const getBottomStyle = () => {
    if (!poseData.isDetected || !selectedBottom) return { display: 'none' };
    const hipLineY = (poseData.leftHip.y + poseData.rightHip.y) / 2;
    const hipCenterX = (poseData.leftHip.x + poseData.rightHip.x) / 2;
    const baseHeight = 350;
    const calculatedHeight = Math.max(torsoHeight * 1.8, 150);
    const scaleY = (calculatedHeight / baseHeight) * zoom;
    const hipWidth = Math.abs(poseData.rightHip.x - poseData.leftHip.x);
    const scaleX = ((hipWidth * 1.3) / 160) * zoom;

    return {
      position: 'absolute' as 'absolute',
      left: `${hipCenterX}px`,
      top: `${hipLineY}px`,
      width: '160px',
      transform: `translate(-50%, -5%) scaleX(${scaleX}) scaleY(${scaleY})`,
      zIndex: 9,
      opacity: 0.95,
      pointerEvents: 'none' as 'pointer-events',
      transition: 'all 0.1s ease-out'
    };
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 animate-fadeIn">
      <div className="bg-neutral-900/80 border border-neutral-800 p-6 rounded-3xl backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" /> Probador Virtual con IA (MoveNet)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Colócate frente a la cámara; el sistema detecta tus hombros y caderas en tiempo real.</p>
        </div>
        <div className="flex items-center gap-3 bg-neutral-800 p-2 rounded-xl">
            <button onClick={() => setZoom(z => Math.max(0.7, z - 0.1))} className="p-2 rounded-lg bg-neutral-900 hover:bg-black text-neutral-300 cursor-pointer"><ZoomOut className="w-4 h-4"/></button>
            <span className="text-xs font-bold text-white tabular-nums w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.4, z + 0.1))} className="p-2 rounded-lg bg-neutral-900 hover:bg-black text-neutral-300 cursor-pointer"><ZoomIn className="w-4 h-4"/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 relative bg-neutral-950 border border-neutral-800 rounded-3xl p-4 flex flex-col items-center justify-center aspect-[16/9] sm:h-[650px] overflow-hidden shadow-2xl">
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover rounded-2xl -scale-x-100"
          />
          
          <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-opacity duration-300 ${poseData.isDetected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
            <Target className="w-4 h-4" />
            {poseData.isDetected ? "Postura Sincronizada" : (detectorLoading ? "Cargando Motor IA..." : "Buscando cuerpo...")}
          </div>

          {detectorError && (
            <div className="absolute bottom-6 left-6 right-6 bg-red-950/80 border border-red-500/50 p-3 rounded-xl text-red-200 text-xs text-center z-20 flex items-center gap-2 justify-center">
              <AlertTriangle className="w-4 h-4"/> {detectorError}
            </div>
          )}

          {cameraActive && (
            <>
              <div style={getTopStyle()}>
                <img src={selectedTop?.url} alt="Top" className="w-full h-auto object-contain drop-shadow-2xl rounded-xl"/>
              </div>
              <div style={getBottomStyle()}>
                <img src={selectedBottom?.url} alt="Bottom" className="w-full h-auto object-contain drop-shadow-2xl rounded-xl"/>
              </div>
            </>
          )}

          {!poseData.isDetected && cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/70 z-10 gap-2">
                <Loader2 className="w-6 h-6 text-amber-300 animate-spin" />
                <span className="text-xs text-neutral-300">Retrocede un poco para que la cámara capte tu torso completo...</span>
            </div>
          )}
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 flex flex-col gap-6 backdrop-blur-xl shadow-2xl">
          <div className="text-xs font-bold text-white border-b border-neutral-800 pb-3">Selección de Prendas</div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">Parte Superior (Top)</label>
              <select 
                value={selectedTop?.id || ''} 
                onChange={(e) => setSelectedTop(topsList.find(i => i.id === e.target.value) || null)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-amber-300 outline-none cursor-pointer"
              >
                <option value="">-- Sin Top --</option>
                {topsList.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">Parte Inferior (Bottom)</label>
              <select 
                value={selectedBottom?.id || ''} 
                onChange={(e) => setSelectedBottom(bottomsList.find(i => i.id === e.target.value) || null)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-amber-300 outline-none cursor-pointer"
              >
                <option value="">-- Sin Bottom --</option>
                {bottomsList.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mt-4 text-[10px] text-neutral-400 bg-neutral-950 p-3 rounded-xl leading-relaxed border border-neutral-800">
              💡 **Consejo Profesional:** Sitúate a 1.5 o 2 metros de tu cámara web con buena iluminación para que la red neuronal de IA detecte tus hombros de manera instantánea.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}