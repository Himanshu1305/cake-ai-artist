interface TextPosition {
  x: number;  // 0 to 1 (percentage of canvas width)
  y: number;  // 0 to 1 (percentage of canvas height)
  fontSize: number;
  color: string;
}

type ViewType = 'Front View' | 'Side View' | 'Top-Down View' | '3/4 View (Diagonal)';

const TEXT_POSITIONS: Record<ViewType, TextPosition> = {
  'Front View': { 
    x: 0.5, 
    y: 0.87, 
    fontSize: 38, 
    color: '#D4AF37' // Elegant gold
  },
  'Side View': { 
    x: 0.5, 
    y: 0.83, 
    fontSize: 34, 
    color: '#D4AF37' 
  },
  'Top-Down View': { 
    x: 0.5, 
    y: 0.15, 
    fontSize: 36, 
    color: '#D4AF37' 
  },
  '3/4 View (Diagonal)': { 
    x: 0.5, 
    y: 0.90, 
    fontSize: 40, 
    color: '#D4AF37' 
  }
};

/**
 * Adds text overlay to a cake image
 * @param imageSource - Image URL or base64 string
 * @param text - The text to overlay (recipient name)
 * @param viewType - The cake angle/view type
 * @returns Promise resolving to base64 encoded image with text overlay
 */
export const addTextToCake = (
  imageSource: string, 
  text: string, 
  viewType: ViewType
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create canvas and context
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Create image element
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS for external URLs

    img.onload = () => {
      try {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original cake image
        ctx.drawImage(img, 0, 0);

        // Get text position for this view
        const position = TEXT_POSITIONS[viewType];
        
        // Calculate actual pixel positions
        const x = canvas.width * position.x;
        const y = canvas.height * position.y;

        // Configure text styling
        ctx.font = `bold ${position.fontSize}px Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add shadow for depth (makes text look more realistic on cake)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw white outline (stroke) first
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeText(text, x, y);

        // Remove shadow for fill
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw gold fill
        ctx.fillStyle = position.color;
        ctx.fillText(text, x, y);

        // Convert canvas to base64
        const result = canvas.toDataURL('image/jpeg', 0.95);
        resolve(result);

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Handle both formats: "data:image/jpeg;base64,..." or URLs
    const imageSrc = imageSource.startsWith('data:') || imageSource.startsWith('http')
      ? imageSource 
      : `data:image/jpeg;base64,${imageSource}`;
    
    img.src = imageSrc;
  });
};

/**
 * Process array of 4 cake images and add text overlay
 * @param images - Array of image URLs (in order: Front, Side, Top, Diagonal)
 * @param recipientName - Name to overlay on cakes
 * @returns Promise resolving to array of processed images with text overlay
 */
export const processImageArray = async (
  images: string[],
  recipientName: string
): Promise<string[]> => {
  const viewTypes: ViewType[] = [
    'Front View', 
    'Side View', 
    'Top-Down View', 
    '3/4 View (Diagonal)'
  ];

  try {
    // Process all images in parallel
    const processedImages = await Promise.all(
      images.map((image, index) => 
        addTextToCake(image, recipientName, viewTypes[index] || 'Front View')
      )
    );

    return processedImages;
  } catch (error) {
    console.error('Error processing cake images:', error);
    throw error;
  }
};
