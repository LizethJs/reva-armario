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

// 3. Guardar una nueva prenda recibiendo FormData de forma segura
export async function createGarment(formData: FormData) {
  try {
    const name = formData.get('name')?.toString().trim() || '';
    const category = formData.get('category')?.toString().trim() || 'tops';
    const vibe = formData.get('vibe')?.toString().trim() || 'Casual';
    const url = formData.get('url')?.toString().trim() || '';
    const price = formData.get('price')?.toString().trim() || '$50.000 COP';
    const storeUrl = formData.get('storeUrl')?.toString().trim() || '';
    const description = formData.get('description')?.toString().trim() || '';
    const vendorName = formData.get('vendorName')?.toString().trim() || 'Administrador';
    const vendorContact = formData.get('vendorContact')?.toString().trim() || '';
    const userId = formData.get('userId')?.toString().trim() || null;

    if (!name || !url) {
      return { success: false, error: 'El nombre y la imagen de la prenda son obligatorios.' };
    }

    // 🔒 Validación SSDLC de seguridad: Sanitizar y verificar URL de enlaces de terceros
    let cleanStoreUrl = storeUrl;
    if (cleanStoreUrl && !cleanStoreUrl.startsWith('http://') && !cleanStoreUrl.startsWith('https://')) {
      return { 
        success: false, 
        error: 'El enlace de terceros (sitio web/tienda) debe ser una URL válida que comience con http:// o https://' 
      };
    }

    const newGarment = await prisma.garment.create({
      data: {
        name,
        category,
        vibe,
        url,
        price,
        storeUrl: cleanStoreUrl,
        description,
        vendorName,
        vendorContact,
        userId,
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