import { useState } from "react";
import { FONT_OPTIONS } from "@/utils/cakeTextOverlay";
import { Label } from "./ui/label";
import { Check } from "lucide-react";

interface FontPreviewPickerProps {
  selectedFontId: string;
  recipientName: string;
  onFontChange: (fontId: string) => void;
}

export const FontPreviewPicker = ({ 
  selectedFontId, 
  recipientName, 
  onFontChange 
}: FontPreviewPickerProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const categories = ['All', 'Script', 'Decorative', 'Classic', 'System'];
  
  const filteredFonts = activeCategory === 'All' 
    ? FONT_OPTIONS 
    : FONT_OPTIONS.filter(font => font.category === activeCategory);

  return (
    <div className="space-y-3">
      <Label>Font Family</Label>
      
      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeCategory === category
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Font Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
        {filteredFonts.map(font => (
          <button
            key={font.id}
            onClick={() => onFontChange(font.id)}
            className={`relative p-3 border-2 rounded-lg transition-all hover:scale-105 hover:shadow-md ${
              selectedFontId === font.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            {/* Selected Indicator */}
            {selectedFontId === font.id && (
              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                <Check className="h-3 w-3" />
              </div>
            )}
            
            {/* Font Preview */}
            <div 
              className="text-xl text-foreground truncate mb-1"
              style={{ fontFamily: font.family }}
            >
              {recipientName}
            </div>
            
            {/* Font Name */}
            <div className="text-xs text-muted-foreground font-normal">
              {font.name}
            </div>
          </button>
        ))}
      </div>

      {/* Tip */}
      <p className="text-xs text-muted-foreground">
        💡 Click any font to see how "{recipientName}" looks on your cake
      </p>
    </div>
  );
};