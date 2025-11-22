import { useState } from "react";
import { MessageSquare, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Check if already submitted today
    const lastSubmission = localStorage.getItem('last_feedback_submission');
    if (lastSubmission) {
      const lastDate = new Date(lastSubmission);
      const now = new Date();
      if (now.getTime() - lastDate.getTime() < 24 * 60 * 60 * 1000) {
        toast({
          title: "Feedback limit reached",
          description: "You can submit feedback once per day. Thank you!",
          variant: "destructive",
        });
        return;
      }
    }

    if (!rating) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Login required",
          description: "Please log in to submit feedback",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("feedback")
        .insert({
          user_id: session.user.id,
          rating,
          feedback_type: "widget",
          category: category || "general",
          message: message.trim() || null,
          page_url: window.location.pathname,
        });

      if (error) throw error;

      localStorage.setItem('last_feedback_submission', new Date().toISOString());

      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve Cake AI Artist.",
      });

      // Reset form
      setRating(0);
      setCategory("");
      setMessage("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg px-4 py-6 bg-party-purple hover:bg-party-purple/90"
        size="lg"
      >
        <MessageSquare className="w-5 h-5 mr-2" />
        Feedback
      </Button>

      {/* Feedback Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-party-purple" />
              Share Your Feedback
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">How would you rate your experience?</label>
              <div className="flex gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? "fill-gold text-gold"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Category (Optional)</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="compliment">Compliment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Any thoughts? (Optional)</label>
              <Textarea
                placeholder="Tell us more..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !rating}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
