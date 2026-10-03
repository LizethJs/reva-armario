import React, { useState } from 'react';
import { ChevronLeft, Check, Sparkles, X, Compass, Sliders, Wand2, RefreshCw, Palette, Calendar, MapPin, User, Shirt } from 'lucide-react';
import { OutfitSet, Garment } from '../page';

interface Props {
  outfit: OutfitSet;
  wardrobe: Garment[];
  onOpenOutfit: (outfit: OutfitSet) => void;
  onBack: () => void;
}

export default function OutfitDetailView({ outfit, wardrobe, onOpenOutfit, onBack }: Props) {
  const [selectedOutfitDetail, setSelectedOutfitDetail] = useState<OutfitSet>(outfit);
  const [generatedOutfitOptions, setGeneratedOutfitOptions] = useState<OutfitSet[]>([
    { ...outfit, id: 'opt-1', name: `${outfit.name} (Opción 1)` },
    { ...outfit, id: 'opt-2', name: `${outfit.name} (Opción 2 - Alternativa)` },
    { ...outfit, id: 'opt-3', name: `${outfit.name} (Opción 3 - Minimal)` }
  ]);
  const [studioBackgroundTheme, setStudioBackgroundTheme] = useState<'minimal' | 'runway' | 'cream'>('runway');
  const [aiColorScore, setAiColorScore] = useState<number | null>(null);
  const [showCalendarInOutfit, setShowCalendarInOutfit] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRunColorAnalysis = () => {
    const score = Math.floor(Math.random() * (99 - 88 + 1)) + 88;
    setAiColorScore(score);
    triggerNotification(`🎨 Análisis IA: ¡Armonía cromática excelente (${score}%)!`);
  };

  const handleToggleStudioTheme = () => {
    const themes: ('minimal' | 'runway' | 'cream')[] = ['runway', 'minimal', 'cream'];
    const nextTheme = themes[(themes.indexOf(studioBackgroundTheme) + 1) % themes.length];
    setStudioBackgroundTheme(nextTheme);
    triggerNotification(`✨ Tema cambiado a: ${nextTheme.toUpperCase()}`);
  };

  const handleMixAndMatchRandom = () => {
    const tops = wardrobe.filter(i => i.category === 'tops');
    const bottoms = wardrobe.filter(i => i.category === 'bottoms');
    const shoes = wardrobe.filter(i => i.category === 'shoes');
    
    if (tops.length && bottoms.length) {
      const randomized: OutfitSet = {
        id: 'mix-' + Date.now(),
        name: 'Mix & Match IA Sorpresa',
        vibe: 'Tendencia',
        top: tops[Math.floor(Math.random() * tops.length)],
        bottom: bottoms[Math.floor(Math.random() * bottoms.length)],
        shoes: shoes[Math.floor(Math.random() * shoes.length)],
      };
      setSelectedOutfitDetail(randomized);
      triggerNotification('🎲 ¡Combinación Mix & Match generada!');
    }
  };

  const handleGenerateMultipleOutfits = () => {
    const options: OutfitSet[] = [
      { ...outfit, id: 'opt-1', name: 'Look Ejecutivo (Opción Minimal)' },
      { ...outfit, id: 'opt-2', name: 'Look Ejecutivo (Opción Contraste)' },
      { ...outfit, id: 'opt-3', name: 'Look Ejecutivo (Opción Monocromática)' },
      { ...outfit, id: 'opt-4', name: 'Look Ejecutivo (Opción Noche)' },
      { ...outfit, id: 'opt-5', name: 'Look Ejecutivo (Opción Alta Costura)' },
    ];
    setGeneratedOutfitOptions(options);
    triggerNotification('✨ IA: 5 variantes de estilismo generadas.');
  };

  const getCanvasBackgroundClass = () => {
    switch(studioBackgroundTheme) {
      case 'runway': return 'bg-gradient-to-br from-neutral-50 via-white to-neutral-200 text-neutral-950 border-amber-300/60';
      case 'minimal': return 'bg-neutral-950 text-white border-neutral-800';
      case 'cream': return 'bg-[#fcf8f2] text-neutral-900 border-[#e8dfd1]';
    }
  };

  return (
    <div className="w-full max-w-5xl bg-neutral-900/85 backdrop-blur-2xl border border-neutral-800/80 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col gap-6 relative z-10">
      
      {notification && (
        <div className="fixed top-20 z-50 bg-neutral-900/90 backdrop-blur-xl border border-amber-300/40 text-amber-200 px-4 py-2 rounded-xl text-xs shadow-xl">
          {notification}
        </div>
      )}

      <div className="flex justify-between items-center border-b border-neutral-800/80 pb-4">
        <button onClick={onBack} className="p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-full transition flex items-center justify-center cursor-pointer">
          <ChevronLeft className="w-5 h-5 text-neutral-300" />
        </button>
        <h2 className="text-sm font-bold text-white tracking-widest uppercase">{selectedOutfitDetail.vibe || 'business casual'}</h2>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRunColorAnalysis}
            className="bg-amber-300/15 hover:bg-amber-300/25 text-amber-300 border border-amber-300/40 px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" /> {aiColorScore ? `${aiColorScore}% Armonía` : 'Análisis Color IA'}
          </button>
          <button onClick={() => triggerNotification('✦ ¡Conjunto guardado!')} className="bg-white hover:bg-neutral-200 text-neutral-950 px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer">
            <Check className="w-4 h-4" /> Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className={`lg:col-span-3 rounded-3xl p-8 flex flex-col items-center justify-between relative shadow-2xl min-h-[500px] border transition-colors duration-500 ${getCanvasBackgroundClass()}`}>
          
          <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <Compass className="w-4 h-4" /> Prendas Separadas • Modo Pasarela
            </span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleToggleStudioTheme}
                className="bg-neutral-900/10 hover:bg-neutral-900/20 border border-current px-3 py-1.5 rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Wand2 className="w-3 h-3" /> Tema: {studioBackgroundTheme.toUpperCase()}
              </button>
              <button 
                onClick={handleGenerateMultipleOutfits}
                className="bg-neutral-950 text-white hover:bg-neutral-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300" /> Generar con IA
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full max-w-md my-auto py-4">
            {selectedOutfitDetail.top && (
              <div className="relative bg-neutral-100/90 p-3 rounded-2xl flex items-center justify-center h-36 group border border-neutral-300 shadow-sm">
                <button onClick={() => setSelectedOutfitDetail({ ...selectedOutfitDetail, top: undefined })} className="absolute top-2 right-2 p-1 bg-neutral-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
                <img src={selectedOutfitDetail.top.url} alt="Top" className="max-h-full object-contain filter drop-shadow-md" />
              </div>
            )}
            {selectedOutfitDetail.jacket && (
              <div className="relative bg-neutral-100/90 p-3 rounded-2xl flex items-center justify-center h-36 group border border-neutral-300 shadow-sm">
                <button onClick={() => setSelectedOutfitDetail({ ...selectedOutfitDetail, jacket: undefined })} className="absolute top-2 right-2 p-1 bg-neutral-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
                <img src={selectedOutfitDetail.jacket.url} alt="Jacket" className="max-h-full object-contain filter drop-shadow-md" />
              </div>
            )}
            {selectedOutfitDetail.bottom && (
              <div className="relative bg-neutral-100/90 p-3 rounded-2xl flex items-center justify-center h-36 group border border-neutral-300 shadow-sm">
                <button onClick={() => setSelectedOutfitDetail({ ...selectedOutfitDetail, bottom: undefined })} className="absolute top-2 right-2 p-1 bg-neutral-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
                <img src={selectedOutfitDetail.bottom.url} alt="Bottom" className="max-h-full object-contain filter drop-shadow-md" />
              </div>
            )}
            {selectedOutfitDetail.shoes && (
              <div className="relative bg-neutral-100/90 p-3 rounded-2xl flex items-center justify-center h-28 group border border-neutral-300 shadow-sm">
                <button onClick={() => setSelectedOutfitDetail({ ...selectedOutfitDetail, shoes: undefined })} className="absolute top-2 right-2 p-1 bg-neutral-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
                <img src={selectedOutfitDetail.shoes.url} alt="Shoes" className="max-h-full object-contain filter drop-shadow-md" />
              </div>
            )}
          </div>

          <div className="w-full flex justify-between items-center pt-4 border-t border-current/20">
            <div className="flex items-center gap-2">
              <button className="p-2 bg-neutral-900/10 rounded-full"><User className="w-4 h-4" /></button>
              <button className="p-2 bg-neutral-950 text-white rounded-full"><Shirt className="w-4 h-4" /></button>
            </div>
            <span className="text-xs font-semibold">Alta Daily Master Studio</span>
          </div>

        </div>

        <div className="bg-neutral-950/90 border border-neutral-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-300" /> Opciones IA
            </h3>
            <button 
              onClick={handleMixAndMatchRandom}
              className="text-[10px] text-amber-300 hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Mix & Match
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {generatedOutfitOptions.map((opt, idx) => (
              <div 
                key={opt.id}
                onClick={() => setSelectedOutfitDetail(opt)}
                className={`bg-neutral-900 border p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition ${selectedOutfitDetail.id === opt.id ? 'border-amber-300 bg-neutral-800/90 shadow-lg' : 'border-neutral-800 hover:border-neutral-700'}`}
              >
                <div className="w-12 h-12 bg-neutral-950 rounded-xl p-1 flex items-center justify-center shrink-0 border border-neutral-800">
                  <img src={opt.top?.url || wardrobe[0]?.url} alt="Mini" className="max-h-full object-contain" />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-semibold text-white truncate">{opt.name}</p>
                  <span className="text-[10px] text-amber-300 font-medium">Opción #{idx + 1} IA</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => triggerNotification('✦ Conjunto guardado exitosamente')} className="w-full bg-amber-300 hover:bg-amber-400 text-neutral-950 py-3 rounded-2xl text-xs font-bold shadow-lg transition cursor-pointer mt-2">
            Guardar el conjunto
          </button>
        </div>

      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="cal" checked={showCalendarInOutfit} onChange={() => setShowCalendarInOutfit(!showCalendarInOutfit)} className="rounded accent-amber-300 cursor-pointer w-4 h-4" />
          <label htmlFor="cal" className="text-neutral-300 cursor-pointer flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4 text-amber-300" /> Mostrar en el calendario diario
          </label>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900 px-3.5 py-2 rounded-xl border border-neutral-800 text-neutral-300 shadow-inner">
          <MapPin className="w-4 h-4 text-amber-300" />
          <span className="font-semibold">Bogotá</span>
        </div>
      </div>

    </div>
  );
}