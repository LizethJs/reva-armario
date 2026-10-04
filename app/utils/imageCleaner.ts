/**
 * Utilidad de procesamiento de imágenes con protección de prendas claras.
 * Solo elimina el fondo externo analizando los bordes de la imagen
 * sin afectar el contenido interior de la ropa.
 */
export function cleanImageBackground(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        reject(new Error('No se pudo inicializar el canvas.'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Verificamos si el fondo es claro tomando muestras estrictas de las esquinas superiores
      const tlIndex = 0;
      const trIndex = (width - 1) * 4;
      const isBackgroundLight = 
        (data[tlIndex] > 230 && data[tlIndex+1] > 230 && data[tlIndex+2] > 230) ||
        (data[trIndex] > 230 && data[trIndex+1] > 230 && data[trIndex+2] > 230);

      if (!isBackgroundLight) {
        resolve(canvas.toDataURL('image/png'));
        return;
      }

      // 2. Algoritmo de inundación (Flood Fill) desde los bordes externos hacia adentro.
      const visited = new Uint8Array(width * height);
      const queue: [number, number][] = [];

      for (let x = 0; x < width; x++) {
        queue.push([x, 0]);
        queue.push([x, height - 1]);
      }
      for (let y = 0; y < height; y++) {
        queue.push([0, y]);
        queue.push([width - 1, y]);
      }

      while (queue.length > 0) {
        const [x, y] = queue.pop()!;
        const idx = y * width + x;

        if (x < 0 || x >= width || y < 0 || y >= height || visited[idx]) continue;
        visited[idx] = 1;

        const pixelIdx = idx * 4;
        const r = data[pixelIdx];
        const g = data[pixelIdx + 1];
        const b = data[pixelIdx + 2];

        if (r > 215 && g > 215 && b > 215) {
          data[pixelIdx + 3] = 0; // Transparente

          queue.push([x + 1, y]);
          queue.push([x - 1, y]);
          queue.push([x, y + 1]);
          queue.push([x, y - 1]);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (error) => reject(error);
    img.src = imageSrc;
  });
}