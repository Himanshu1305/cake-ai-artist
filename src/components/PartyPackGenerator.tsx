import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Download, Loader2, Calendar, Clock, MapPin } from "lucide-react";
import { PartyPackPreview } from "./PartyPackPreview";
import { generatePartyPackPDF } from "@/utils/partyPackPDF";

interface PartyPackGeneratorProps {
  cakeImageId: string;
  name: string;
  occasion: string;
  theme?: string;
  colors?: string;
  character?: string;
}

interface PartyPack {
  id: string;
  invitation_url: string;
  thank_you_card_url: string;
  banner_url: string;
  cake_topper_url: string;
  place_cards_url: string;
  created_at: string;
}

export function PartyPackGenerator({
  cakeImageId,
  name,
  occasion,
  theme,
  colors,
  character
}: PartyPackGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [partyPack, setPartyPack] = useState<PartyPack | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  
  // Event details state
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  const generatePartyPack = async () => {
    try {
      setIsGenerating(true);
      setProgress(10);
      setCurrentStep("🎨 Preparing your party pack design...");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to generate party packs");
        return;
      }

      setProgress(20);
      setCurrentStep("🎉 Creating invitation card...");

      const { data, error } = await supabase.functions.invoke("generate-party-pack", {
        body: {
          cakeImageId,
          name,
          occasion,
          theme,
          colors,
          character,
          eventDate,
          eventTime,
          eventLocation
        }
      });

      if (error) throw error;

      setProgress(60);
      setCurrentStep("🎁 Generating thank you cards...");

      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(80);
      setCurrentStep("🎈 Adding final touches...");

      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(100);
      setCurrentStep("✨ Party pack ready!");

      setPartyPack(data.partyPack);
      setShowPreview(true);
      toast.success("Party pack generated successfully! 🎉");

    } catch (error) {
      console.error("Error generating party pack:", error);
      toast.error("Failed to generate party pack. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep("");
    }
  };

  const downloadAll = async () => {
    if (!partyPack) return;

    try {
      toast.info("Preparing PDF download...");
      
      const pdfBlob = await generatePartyPackPDF(partyPack, name, occasion);
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `party-pack-${name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Party pack PDF downloaded! 📄");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. You can still download individual items.");
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Event Details Form */}
        {!partyPack && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-party-gold" />
              Party Details (Optional)
            </h3>
            <p className="text-sm text-muted-foreground">
              Add event details to include on your invitation card
            </p>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="eventDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Event Date
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="bg-background"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="eventTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Event Time
                </Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="bg-background"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="eventLocation" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Event Location
                </Label>
                <Input
                  id="eventLocation"
                  type="text"
                  placeholder="e.g., 123 Party Street, City"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {!partyPack && (
          <Button
            onClick={generatePartyPack}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-party-purple to-party-pink hover:from-party-purple/90 hover:to-party-pink/90 text-white font-bold"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Party Pack...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-5 w-5" />
                Generate Party Pack
              </>
            )}
          </Button>
        )}

        {isGenerating && (
          <div className="space-y-2">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-party-purple to-party-pink transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {currentStep}
            </p>
          </div>
        )}

        {partyPack && (
          <div className="space-y-3">
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="w-full border-party-purple text-party-purple hover:bg-party-purple/10"
              size="lg"
            >
              <Gift className="mr-2 h-5 w-5" />
              View All Party Items
            </Button>

            <Button
              onClick={downloadAll}
              className="w-full bg-gradient-to-r from-party-gold to-party-orange text-background font-bold"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Download All (PDF)
            </Button>
          </div>
        )}
      </div>

      {partyPack && (
        <PartyPackPreview
          partyPack={partyPack}
          name={name}
          occasion={occasion}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </>
  );
}
