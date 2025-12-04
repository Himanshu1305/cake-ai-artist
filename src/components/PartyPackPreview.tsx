import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface PartyPack {
  invitation_url: string;
  thank_you_card_url: string;
  banner_url: string;
  cake_topper_url: string;
  place_cards_url: string;
}

interface PartyPackPreviewProps {
  partyPack: PartyPack;
  name: string;
  occasion: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const items = [
  { key: "invitation_url", title: "Invitation Card", emoji: "💌" },
  { key: "thank_you_card_url", title: "Thank You Card", emoji: "💝" },
  { key: "banner_url", title: "Party Banner", emoji: "🎊" },
  { key: "cake_topper_url", title: "Cake Topper", emoji: "🎂" },
  { key: "place_cards_url", title: "Place Cards", emoji: "🏷️" }
];

export function PartyPackPreview({
  partyPack,
  name,
  occasion,
  open,
  onOpenChange
}: PartyPackPreviewProps) {
  const [selectedItem, setSelectedItem] = useState<{ url: string; title: string } | null>(null);
  
  const downloadItem = async (url: string, itemName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${name.toLowerCase().replace(/\s+/g, "-")}-${itemName.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success(`${itemName} downloaded!`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download item");
    }
  };

  const shareItem = async (url: string, itemName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `${itemName}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${name}'s ${occasion} - ${itemName}`,
          text: `Check out this ${itemName} for ${name}'s ${occasion}!`
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              🎉 Your Complete Party Pack
            </DialogTitle>
            <p className="text-muted-foreground">
              Click any item to view full size, download, or share
            </p>
          </DialogHeader>

          {/* Grid View - Show All Items */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => {
              const url = partyPack[item.key as keyof PartyPack];
              return (
                <Card 
                  key={item.key} 
                  className="group overflow-hidden cursor-pointer hover:ring-2 hover:ring-party-purple transition-all"
                  onClick={() => setSelectedItem({ url, title: item.title })}
                >
                  <div className="relative aspect-[4/5] bg-muted">
                    <img
                      src={url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-foreground" />
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <p className="font-semibold text-sm flex items-center justify-center gap-2">
                      <span>{item.emoji}</span>
                      {item.title}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="text-sm text-muted-foreground text-center space-y-1 mt-4 p-4 bg-muted/50 rounded-lg">
            <p>💡 <strong>Print Tips:</strong></p>
            <p>Use high-quality paper for best results. Print at 100% scale (no fit-to-page).</p>
            <p>For the banner, print each letter separately and string together.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Size Preview Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedItem.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => downloadItem(selectedItem.url, selectedItem.title)}
                  className="flex-1 bg-gradient-to-r from-party-purple to-party-pink text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={() => shareItem(selectedItem.url, selectedItem.title)}
                  variant="outline"
                  className="flex-1 border-party-purple text-party-purple hover:bg-party-purple/10"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
