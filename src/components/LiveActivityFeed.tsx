import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Users, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Activity {
  id: string;
  message: string;
  created_at: string;
}

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const isMountedRef = useRef(true);
  // Memoize random "online now" count to prevent re-render issues
  const [onlineCount] = useState(() => Math.floor(Math.random() * 500) + 100);

  useEffect(() => {
    isMountedRef.current = true;
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
          if (isMountedRef.current) {
            setActivities((prev) => [payload.new as Activity, ...prev].slice(0, 5));
          }
        }
      )
      .subscribe();

    return () => {
      isMountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const loadActivities = async () => {
    // SECURITY: Only select needed fields, not user_id
    const { data } = await supabase
      .from("activity_feed")
      .select("id, message, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (data && isMountedRef.current) setActivities(data);
  };

  if (activities.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 w-80">
      <motion.div
        initial={{ opacity: 0, x: -100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <Card className="p-5 bg-surface-elevated/98 backdrop-blur-md border-2 border-party-pink/40 shadow-xl shadow-party-pink/20">
          {/* Header with urgency */}
          <div className="flex items-center gap-2 mb-4">
            <motion.div 
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
              className="p-2 bg-gradient-party rounded-full shadow-lg"
            >
              <TrendingUp className="h-4 w-4 text-white" />
            </motion.div>
            <div className="flex-1">
              <span className="text-base font-bold text-foreground">Live Activity</span>
              <div className="flex items-center gap-1 text-xs text-party-pink">
                <Flame className="h-3 w-3" />
                <span>High demand right now</span>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
            />
          </div>

          {/* Activity list */}
          <div className="space-y-3">
            {activities.slice(0, 4).map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-sm text-foreground/80 flex items-start gap-2 bg-background/50 rounded-lg p-2"
              >
                <Sparkles className="h-4 w-4 text-party-pink mt-0.5 flex-shrink-0" />
                <span className="leading-tight">{activity.message}</span>
              </motion.div>
            ))}
          </div>

          {/* Footer with online count */}
          <div className="mt-4 pt-3 border-t border-party-pink/20 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-party-purple" />
              <span className="text-party-purple font-bold">{onlineCount}</span> browsing now
            </span>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-xs bg-gradient-party text-white px-2 py-1 rounded-full font-semibold"
            >
              LIVE
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
