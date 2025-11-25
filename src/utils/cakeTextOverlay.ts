interface TextPosition {
  x: number;  // 0 to 1 (percentage of canvas width)
  y: number;  // 0 to 1 (percentage of canvas height)
  fontSize: number;
  color: string;
  rotation?: number; // Optional rotation in degrees
  fontStyle?: 'elegant' | 'playful' | 'classic';
}

type ViewType = 'Front View' | 'Side View' | 'Top-Down View' | '3/4 View (Diagonal)';

// Fallback positions if AI analysis fails
const FALLBACK_POSITIONS: Record<ViewType, TextPosition> = {
  'Front View': { 
    x: 0.5, 
    y: 0.65, 
    fontSize: 32, 
    color: '#D4687A',
    rotation: 0,
    fontStyle: 'elegant'
  },
  'Side View': { 
    x: 0.5, 
    y: 0.60, 
    fontSize: 28, 
    color: '#D4687A',
    rotation: 0,
    fontStyle: 'elegant'
  },
  'Top-Down View': { 
    x: 0.5, 
    y: 0.50, 
    fontSize: 30, 
    color: '#D4687A',
    rotation: 0,
    fontStyle: 'elegant'
  },
  '3/4 View (Diagonal)': { 
    x: 0.5, 
    y: 0.70, 
    fontSize: 34, 
    color: '#D4687A',
    rotation: 0,
    fontStyle: 'elegant'
  }
};

/**
 * Calls the AI edge function to analyze cake image and get optimal text placement
 */
const analyzeImageForText = async (
  imageSource: string,
  recipientName: string
): Promise<TextPosition> => {
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-cake-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageSource,
        recipientName: recipientName
      })
    });

    if (!response.ok) {
      console.error('AI analysis failed:', response.status, await response.text());
      return FALLBACK_POSITIONS['Front View'];
    }

    const params = await response.json();
    return {
      x: params.x || 0.5,
      y: params.y || 0.65,
      fontSize: params.fontSize || 32,
      color: params.color || '#D4687A',
      rotation: params.rotation || 0,
      fontStyle: params.fontStyle || 'elegant'
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return FALLBACK_POSITIONS['Front View'];
  }
};

/**
 * Gets the appropriate font based on style
 */
export const getFontFamily = (style: string = 'elegant'): string => {
  switch (style) {
    case 'playful':
      return "'Comic Sans MS', 'Brush Script MT', cursive";
    case 'classic':
      return "Georgia, 'Times New Roman', serif";
    case 'elegant':
    default:
      return "'Brush Script MT', 'Lucida Handwriting', cursive";
  }
};

/**
 * Adds text overlay to a cake image with AI-powered positioning
 * @param imageSource - Image URL or base64 string
 * @param text - The text to overlay (recipient name)
 * @param position - AI-determined or fallback text position parameters
 * @returns Promise resolving to base64 encoded image with text overlay
 */
export const addTextToCake = (
  imageSource: string, 
  text: string, 
  position: TextPosition
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
        
        // Calculate actual pixel positions
        const x = canvas.width * position.x;
        const y = canvas.height * position.y;

        // Save context state for rotation
        ctx.save();

        // Apply rotation if specified
        if (position.rotation) {
          ctx.translate(x, y);
          ctx.rotate((position.rotation * Math.PI) / 180);
          ctx.translate(-x, -y);
        }

        // Configure text styling with appropriate font for the style
        const fontFamily = getFontFamily(position.fontStyle);
        ctx.font = `italic bold ${position.fontSize}px ${fontFamily}`;
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

        // Restore context state
        ctx.restore();

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
 * Process array of 4 cake images and add AI-powered text overlay
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
    console.log('Processing images with AI-powered text placement...');
    
    // Analyze all images in parallel to get optimal text positions
    const analysisPromises = images.map((image) => 
      analyzeImageForText(image, recipientName)
    );
    
    const textPositions = await Promise.all(analysisPromises);
    console.log('AI analysis complete:', textPositions);

    // Apply text overlay with AI-determined positions
    const processedImages = await Promise.all(
      images.map((image, index) => 
        addTextToCake(
          image, 
          recipientName, 
          textPositions[index] || FALLBACK_POSITIONS[viewTypes[index] || 'Front View']
        )
      )
    );

    return processedImages;
  } catch (error) {
    console.error('Error processing cake images:', error);
    
    // Fallback: use default positions if AI analysis fails completely
    console.log('Falling back to default text positions');
    const processedImages = await Promise.all(
      images.map((image, index) => 
        addTextToCake(
          image, 
          recipientName, 
          FALLBACK_POSITIONS[viewTypes[index] || 'Front View']
        )
      )
    );
    
    return processedImages;
  }
};
