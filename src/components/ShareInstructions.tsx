import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Monitor, Facebook, MessageCircle, Instagram, X as XIcon, CheckCircle, Download, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ShareInstructionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareInstructions = ({ open, onOpenChange }: ShareInstructionsProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenShareInstructions', 'true');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            📱 How to Share Your Cake Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-center text-foreground/70">
            Choose your device type to see specific instructions
          </p>

          <Tabs defaultValue="mobile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Desktop
              </TabsTrigger>
            </TabsList>

            {/* Mobile Instructions */}
            <TabsContent value="mobile" className="space-y-4 mt-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-party-pink flex items-center justify-center text-white font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Tap the Platform Button</h4>
                    <p className="text-sm text-foreground/70">
                      Click on Facebook, X, WhatsApp, or Instagram below
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-party-pink shrink-0" />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-party-purple flex items-center justify-center text-white font-bold shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Image Downloads & App Opens</h4>
                    <p className="text-sm text-foreground/70">
                      The image saves to your gallery, and we'll try to open the app for you
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-party-mint shrink-0" />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-party-mint flex items-center justify-center text-white font-bold shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Select & Share</h4>
                    <p className="text-sm text-foreground/70">
                      In the app, create a new post and select the downloaded image from your gallery
                    </p>
                  </div>
                  <Upload className="w-5 h-5 text-party-gold shrink-0" />
                </div>
              </Card>

              {/* Platform-Specific Tips */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Platform-Specific Tips:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Card className="p-3 bg-card border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Facebook className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold text-foreground">Facebook</span>
                    </div>
                    <p className="text-xs text-foreground/70">Tap "What's on your mind?" → Photo/Video</p>
                  </Card>
                  <Card className="p-3 bg-card border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <XIcon className="w-4 h-4 text-foreground" />
                      <span className="text-xs font-semibold text-foreground">X</span>
                    </div>
                    <p className="text-xs text-foreground/70">Tap "+" → Media → Select Image</p>
                  </Card>
                  <Card className="p-3 bg-card border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-semibold text-foreground">WhatsApp</span>
                    </div>
                    <p className="text-xs text-foreground/70">Paperclip icon → Gallery → Downloaded Image</p>
                  </Card>
                  <Card className="p-3 bg-card border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Instagram className="w-4 h-4 text-party-pink" />
                      <span className="text-xs font-semibold text-foreground">Instagram</span>
                    </div>
                    <p className="text-xs text-foreground/70">Tap "+" → Post → Select from Gallery</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Desktop Instructions */}
            <TabsContent value="desktop" className="space-y-4 mt-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-party-pink flex items-center justify-center text-white font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Click the Platform Button</h4>
                    <p className="text-sm text-foreground/70">
                      Click on Facebook, X, WhatsApp, or Instagram to download the card
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-party-pink shrink-0" />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-party-purple flex items-center justify-center text-white font-bold shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Image Saves to Downloads</h4>
                    <p className="text-sm text-foreground/70">
                      The card will be saved to your Downloads folder (check your browser's download notification)
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-party-mint shrink-0" />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-party-mint flex items-center justify-center text-white font-bold shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Open Platform & Upload</h4>
                    <p className="text-sm text-foreground/70">
                      Open the social media platform in your browser and upload the downloaded image
                    </p>
                  </div>
                  <Upload className="w-5 h-5 text-party-gold shrink-0" />
                </div>
              </Card>

              {/* Platform-Specific Desktop Instructions */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Platform-Specific Steps:</h4>
                <div className="space-y-2">
                  <Card className="p-3 bg-card border-border">
                    <div className="flex items-start gap-2">
                      <Facebook className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-foreground mb-1">Facebook:</p>
                        <p className="text-xs text-foreground/70">
                          Click "What's on your mind?" → "Photo/Video" → Select downloaded image → Add caption → "Post"
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-card border-border">
                    <div className="flex items-start gap-2">
                      <XIcon className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-foreground mb-1">X (Twitter):</p>
                        <p className="text-xs text-foreground/70">
                          Click "Post" button → Media icon → Select downloaded image → Add text → "Post"
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-card border-border">
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-foreground mb-1">WhatsApp Web:</p>
                        <p className="text-xs text-foreground/70">
                          Open chat → Paperclip icon → "Photos & Videos" → Select image → Send
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-card border-border">
                    <div className="flex items-start gap-2">
                      <Instagram className="w-5 h-5 text-party-pink shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-foreground mb-1">Instagram:</p>
                        <p className="text-xs text-foreground/70">
                          Instagram desktop doesn't support uploads. Use your phone: Open Instagram app → "+" → Post → Gallery → Select image
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Why This Approach Section */}
          <Card className="p-4 bg-party-purple/10 border-party-purple/30">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-party-mint" />
              Why download-then-upload?
            </h4>
            <p className="text-sm text-foreground/70">
              Most social media platforms don't allow direct image uploads from websites for security reasons. 
              This two-step process gives you full control over how you post and ensures the best quality image is shared!
            </p>
          </Card>

          {/* Don't Show Again Checkbox */}
          <div className="flex items-center space-x-2 justify-center">
            <Checkbox 
              id="dontShow" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <Label 
              htmlFor="dontShow" 
              className="text-sm text-foreground/70 cursor-pointer"
            >
              Don't show this again
            </Label>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-party text-white hover:opacity-90 transition-opacity"
            size="lg"
          >
            Got it! Let's Share 🎉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
