'use server';

import { prisma } from '@/lib/prisma';

// 1. Obtener todas las prendas guardadas en la base de datos
export async function getGarments() {
  try {
    const garments = await prisma.garment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });
    return { success: true, garments };
  } catch (error: any) {
    console.error('Error al obtener prendas:', error);
    return { success: false, error: 'No se pudieron cargar las prendas' };
  }
}

// 2. Obtener prendas filtradas por un usuario específico (Armario Personal)
export async function getGarmentsByUser(userId: string) {
  try {
    const garments = await prisma.garment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });
    return { success: true, garments };
  } catch (error: any) {
    console.error('Error al obtener prendas del usuario:', error);
    return { success: false, error: 'No se pudieron cargar tus prendas' };
  }
}

// 3. Guardar una nueva prenda de forma permanente con validación de enlaces de terceros
export async function createGarment(data: {
  name: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'outerwear' | string;
  vibe?: string;
  url: string;
  price?: string;
  storeUrl?: string;
  description?: string;
  vendorName?: string;
  vendorContact?: string;
  userId?: string;
}) {
  try {
    // 🔒 Validación SSDLC de seguridad: Sanitizar y verificar URL de enlaces de terceros
    let cleanStoreUrl = data.storeUrl?.trim() || '';
    if (cleanStoreUrl && !cleanStoreUrl.startsWith('http://') && !cleanStoreUrl.startsWith('https://')) {
      return { 
        success: false, 
        error: 'El enlace de terceros (sitio web/tienda) debe ser una URL válida que comience con http:// o https://' 
      };
    }

    const newGarment = await prisma.garment.create({
      data: {
        name: data.name,
        category: data.category,
        vibe: data.vibe || 'Casual',
        url: data.url,
        price: data.price || '$50.000 COP',
        storeUrl: cleanStoreUrl,
        description: data.description || '',
        vendorName: data.vendorName || 'Administrador',
        vendorContact: data.vendorContact || '',
        userId: data.userId || null,
      },
    });

    return { success: true, garment: newGarment };
  } catch (error: any) {
    console.error('Error al crear prenda:', error);
    return { success: false, error: 'Error al guardar la prenda en la base de datos' };
  }
}

// 4. Eliminar de forma permanente una prenda por su ID
export async function deleteGarment(id: string) {
  try {
    await prisma.garment.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar prenda:', error);
    return { success: false, error: 'No se pudo eliminar la prenda' };
  }
}