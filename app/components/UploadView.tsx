import React, { useState } from 'react';
import { Upload, Check, ChevronLeft, Sparkles } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import { Garment } from '../page';
import { createGarment } from '@/actions/garments';

interface Props {
  onSave: (newGarment: Garment) => void;
  onBack: () => void;
}

export default function UploadView({ onSave, onBack }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  const [garmentName, setGarmentName] = useState<string>('');
  const [garmentPrice, setGarmentPrice] = useState<string>('');
  const [garmentColor, setGarmentColor] = useState<string>('#1c1c1c');
  const [selectedCategory, setSelectedCategory] = useState<'tops' | 'bottoms' | 'shoes' | 'accessories'>('tops');
  const [localNotification, setLocalNotification] = useState<string | null>(null);

  const triggerLocalNotification = (msg: string) => {
    setLocalNotification(msg);
    setTimeout(() => setLocalNotification(null), 3500);
  };

  const processImageToTransparent = async (input: File | string) => {
    try {
      setIsProcessing(true);
      setProcessingStatus('IA analizando silueta y aislando fondo...');

      let targetSource: File | string = input;
      if (typeof input === 'string') {
        const response = await fetch(input);
        const blob = await response.blob();
        targetSource = blob;
      }

      const resultBlob = await removeBackground(targetSource, {
        progress: (key, current, total) => {
          const pct = Math.round((current / total) * 100);
          setProcessingStatus(`Procesando IA: ${pct}%`);
        },
      });

      setSelectedImage(URL.createObjectURL(resultBlob));
    } catch (err) {
      triggerLocalNotification('No se pudo procesar la imagen.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageToTransparent(file);
  };

  const handleSaveClick = async () => {
    if (!selectedImage) return;

    if (!garmentName.trim() || !garmentPrice.trim()) {
      triggerLocalNotification('⚠ Debes completar obligatoriamente el Nombre y el Precio.');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStatus('Guardando en Supabase...');

      // 1. Crear FormData para enviar a la Server Action de Supabase
      const formData = new FormData();
      formData.append('name', garmentName.trim());
      formData.append('category', selectedCategory);
      formData.append('url', selectedImage);
      formData.append('price', garmentPrice.trim());
      formData.append('description', 'Prenda subida y procesada con IA.');
      formData.append('vendorName', 'Colección Personal');

      // Llamada a la Server Action conectada a Supabase
      const result = await createGarment(formData);

      if (!result.success) {
        triggerLocalNotification(result.error || 'Error al guardar en la base de datos.');
        setIsProcessing(false);
        return;
      }

      // 2. Objeto para actualizar la vista localmente
      const newGarment: Garment = {
        id: result.garment?.id || Date.now().toString(),
        url: selectedImage,
        category: selectedCategory,
        name: garmentName.trim(),
        brand: 'Colección Personal',
        price: garmentPrice.trim(),
        description: 'Prenda subida y procesada con IA.',
        isAvailableInCountry: true,
        storeUrl: 'https://www.google.com',
        colorHex: garmentColor
      };

      onSave(newGarment);
    } catch (error) {
      console.error('Error al guardar prenda:', error);
      triggerLocalNotification('Error de conexión al guardar la prenda.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col items-center relative z-10">
      
      {localNotification && (
        <div className="fixed top-20 z-50 bg-neutral-900/90 backdrop-blur-xl border border-amber-300/40 text-amber-200 px-4 py-2 rounded-xl text-xs shadow-xl">
          {localNotification}
        </div>
      )}

      {isProcessing && (
          <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-5">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-amber-300/20 border-t-amber-300 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-300 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-white tracking-wide">Procesando con IA de Alta Precisión</p>
                <p className="text-xs text-neutral-400 mt-1">{processingStatus}</p>
            </div>
          </div>
      )}
      
       <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 rounded-full transition flex items-center justify-center cursor-pointer">
          <ChevronLeft className="w-5 h-5 text-neutral-300" />
        </button>
         <h2 className="text-base font-semibold text-neutral-200 tracking-wide">Aislamiento Automático de Fondo por IA</h2>
         <div></div>
       </div>
      
      {!selectedImage ? (
        <label className="border-2 border-dashed border-neutral-800 hover:border-amber-300/60 transition rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer bg-neutral-900/30 backdrop-blur-md w-full group shadow-2xl">
          <div className="p-4 bg-neutral-900 rounded-2xl mb-3 group-hover:scale-110 transition border border-neutral-800 shadow-inner">
            <Upload className="w-6 h-6 text-amber-300" />
          </div>
          <span className="text-sm font-medium text-neutral-200">Sube o arrastra la foto de tu prenda</span>
          <span className="text-xs text-amber-400/80 mt-1 font-medium">* Nombre y Precio obligatorios para guardar *</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="w-full bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-neutral-800 p-6 flex flex-col items-center shadow-2xl relative">
          <div className="w-full flex flex-col items-center z-10">
            <div className="h-56 w-full flex items-center justify-center mb-6 bg-neutral-950/80 rounded-2xl p-4 border border-neutral-800/80 relative shadow-inner">
              <img src={selectedImage} alt="Prenda lista" className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.9)] relative z-10" />
            </div>

            <div className="w-full space-y-3.5 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1 font-medium">Nombre de la prenda <span className="text-amber-400">*Requerido</span></label>
                <input type="text" placeholder="Ej. Sudadera Oversize Minimal" value={garmentName} onChange={(e) => setGarmentName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-300" />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1 font-medium">Precio estimado <span className="text-amber-400">*Requerido</span></label>
                <input type="text" placeholder="Ej. $49.99 USD" value={garmentPrice} onChange={(e) => setGarmentPrice(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1 font-medium">Categoría</label>
                  <select value={selectedCategory} onChange={(e: any) => setSelectedCategory(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-300">
                    <option value="tops">Parte Superior</option>
                    <option value="bottoms">Parte Inferior</option>
                    <option value="shoes">Calzado</option>
                    <option value="accessories">Accesorios</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-medium">Color de acento</label>
                  <input type="color" value={garmentColor} onChange={(e) => setGarmentColor(e.target.value)} className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1 cursor-pointer" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setSelectedImage(null)} className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 py-3 rounded-xl font-medium transition border border-neutral-800 cursor-pointer">Reintentar</button>
                <button onClick={handleSaveClick} className="flex-1 bg-amber-300 hover:bg-amber-400 text-neutral-950 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                  <Check className="w-4 h-4" /> Guardar en Armario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}