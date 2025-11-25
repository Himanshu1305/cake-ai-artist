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
    fontSize: 52, 
    color: '#8B0000' // Deep burgundy red for better readability
  },
  'Side View': { 
    x: 0.5, 
    y: 0.60, 
    fontSize: 48, 
    color: '#8B0000' 
  },
  'Top-Down View': { 
    x: 0.5, 
    y: 0.50, 
    fontSize: 50, 
    color: '#8B0000' 
  },
  '3/4 View (Diagonal)': { 
    x: 0.5, 
    y: 0.70, 
    fontSize: 54, 
    color: '#8B0000' 
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

        // Add strong shadow for depth and readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Draw thick white outline (stroke) first for better visibility
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 8;
        ctx.strokeText(text, x, y);

        // Remove shadow for fill
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw burgundy fill
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
