import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const BlogCTABox = () => {
  return (
    <div className="my-10 p-6 md:p-8 bg-gradient-to-r from-party-purple/10 to-party-pink/10 rounded-xl border border-party-pink/20 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex w-12 h-12 rounded-full bg-gradient-party items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-foreground">Ready to Create Your Own?</h3>
          <p className="text-muted-foreground mb-4">
            Turn these ideas into reality with our AI cake designer. It takes just 30 seconds.
          </p>
          <Link to="/">
            <Button className="bg-gradient-party hover:opacity-90 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Try It Free →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
