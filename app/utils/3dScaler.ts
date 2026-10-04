export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getGarmentTransform(category: string, bodyBox: BoundingBox) {
  // Ajustes proporcionales basados en la silueta corporal detectada
  switch (category) {
    case 'tops':
    case 'outerwear':
      return {
        top: `${bodyBox.y + bodyBox.height * 0.15}px`,
        left: `${bodyBox.x + bodyBox.width * 0.1}px`,
        width: `${bodyBox.width * 0.8}px`,
        height: `${bodyBox.height * 0.45}px`,
        transform: 'translate(-50%, -50%) scale(1)',
      };
    case 'bottoms':
      return {
        top: `${bodyBox.y + bodyBox.height * 0.55}px`,
        left: `${bodyBox.x + bodyBox.width * 0.15}px`,
        width: `${bodyBox.width * 0.7}px`,
        height: `${bodyBox.height * 0.4}px`,
        transform: 'translate(-50%, 0) scale(1)',
      };
    case 'shoes':
      return {
        top: `${bodyBox.y + bodyBox.height * 0.9}px`,
        left: `${bodyBox.x + bodyBox.width * 0.3}px`,
        width: `${bodyBox.width * 0.4}px`,
        height: `${bodyBox.height * 0.15}px`,
        transform: 'translate(-50%, 0) scale(1)',
      };
    default:
      return {
        top: `${bodyBox.y}px`,
        left: `${bodyBox.x}px`,
        width: `${bodyBox.width}px`,
        height: `${bodyBox.height}px`,
        transform: 'translate(0, 0)',
      };
  }
}