/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ImageProcessingOptions } from '../types';


export interface ImageProcessResult {
  blob: Blob;
  width: number;
  height: number;
  url: string;
  originalWidth: number;
  originalHeight: number;
  durationMs: number;
}

/**
 * Perform high-quality, multi-step image downsampling and format conversion
 * purely in-browser via canvas streams and custom quality quantizations.
 */
export function compressAndConvertImage(
  file: File,
  options: ImageProcessingOptions,
  onProgress?: (progress: number) => void
): Promise<ImageProcessResult> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    if (onProgress) onProgress(10);

    const isSvgInput = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    // Shared output visual generator (generates binary formats or SVG vectors)
    const finalizeOutput = (
      outCanvas: HTMLCanvasElement,
      targetWidth: number,
      targetHeight: number,
      origWidth: number,
      origHeight: number
    ) => {
      // Determine destination MIME type
      let mimeType = 'image/jpeg';
      let extension = 'jpg';
      
      switch (options.format) {
        case 'png':
          mimeType = 'image/png';
          extension = 'png';
          break;
        case 'webp':
          mimeType = 'image/webp';
          extension = 'webp';
          break;
        case 'gif':
          mimeType = 'image/gif'; // Static gif conversions
          extension = 'gif';
          break;
        case 'bmp':
          mimeType = 'image/bmp';
          extension = 'bmp';
          break;
        case 'jpeg':
        default:
          mimeType = 'image/jpeg';
          extension = 'jpg';
          break;
      }

      // Apply quantization & quality parameters
      const isCompressDisabled = options.compressEnabled === false;
      const targetQuality = isCompressDisabled ? 1.0 : options.quality;

      outCanvas.toBlob(
        (blob) => {
          if (onProgress) onProgress(100);
          if (!blob) {
            reject(new Error('Blob generation failed'));
            return;
          }
          
          const url = URL.createObjectURL(blob);
          const durationMs = Math.round(performance.now() - startTime);

          resolve({
            blob,
            width: targetWidth,
            height: targetHeight,
            url,
            originalWidth: origWidth,
            originalHeight: origHeight,
            durationMs
          });
        },
        mimeType,
        mimeType === 'image/jpeg' || mimeType === 'image/webp' ? targetQuality : undefined
      );
    };

    if (isSvgInput) {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read SVG file text.'));
      reader.onload = (e) => {
        try {
          const svgText = e.target?.result as string;
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
          const svgElement = svgDoc.querySelector('svg');
          if (!svgElement) {
            reject(new Error('Invalid SVG file loaded.'));
            return;
          }

          let origW = parseFloat(svgElement.getAttribute('width') || '');
          let origH = parseFloat(svgElement.getAttribute('height') || '');

          const viewBox = svgElement.getAttribute('viewBox');
          if (viewBox) {
            const parts = viewBox.split(/[\s,]+/).map(parseFloat);
            if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
              if (isNaN(origW)) origW = parts[2];
              if (isNaN(origH)) origH = parts[3];
            }
          }

          if (isNaN(origW) || origW <= 0) origW = 800;
          if (isNaN(origH) || origH <= 0) origH = 600;

          // Process dimensions with options
          let { targetWidth, targetHeight } = calculateDimensions(origW, origH, options);

          // For standard crisp scaling fidelity, upscale moderate/small SVGs to a sharp high-res baseline
          if (options.resizeMode === 'none') {
            const maxDim = Math.max(targetWidth, targetHeight);
            if (maxDim < 2048) {
              const scaleFactor = 2048 / maxDim;
              targetWidth = Math.round(targetWidth * scaleFactor);
              targetHeight = Math.round(targetHeight * scaleFactor);
            }
          }

          svgElement.setAttribute('width', targetWidth.toString());
          svgElement.setAttribute('height', targetHeight.toString());
          if (!svgElement.getAttribute('viewBox')) {
            svgElement.setAttribute('viewBox', `0 0 ${origW} ${origH}`);
          }

          const serializer = new XMLSerializer();
          const modifiedSvgText = serializer.serializeToString(svgDoc);
          
          const svgBlob = new Blob([modifiedSvgText], { type: 'image/svg+xml;charset=utf-8' });
          const highResObjectUrl = URL.createObjectURL(svgBlob);

          const svgImg = new Image();
          svgImg.onload = () => {
            URL.revokeObjectURL(highResObjectUrl);
            if (onProgress) onProgress(60);

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not get 2D canvas context'));
              return;
            }

            // Draw high-resolution directly!
            ctx.drawImage(svgImg, 0, 0, targetWidth, targetHeight);

            if (onProgress) onProgress(80);
            finalizeOutput(canvas, targetWidth, targetHeight, origW, origH);
          };

          svgImg.onerror = () => {
            URL.revokeObjectURL(highResObjectUrl);
            reject(new Error('Failed to load SVG source graphic.'));
          };

          svgImg.src = highResObjectUrl;
        } catch (err) {
          reject(err);
        }
      };

      reader.readAsText(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Clean up objectUrl once image has loaded into browser memory
      URL.revokeObjectURL(objectUrl);
      if (onProgress) onProgress(40);
      
      const originalWidth = img.width;
      const originalHeight = img.height;
      
      // Calculate crop dimensions if cropAspectRatio is configured
      let cropX = 0;
      let cropY = 0;
      let cropWidth = originalWidth;
      let cropHeight = originalHeight;

      if (options.cropAspectRatio && options.cropAspectRatio !== 'none') {
        let targetRatio = 1;
        if (options.cropAspectRatio === '1:1') targetRatio = 1.0;
        else if (options.cropAspectRatio === '9:16') targetRatio = 9.0 / 16.0;
        else if (options.cropAspectRatio === '16:9') targetRatio = 16.0 / 9.0;

        const currentRatio = originalWidth / originalHeight;
        if (currentRatio > targetRatio) {
          // Input is wider: crop horizontal margins
          cropWidth = originalHeight * targetRatio;
          cropHeight = originalHeight;
          cropX = (originalWidth - cropWidth) / 2;
          cropY = 0;
        } else {
          // Input is taller: crop vertical margins
          cropWidth = originalWidth;
          cropHeight = originalWidth / targetRatio;
          cropX = 0;
          cropY = (originalHeight - cropHeight) / 2;
        }
      }

      let sourceInput: HTMLImageElement | HTMLCanvasElement = img;

      if (options.cropAspectRatio && options.cropAspectRatio !== 'none') {
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = Math.round(cropWidth);
        cropCanvas.height = Math.round(cropHeight);
        const cropCtx = cropCanvas.getContext('2d');
        if (cropCtx) {
          cropCtx.drawImage(
            img,
            Math.round(cropX),
            Math.round(cropY),
            Math.round(cropWidth),
            Math.round(cropHeight),
            0,
            0,
            Math.round(cropWidth),
            Math.round(cropHeight)
          );
          sourceInput = cropCanvas;
        }
      }

      // Calculate new dimensions based on the cropped bounds
      let { targetWidth, targetHeight } = calculateDimensions(
        Math.round(cropWidth),
        Math.round(cropHeight),
        options
      );

      // Perform multi-step downsampling or scaling for maximum quality (anti-aliasing)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2D canvas context'));
        return;
      }

      if (onProgress) onProgress(60);
      
      downsampleImage(sourceInput, targetWidth, targetHeight, canvas, ctx);
      
      if (onProgress) onProgress(80);
      finalizeOutput(canvas, targetWidth, targetHeight, originalWidth, originalHeight);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image element'));
    };

    img.src = objectUrl;
  });
}

function calculateDimensions(
  width: number,
  height: number,
  options: ImageProcessingOptions
): { targetWidth: number; targetHeight: number } {
  let targetWidth = width;
  let targetHeight = height;

  switch (options.resizeMode) {
    case 'width':
      targetWidth = options.resizeValue;
      targetHeight = Math.round((height / width) * targetWidth);
      break;
    case 'height':
      targetHeight = options.resizeValue;
      targetWidth = Math.round((width / height) * targetHeight);
      break;
    case 'percentage':
      const scale = options.resizeValue / 100;
      targetWidth = Math.round(width * scale);
      targetHeight = Math.round(height * scale);
      break;
    case 'none':
    default:
      break;
  }

  // Enforce sensible boundary values
  targetWidth = Math.max(1, targetWidth);
  targetHeight = Math.max(1, targetHeight);

  return { targetWidth, targetHeight };
}



/**
 * Multi-step downsampling implementation for professional downsampling.
 * Draws the image multiple times at halved dimensions sequentially until target,
 * which mimics advanced bilinear/bicubic shaders client-side.
 */
function downsampleImage(
  img: HTMLImageElement | HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  let currentWidth = img.width;
  let currentHeight = img.height;

  // Create temporary in-memory canvas for intermediate steps
  const tmpCanvas = document.createElement('canvas');
  const tmpCtx = tmpCanvas.getContext('2d');
  
  if (!tmpCtx || currentWidth <= targetWidth * 2) {
    // If target width isn't excessively smaller, single-draw is fine and fast
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    return;
  }

  tmpCanvas.width = currentWidth;
  tmpCanvas.height = currentHeight;
  tmpCtx.drawImage(img, 0, 0);

  // Successive scaling down by factor of ~2 to prevent sharp pixel edges
  while (currentWidth > targetWidth * 2) {
    const nextWidth = Math.round(currentWidth / 2);
    const nextHeight = Math.round(currentHeight / 2);

    if (nextWidth < targetWidth) break;

    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = nextWidth;
    stepCanvas.height = nextHeight;
    const stepCtx = stepCanvas.getContext('2d');
    
    if (stepCtx) {
      stepCtx.drawImage(tmpCanvas, 0, 0, currentWidth, currentHeight, 0, 0, nextWidth, nextHeight);
      
      currentWidth = nextWidth;
      currentHeight = nextHeight;
      
      tmpCanvas.width = currentWidth;
      tmpCanvas.height = currentHeight;
      tmpCtx.clearRect(0, 0, currentWidth, currentHeight);
      tmpCtx.drawImage(stepCanvas, 0, 0);
    } else {
      break;
    }
  }

  // Draw final step to target canvas size
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  ctx.drawImage(tmpCanvas, 0, 0, currentWidth, currentHeight, 0, 0, targetWidth, targetHeight);
}


