import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Activity {
  id: string;
  message: string;
  created_at: string;
}

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    loadActivities();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("activity_feed_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_feed",
        },
        (payload) => {
          setActivities((prev) => [payload.new as Activity, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    // Rotation effect - show/hide periodically
    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const loadActivities = async () => {
    const { data } = await supabase
      .from("activity_feed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) setActivities(data);
  };

  if (activities.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <Card className="p-4 bg-surface-elevated/95 backdrop-blur-sm border-party-pink/30 shadow-party">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gradient-party rounded-full">
                  <TrendingUp className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-foreground">Live Activity</span>
                <div className="ml-auto flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {activities.slice(0, 3).map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <Sparkles className="h-3 w-3 text-party-pink mt-0.5 flex-shrink-0" />
                    <span>{activity.message}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {Math.floor(Math.random() * 500) + 100} online now
                </span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
