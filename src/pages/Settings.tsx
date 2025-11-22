import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_reminders: true,
    birthday_reminders: true,
    marketing_emails: false,
    anniversary_reminders: true,
  });

  useEffect(() => {
    checkAuthAndLoadSettings();
  }, []);

  const checkAuthAndLoadSettings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    await loadSettings(session.user.id);
  };

  const loadSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          email_reminders: data.email_reminders ?? true,
          birthday_reminders: data.birthday_reminders ?? true,
          marketing_emails: data.marketing_emails ?? false,
          anniversary_reminders: data.anniversary_reminders ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("user_settings")
        .update(settings)
        .eq("user_id", session.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-celebration flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-celebration">
      <nav className="container mx-auto px-4 py-6 backdrop-blur-sm bg-background/80 sticky top-0 z-40 border-b border-border/30">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <div className="w-24"></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how you'd like to receive updates from CakeWish
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_reminders">Email Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive general email notifications
                </p>
              </div>
              <Switch
                id="email_reminders"
                checked={settings.email_reminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, email_reminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anniversary_reminders">Anniversary Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded 1 week before saved occasion dates
                </p>
              </div>
              <Switch
                id="anniversary_reminders"
                checked={settings.anniversary_reminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, anniversary_reminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="birthday_reminders">Birthday Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive birthday-specific reminders
                </p>
              </div>
              <Switch
                id="birthday_reminders"
                checked={settings.birthday_reminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, birthday_reminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing_emails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and offers
                </p>
              </div>
              <Switch
                id="marketing_emails"
                checked={settings.marketing_emails}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, marketing_emails: checked })
                }
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}