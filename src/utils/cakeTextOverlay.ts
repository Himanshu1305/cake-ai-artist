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
    y: 0.65, 
    fontSize: 32, 
    color: '#D4687A' // Soft frosting pink
  },
  'Side View': { 
    x: 0.5, 
    y: 0.60, 
    fontSize: 28, 
    color: '#D4687A' 
  },
  'Top-Down View': { 
    x: 0.5, 
    y: 0.50, 
    fontSize: 30, 
    color: '#D4687A' 
  },
  '3/4 View (Diagonal)': { 
    x: 0.5, 
    y: 0.70, 
    fontSize: 34, 
    color: '#D4687A' 
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

        // Configure text styling with cursive font for elegant frosting look
        ctx.font = `italic bold ${position.fontSize}px 'Brush Script MT', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // First pass: Create depth with darker shadow underneath (embossed effect)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = position.color;
        ctx.fillText(text, x, y);

        // Second pass: Add highlight on top for raised frosting appearance
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = -1;
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
