import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const REMINDER_DISMISSED_KEY = 'admin_jan1_reminder_dismissed';
const REMINDER_DISMISS_DATE_KEY = 'admin_jan1_reminder_dismiss_date';

export const AdminSaleReminder = () => {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const now = new Date();
    // TESTING: Set to yesterday to test behavior
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const janFirst2026 = yesterday;
    // const janFirst2026 = new Date('2026-01-01T00:00:00');
    
    // Only show if we're past Jan 1, 2026
    if (now < janFirst2026) {
      return;
    }

    // Check if dismissed and when
    const dismissedDate = localStorage.getItem(REMINDER_DISMISS_DATE_KEY);
    if (dismissedDate) {
      const dismissed = new Date(dismissedDate);
      const tomorrow = new Date(dismissed);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // If it's been less than a day, stay dismissed
      if (now < tomorrow) {
        return;
      }
    }

    // Show the reminder
    setIsDismissed(false);
  }, []);

  const handleDismissForDay = () => {
    const now = new Date().toISOString();
    localStorage.setItem(REMINDER_DISMISS_DATE_KEY, now);
    setIsDismissed(true);
  };

  const handleDismissPermanently = () => {
    localStorage.setItem(REMINDER_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <Card className="max-w-4xl mx-auto bg-secondary/95 backdrop-blur-sm border-2 border-secondary shadow-2xl">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-secondary-foreground flex-shrink-0 mt-1" />
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-secondary-foreground mb-2">
                    🔔 FOUNDING MEMBER SALE DECISION REQUIRED
                  </h3>
                  <p className="text-secondary-foreground/90">
                    The founding member sale ended on December 31st. Choose what to do:
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-surface-elevated/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-party-mint" />
                      <span className="font-semibold">Option 1: Extend Sale</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Update the <code className="bg-background/50 px-1 rounded">saleEndDate</code> in:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• <code className="bg-background/50 px-1 rounded">UrgencyBanner.tsx</code></li>
                      <li>• <code className="bg-background/50 px-1 rounded">CountdownTimer.tsx</code></li>
                    </ul>
                  </div>

                  <div className="bg-surface-elevated/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5 text-destructive" />
                      <span className="font-semibold">Option 2: Close Sale</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Follow the complete cleanup steps in:
                    </p>
                    <p className="text-sm font-mono bg-background/50 px-2 py-1 rounded">
                      FOUNDING_MEMBER_CLEANUP_INSTRUCTIONS.md
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDismissForDay}
                    className="gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Remind Me Tomorrow
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismissPermanently}
                  >
                    I've Made My Decision - Don't Show Again
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismissForDay}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
