import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Trash2, AlertTriangle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          email_reminders: data.email_reminders ?? true,
          birthday_reminders: data.birthday_reminders ?? true,
          marketing_emails: data.marketing_emails ?? false,
          anniversary_reminders: data.anniversary_reminders ?? true,
        });
      } else {
        // No settings exist, create default settings for this user
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({ user_id: userId });
        
        if (insertError) {
          console.error("Error creating default settings:", insertError);
        }
        // Keep default settings state as-is
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

      // Use upsert to handle case where settings don't exist yet
      const { error } = await supabase
        .from("user_settings")
        .upsert({ 
          user_id: session.user.id,
          ...settings 
        }, { 
          onConflict: 'user_id' 
        });

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

  // GDPR: Export user data
  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email;

      // Fetch all user data from different tables
      const [profileRes, imagesRes, settingsRes, partyPacksRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("generated_images").select("*").eq("user_id", userId),
        supabase.from("user_settings").select("*").eq("user_id", userId).single(),
        supabase.from("party_packs").select("*").eq("user_id", userId),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          email: userEmail,
          id: userId,
        },
        profile: profileRes.data || null,
        settings: settingsRes.data || null,
        generatedImages: imagesRes.data || [],
        partyPacks: partyPacksRes.data || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cake-ai-artist-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // GDPR: Delete user account and all data
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const userId = session.user.id;

      // Delete user data from all tables (in order to respect foreign keys)
      await Promise.all([
        supabase.from("party_packs").delete().eq("user_id", userId),
        supabase.from("generated_images").delete().eq("user_id", userId),
        supabase.from("generation_tracking").delete().eq("user_id", userId),
        supabase.from("achievements").delete().eq("user_id", userId),
        supabase.from("referrals").delete().eq("referrer_id", userId),
        supabase.from("user_settings").delete().eq("user_id", userId),
      ]);

      // Delete profile
      await supabase.from("profiles").delete().eq("id", userId);

      // Sign out the user
      await supabase.auth.signOut();

      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete your account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
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
      <Helmet>
        <title>Settings - Manage Your Preferences | Cake AI Artist</title>
        <meta name="description" content="Manage your Cake AI Artist account settings. Configure email reminders, notification preferences, and personalize your virtual cake designer experience." />
        <meta name="keywords" content="account settings, cake designer preferences, email notifications, user settings" />
        <link rel="canonical" href="https://cakeaiartist.com/settings" />
      </Helmet>
      
      <nav className="container mx-auto px-4 py-6 backdrop-blur-sm bg-background/80 sticky top-0 z-40 border-b border-border/30">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <div className="w-24"></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-2xl space-y-6">
        {/* Notification Preferences */}
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

        {/* GDPR Data Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Data Rights (GDPR)</CardTitle>
            <CardDescription>
              Access, export, or delete your personal data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Export Data */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Export Your Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your personal data in JSON format
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="space-y-0.5">
                <Label className="text-base font-medium text-destructive">Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete Your Account?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This action <strong>cannot be undone</strong>. This will permanently delete:</p>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li>Your profile and account information</li>
                        <li>All your generated cake images</li>
                        <li>Your party packs and designs</li>
                        <li>Your settings and preferences</li>
                        <li>Any premium membership (non-refundable)</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
