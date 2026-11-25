/** Shrinks an image file in the browser before upload: scaled down to a maximum width, re-encoded. */

// Constants
const WEBP_QUALITY = 0.82;
const JPEG_QUALITY = 0.85;

/** An encoded image ready to upload. */
export interface ResizedImage {
  blob: Blob;
  /** "webp" or "jpg": browsers without a WebP encoder (older Safari) produce JPEG. */
  extension: 'webp' | 'jpg';
}

/**
 * Size that fits within `maxWidth` keeping the aspect ratio; images already narrower keep their
 * size (never upscaled). Dimensions are whole pixels, at least 1.
 */
export function fitWithin(width: number, height: number, maxWidth: number): { width: number; height: number } {
  if (width <= maxWidth) return { width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) };
  const scale = maxWidth / width;
  return { width: Math.round(maxWidth), height: Math.max(1, Math.round(height * scale)) };
}

/**
 * Decodes `file`, draws it at most `maxWidth` wide and encodes it as WebP (JPEG where the browser
 * cannot encode WebP). Throws when the file is not an image the browser can decode.
 */
export async function resizeImage(file: Blob, maxWidth: number): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxWidth);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Browserul nu poate procesa imaginea.');
    context.drawImage(bitmap, 0, 0, width, height);

    // Prefer WebP; a browser that cannot encode it silently returns PNG, so check and fall back.
    const webp = await toBlob(canvas, 'image/webp', WEBP_QUALITY);
    if (webp.type === 'image/webp') return { blob: webp, extension: 'webp' };
    return { blob: await toBlob(canvas, 'image/jpeg', JPEG_QUALITY), extension: 'jpg' };
  } finally {
    bitmap.close();
  }
}

// Internals

/** Promise wrapper around canvas.toBlob. */
function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Imaginea nu a putut fi codată.'))), type, quality);
  });
}
