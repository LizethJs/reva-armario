"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createGarment } from "../../actions/garments";

export default function NewGarmentPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });

  const [formData, setFormData] = useState({
    name: "",
    category: "tops" as "tops" | "bottoms" | "shoes" | "outerwear",
    vibe: "Casual",
    url: "",
    price: "",
    storeUrl: "", // Enlace de terceros (tienda o pasarela)
    description: "",
    vendorName: "",
    vendorContact: "",
  });

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const parsed = JSON.parse(session);
      setCurrentUser(parsed);
      setFormData((prev) => ({
        ...prev,
        vendorName: parsed.name || "Diseñador RËVA",
        vendorContact: parsed.email || "",
      }));
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación SSDLC: Formato permitido
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setMessage({
        text: "Formato no permitido. Usa JPG, PNG o WEBP.",
        success: false,
      });
      return;
    }

    // Validación SSDLC: Límite de tamaño (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({
        text: "La imagen excede el límite seguro de 2MB.",
        success: false,
      });
      return;
    }

    setMessage({ text: "", success: false });
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url) {
      setMessage({
        text: "Debes seleccionar una imagen para la prenda.",
        success: false,
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", success: false });

    try {
      const res = await createGarment({
        ...formData,
        userId: currentUser?.id || undefined,
      });

      if (res.success) {
        setMessage({
          text: "¡Prenda y enlace externo guardados con éxito!",
          success: true,
        });
        setTimeout(() => {
          router.push("/wardrobe");
        }, 1200);
      } else {
        setMessage({
          text: res.error || "Error al guardar la prenda.",
          success: false,
        });
      }
    } catch (err) {
      setMessage({
        text: "Error de conexión con el servidor.",
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-xl font-black text-amber-400 mb-1">NUEVA PRENDA / ENLACE EXTERNO</h1>
        <p className="text-xs text-neutral-400 mb-6">Registra tu prenda e integra enlaces de tiendas de terceros de forma segura.</p>

        {message.text && (
          <div
            className={`p-3 mb-4 rounded-xl text-xs font-medium text-center border ${
              message.success
                ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                : "bg-red-950/50 border-red-900/40 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Nombre de la Prenda</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400"
              placeholder="Ej: Chaqueta Oversize Cyberpunk"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as any,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400"
              >
                <option value="tops">Tops (Parte Superior)</option>
                <option value="bottoms">Bottoms (Parte Inferior)</option>
                <option value="shoes">Calzado</option>
                <option value="outerwear">Outerwear (Abrigos)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Precio Estimado</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400"
                placeholder="Ej: $85.000 COP"
              />
            </div>
          </div>

          {/* Campo para el enlace de terceros */}
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Enlace de Terceros (Tienda Externa / Instagram)</label>
            <input
              type="url"
              value={formData.storeUrl}
              onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400"
              placeholder="https://tiendaexterna.com/producto/123"
            />
            <p className="text-[10px] text-neutral-500 mt-1">Debe comenzar con http:// o https://</p>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Imagen de Prenda (JPG, PNG - Máx 2MB)</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageUpload}
              className="w-full text-neutral-400 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 cursor-pointer"
            />
            {formData.url && <p className="text-[10px] text-emerald-400 mt-1 font-semibold">✓ Imagen procesada correctamente.</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl transition shadow-lg mt-2 disabled:opacity-40 cursor-pointer"
          >
            {loading ? "Guardando..." : "Guardar Prenda"}
          </button>
        </form>
      </div>
    </div>
  );
}