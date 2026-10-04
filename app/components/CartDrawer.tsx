'use client';

import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { Garment } from '../page';

export interface CartItem extends Garment {
  selectedSize: 'S' | 'M' | 'L' | 'XL';
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, size: string, delta: number) => void;
  onRemoveItem: (id: string, size: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout }: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.price || 50) * item.quantity, 0);
  const shipping = subtotal > 0 ? 10.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl p-6">
        
        {/* Cabecera del Carrito */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-black tracking-widest text-white uppercase">Tu Carrito RËVA</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-xs font-bold bg-neutral-800 px-3 py-1.5 rounded-xl cursor-pointer transition"
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Listado de Productos */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 scrollbar-thin">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-neutral-500">
              <ShoppingBag className="w-12 h-12 stroke-1 text-neutral-700" />
              <p className="text-xs font-medium">Tu carrito está vacío.<br/>Prueba prendas en el probador y añádelas aquí.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={`${item.id}-${item.selectedSize}`}
                className="flex items-center justify-between bg-neutral-950/60 border border-neutral-800/80 p-3 rounded-2xl gap-3"
              >
                <div className="w-14 h-14 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 p-1 flex items-center justify-center shrink-0">
                  <img src={item.url} alt={item.name} className="w-full h-full object-contain" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                  <p className="text-[10px] text-amber-400 font-bold mt-0.5">Talla: {item.selectedSize} • ${(item.price || 50).toFixed(2)}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.selectedSize, -1)}
                      className="w-5 h-5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md flex items-center justify-center text-xs cursor-pointer"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.selectedSize, 1)}
                      className="w-5 h-5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md flex items-center justify-center text-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => onRemoveItem(item.id, item.selectedSize)}
                  className="text-neutral-500 hover:text-red-400 p-2 transition cursor-pointer"
                  title="Eliminar prenda"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Resumen de Pago y Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-800 pt-4 flex flex-col gap-3">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Subtotal</span>
              <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Envío estimado</span>
              <span className="font-bold text-white">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-white border-t border-neutral-800/60 pt-2">
              <span>Total</span>
              <span className="text-amber-400">${total.toFixed(2)}</span>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer mt-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Proceder al Pago Seguro
            </button>
          </div>
        )}

      </div>
    </div>
  );
}