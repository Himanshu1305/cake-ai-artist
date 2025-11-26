import { supabase } from "@/integrations/supabase/client";

export interface PhotoPosition {
  x: number; // 0-1 horizontal position
  y: number; // 0-1 vertical position
  size: number; // 0.25-0.6 size as percentage of cake width
  shape: 'circle' | 'rectangle';
  rotation: number; // -15 to 15 degrees
  borderColor: string; // hex color
  borderWidth: number; // 2-8 pixels
}

/**
 * Default fallback positions for different cake views
 */
export const FALLBACK_PHOTO_POSITIONS: Record<string, PhotoPosition> = {
  'front': { x: 0.5, y: 0.4, size: 0.35, shape: 'circle', rotation: 0, borderColor: '#ffffff', borderWidth: 4 },
  'side': { x: 0.5, y: 0.45, size: 0.3, shape: 'circle', rotation: 0, borderColor: '#ffffff', borderWidth: 4 },
  'top': { x: 0.5, y: 0.5, size: 0.45, shape: 'circle', rotation: 0, borderColor: '#ffffff', borderWidth: 4 },
  'diagonal': { x: 0.5, y: 0.45, size: 0.35, shape: 'circle', rotation: -5, borderColor: '#ffffff', borderWidth: 4 },
};

/**
 * Call the AI edge function to analyze the cake and get optimal photo placement
 */
export async function analyzeImageForPhoto(
  cakeImageUrl: string,
  userPhotoUrl: string,
  viewType: 'front' | 'side' | 'top' | 'diagonal' = 'top'
): Promise<PhotoPosition> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-cake-photo', {
      body: { cakeImageUrl, userPhotoUrl }
    });

    if (error) {
      console.error('Error calling analyze-cake-photo:', error);
      return FALLBACK_PHOTO_POSITIONS[viewType];
    }

    if (data?.params) {
      return data.params as PhotoPosition;
    }

    return FALLBACK_PHOTO_POSITIONS[viewType];
  } catch (error) {
    console.error('Exception in analyzeImageForPhoto:', error);
    return FALLBACK_PHOTO_POSITIONS[viewType];
  }
}

/**
 * Add a photo to a cake image with circular masking and border
 */
export async function addPhotoToCake(
  cakeImageSrc: string,
  userPhotoSrc: string,
  position: PhotoPosition
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cakeImg = new Image();
    cakeImg.crossOrigin = 'anonymous';

    cakeImg.onload = () => {
      const userImg = new Image();
      userImg.crossOrigin = 'anonymous';

      userImg.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = cakeImg.width;
          canvas.height = cakeImg.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Draw the cake image first
          ctx.drawImage(cakeImg, 0, 0);

          // Calculate photo dimensions and position
          const photoSize = canvas.width * position.size;
          const photoX = canvas.width * position.x;
          const photoY = canvas.height * position.y;

          // Save context state
          ctx.save();

          // Move to photo center and rotate
          ctx.translate(photoX, photoY);
          ctx.rotate((position.rotation * Math.PI) / 180);

          // Create clipping path based on shape
          ctx.beginPath();
          if (position.shape === 'circle') {
            ctx.arc(0, 0, photoSize / 2, 0, Math.PI * 2);
          } else {
            const halfSize = photoSize / 2;
            ctx.rect(-halfSize, -halfSize, photoSize, photoSize);
          }
          ctx.closePath();
          ctx.clip();

          // Draw the user photo (centered and scaled to fit)
          const scale = Math.max(photoSize / userImg.width, photoSize / userImg.height);
          const scaledWidth = userImg.width * scale;
          const scaledHeight = userImg.height * scale;
          
          ctx.drawImage(
            userImg,
            -scaledWidth / 2,
            -scaledHeight / 2,
            scaledWidth,
            scaledHeight
          );

          // Restore context
          ctx.restore();

          // Draw border
          ctx.save();
          ctx.translate(photoX, photoY);
          ctx.rotate((position.rotation * Math.PI) / 180);
          
          ctx.strokeStyle = position.borderColor;
          ctx.lineWidth = position.borderWidth;
          ctx.beginPath();
          if (position.shape === 'circle') {
            ctx.arc(0, 0, photoSize / 2, 0, Math.PI * 2);
          } else {
            const halfSize = photoSize / 2;
            ctx.rect(-halfSize, -halfSize, photoSize, photoSize);
          }
          ctx.stroke();
          
          ctx.restore();

          // Add subtle shadow for depth
          ctx.save();
          ctx.translate(photoX, photoY);
          ctx.rotate((position.rotation * Math.PI) / 180);
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.strokeStyle = position.borderColor;
          ctx.lineWidth = position.borderWidth;
          ctx.beginPath();
          if (position.shape === 'circle') {
            ctx.arc(0, 0, photoSize / 2, 0, Math.PI * 2);
          } else {
            const halfSize = photoSize / 2;
            ctx.rect(-halfSize, -halfSize, photoSize, photoSize);
          }
          ctx.stroke();
          ctx.restore();

          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };

      userImg.onerror = () => reject(new Error('Failed to load user photo'));
      userImg.src = userPhotoSrc;
    };

    cakeImg.onerror = () => reject(new Error('Failed to load cake image'));
    cakeImg.src = cakeImageSrc;
  });
}

/**
 * Process a single cake image with a user photo
 */
export async function processCakeWithPhoto(
  cakeImageUrl: string,
  userPhotoUrl: string,
  viewType: 'front' | 'side' | 'top' | 'diagonal' = 'top'
): Promise<string> {
  console.log('Processing cake with photo, view type:', viewType);
  
  // Get AI-recommended position
  const position = await analyzeImageForPhoto(cakeImageUrl, userPhotoUrl, viewType);
  console.log('AI recommended position:', position);
  
  // Apply photo to cake
  const processedImage = await addPhotoToCake(cakeImageUrl, userPhotoUrl, position);
  
  return processedImage;
}
