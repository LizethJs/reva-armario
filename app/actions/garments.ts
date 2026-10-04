'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todas las prendas guardadas en la base de datos
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

// Guardar una nueva prenda de forma permanente en la base de datos
export async function createGarment(data: {
  name: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'outerwear';
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
    const newGarment = await prisma.garment.create({
      data: {
        name: data.name,
        category: data.category,
        vibe: data.vibe || 'Casual',
        url: data.url,
        price: data.price || '$50.000 COP',
        storeUrl: data.storeUrl || '',
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

// Eliminar de forma permanente una prenda por su ID
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