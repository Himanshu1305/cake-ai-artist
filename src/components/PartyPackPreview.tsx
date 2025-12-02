import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            🎉 Your Complete Party Pack
          </DialogTitle>
          <p className="text-muted-foreground">
            All items designed to match your cake theme
          </p>
        </DialogHeader>

        <Carousel className="w-full">
          <CarouselContent>
            {items.map((item) => {
              const url = partyPack[item.key as keyof PartyPack];
              return (
                <CarouselItem key={item.key}>
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                          <span>{item.emoji}</span>
                          {item.title}
                        </h3>
                      </div>

                      <div className="relative aspect-[8.5/11] bg-muted rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => downloadItem(url, item.title)}
                          className="flex-1"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          onClick={() => shareItem(url, item.title)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="text-sm text-muted-foreground text-center space-y-1">
          <p>💡 <strong>Print Tips:</strong></p>
          <p>Use high-quality paper for best results. Print at 100% scale (no fit-to-page).</p>
          <p>For the banner, print each letter separately and string together.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}