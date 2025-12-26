import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Users, BarChart3, ImageIcon, Shield, Trash2, Star, Mail, Globe, Settings } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { useAdsEnabled, useUpdateAdsEnabled } from '@/hooks/useAdsEnabled';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  email: string;
  is_premium: boolean;
  is_founding_member: boolean;
  created_at: string;
  country?: string;
  founding_member_number?: string;
}

interface CommunityImage {
  id: string;
  image_url: string;
  featured: boolean;
  created_at: string;
  prompt: string;
  profiles: { email: string };
}

interface BlogSubscriber {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  subscribed_at: string;
  is_active: boolean;
}

interface Analytics {
  totalUsers: number;
  premiumUsers: number;
  foundingMembers: number;
  totalImages: number;
  featuredImages: number;
  conversionRate: number;
  avgImagesPerUser: number;
  activeUsers: number;
  totalSubscribers: number;
}

interface ChartData {
  userGrowth: { date: string; users: number }[];
  imagesOverTime: { date: string; images: number }[];
  occasionTypes: { name: string; value: number }[];
  characters: { name: string; count: number }[];
  topUsers: { email: string; imageCount: number }[];
  relations: { name: string; count: number }[];
  subscriberGrowth: { date: string; subscribers: number }[];
  pageVisits: { page: string; visits: number; uniqueVisitors: number }[];
  pageVisitsOverTime: { date: string; visits: number }[];
}

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [images, setImages] = useState<CommunityImage[]>([]);
  const [subscribers, setSubscribers] = useState<BlogSubscriber[]>([]);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [userCountryStats, setUserCountryStats] = useState<{ country: string; count: number }[]>([]);
  const [removePremiumDialog, setRemovePremiumDialog] = useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });
  const [grantingPremium, setGrantingPremium] = useState<Set<string>>(new Set());
  const [selectedEmailType, setSelectedEmailType] = useState<'halted' | 'expired' | 'cancelled' | 'none'>('expired');
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    premiumUsers: 0,
    foundingMembers: 0,
    totalImages: 0,
    featuredImages: 0,
    conversionRate: 0,
    avgImagesPerUser: 0,
    activeUsers: 0,
    totalSubscribers: 0,
  });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const { adsEnabled, loading: adsLoading } = useAdsEnabled();
  const updateAdsEnabled = useUpdateAdsEnabled();
  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to access this page');
        navigate('/auth');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      setIsAdmin(true);
      loadDashboardData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    await Promise.all([
      loadProfiles(),
      loadImages(),
      loadAnalytics(),
      loadSubscribers(),
      loadPageVisits(),
    ]);
  };

  const loadPageVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('page_visits')
        .select('page_path, session_id, visited_at, country_code')
        .order('visited_at', { ascending: false });

      if (error) {
        console.error('Error loading page visits:', error);
        return;
      }

      // Calculate page visits by path
      const visitsByPage = (data || []).reduce((acc, visit) => {
        const page = visit.page_path;
        if (!acc[page]) {
          acc[page] = { visits: 0, sessions: new Set() };
        }
        acc[page].visits++;
        if (visit.session_id) {
          acc[page].sessions.add(visit.session_id);
        }
        return acc;
      }, {} as Record<string, { visits: number; sessions: Set<string> }>);

      const pageVisits = Object.entries(visitsByPage).map(([page, data]) => ({
        page,
        visits: data.visits,
        uniqueVisitors: data.sessions.size,
      })).sort((a, b) => b.visits - a.visits);

      // Page visits over last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return format(date, "MMM dd");
      });

      const pageVisitsOverTime = last30Days.map((date) => {
        const count = (data || []).filter((v) => {
          const visitDate = new Date(v.visited_at);
          return format(visitDate, "MMM dd") === date;
        }).length;
        return { date, visits: count };
      });

      setChartData(prev => prev ? { ...prev, pageVisits, pageVisitsOverTime } : null);
    } catch (error) {
      console.error('Error loading page visits:', error);
    }
  };

  const loadSubscribers = async () => {
    const { data, error } = await supabase
      .from('blog_subscribers')
      .select('id, email, first_name, last_name, subscribed_at, is_active')
      .order('subscribed_at', { ascending: false });

    if (error) {
      console.error('Error loading subscribers:', error);
      return;
    }

    setSubscribers(data || []);
  };

  const loadProfiles = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, is_premium, is_founding_member, created_at, founding_member_number')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error loading profiles:', profilesError);
      return;
    }

    // Fetch page visits to determine user countries
    const { data: pageVisitsData, error: pageVisitsError } = await supabase
      .from('page_visits')
      .select('user_id, country_code')
      .not('user_id', 'is', null);

    if (pageVisitsError) {
      console.error('Error loading page visits for countries:', pageVisitsError);
    }

    // Count visits per user per country to determine primary country
    const userCountryCounts: Record<string, Record<string, number>> = {};
    (pageVisitsData || []).forEach((visit) => {
      if (visit.user_id && visit.country_code) {
        if (!userCountryCounts[visit.user_id]) {
          userCountryCounts[visit.user_id] = {};
        }
        userCountryCounts[visit.user_id][visit.country_code] = 
          (userCountryCounts[visit.user_id][visit.country_code] || 0) + 1;
      }
    });

    // Assign primary country to each profile
    const profilesWithCountry = (profilesData || []).map((profile) => {
      const countryCounts = userCountryCounts[profile.id];
      let primaryCountry = 'Unknown';
      if (countryCounts) {
        const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
        if (sortedCountries.length > 0) {
          primaryCountry = sortedCountries[0][0];
        }
      }
      return { ...profile, country: primaryCountry };
    });

    setProfiles(profilesWithCountry);

    // Calculate country stats for pie chart
    const countryStatsMap: Record<string, number> = {};
    profilesWithCountry.forEach((profile) => {
      countryStatsMap[profile.country || 'Unknown'] = (countryStatsMap[profile.country || 'Unknown'] || 0) + 1;
    });
    const countryStats = Object.entries(countryStatsMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
    setUserCountryStats(countryStats);
  };

  const loadImages = async () => {
    const { data, error } = await supabase
      .from('generated_images')
      .select('id, image_url, featured, created_at, prompt, profiles(email)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading images:', error);
      return;
    }

    setImages(data || []);
  };

  const extractCharacterFromPrompt = (prompt: string): string => {
    const characterPatterns = [
      /featuring ([\w\s]+?)(?:,|\.|$)/i,
      /with ([\w\s]+?)(?:theme|design|,|\.|$)/i,
      /([\w\s]+) themed/i,
      /([\w\s]+) cake/i,
    ];
    
    for (const pattern of characterPatterns) {
      const match = prompt.match(pattern);
      if (match) return match[1].trim();
    }
    return "Other";
  };

  const loadAnalytics = async () => {
    try {
      const { data: profilesData } = await supabase.from('profiles').select('*');
      const { data: imagesData } = await supabase.from('generated_images').select('*');
      const { data: subscribersData } = await supabase.from('blog_subscribers').select('*');

      const totalUsers = profilesData?.length || 0;
      const premiumUsers = profilesData?.filter(p => p.is_premium).length || 0;
      const foundingMembers = profilesData?.filter(p => p.is_founding_member).length || 0;
      const totalImages = imagesData?.length || 0;
      const featuredImages = imagesData?.filter(img => img.featured).length || 0;
      const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;
      const avgImagesPerUser = totalUsers > 0 ? totalImages / totalUsers : 0;
      const activeUsers = profilesData?.filter(p => 
        imagesData?.some(img => img.user_id === p.id)
      ).length || 0;
      const totalSubscribers = subscribersData?.filter(s => s.is_active).length || 0;

      setAnalytics({
        totalUsers,
        premiumUsers,
        foundingMembers,
        totalImages,
        featuredImages,
        conversionRate,
        avgImagesPerUser,
        activeUsers,
        totalSubscribers,
      });

      // User growth over last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return format(date, "MMM dd");
      });
      
      const userGrowth = last30Days.map((date, index) => ({
        date,
        users: profilesData?.filter((p) => {
          const createdDate = new Date(p.created_at || "");
          const targetDate = subDays(new Date(), 29 - index);
          return createdDate <= targetDate;
        }).length || 0,
      }));

      // Images over time (last 30 days)
      const imagesOverTime = last30Days.map((date, index) => {
        const targetDate = subDays(new Date(), 29 - index);
        const count = imagesData?.filter((img) => {
          const imgDate = new Date(img.created_at || "");
          return format(imgDate, "MMM dd") === date;
        }).length || 0;
        return { date, images: count };
      });

      // Occasion types distribution
      const occasionCounts = imagesData?.reduce((acc, img) => {
        const type = img.occasion_type || "Other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const occasionTypes = Object.entries(occasionCounts).map(([name, value]) => ({
        name,
        value,
      }));

      // Character popularity
      const characterCounts = imagesData?.reduce((acc, img) => {
        const character = extractCharacterFromPrompt(img.prompt);
        acc[character] = (acc[character] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const characters = Object.entries(characterCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top users by image count
      const userImageCounts = imagesData?.reduce((acc, img) => {
        acc[img.user_id] = (acc[img.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const topUsers = Object.entries(userImageCounts)
        .map(([userId, imageCount]) => ({
          email: profilesData?.find(p => p.id === userId)?.email || "Unknown",
          imageCount,
        }))
        .sort((a, b) => b.imageCount - a.imageCount)
        .slice(0, 5);

      // Relation distribution (from message_type field)
      const relationCounts = imagesData?.reduce((acc, img) => {
        const relation = img.message_type || "Other";
        acc[relation] = (acc[relation] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const relations = Object.entries(relationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Subscriber growth over last 30 days
      const subscriberGrowth = last30Days.map((date, index) => ({
        date,
        subscribers: subscribersData?.filter((s) => {
          const subscribedDate = new Date(s.subscribed_at || "");
          const targetDate = subDays(new Date(), 29 - index);
          return subscribedDate <= targetDate && s.is_active;
        }).length || 0,
      }));

      setChartData(prev => ({
        userGrowth,
        imagesOverTime,
        occasionTypes,
        characters,
        topUsers,
        relations,
        subscriberGrowth,
        pageVisits: prev?.pageVisits || [],
        pageVisitsOverTime: prev?.pageVisitsOverTime || [],
      }));
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics");
    }
  };

  const toggleFeatured = async (imageId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('generated_images')
      .update({ featured: !currentStatus })
      .eq('id', imageId);

    if (error) {
      toast.error('Failed to update image status');
      return;
    }

    toast.success(currentStatus ? 'Image unfeatured' : 'Image featured');
    loadImages();
    loadAnalytics();
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const { error } = await supabase
      .from('generated_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      toast.error('Failed to delete image');
      return;
    }

    toast.success('Image deleted successfully');
    loadImages();
    loadAnalytics();
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    // Prevent double-clicks
    if (grantingPremium.has(userId)) {
      toast.info('Please wait, processing...');
      return;
    }

    if (!currentStatus) {
      // Set loading state
      setGrantingPremium(prev => new Set(prev).add(userId));
      
      // Granting premium - check for existing founding member record in database
      try {
        // Check database directly for existing founding member record (not just profile)
        const { data: existingMember } = await supabase
          .from('founding_members')
          .select('member_number')
          .eq('user_id', userId)
          .maybeSingle();
        
        let memberNumber: string;
        
        if (existingMember?.member_number) {
          // Reuse existing member number (re-granting premium)
          memberNumber = existingMember.member_number;
          console.log('Reactivating with existing member number:', memberNumber);
          
          // Update existing founding member record
          await supabase
            .from('founding_members')
            .update({
              tier: 'admin_grant',
              special_badge: 'gift',
            })
            .eq('user_id', userId);
        } else {
          // Generate new GIFT member number for first-time grant
          const { count: giftCount } = await supabase
            .from('founding_members')
            .select('*', { count: 'exact', head: true })
            .eq('tier', 'admin_grant');

          const currentYear = new Date().getFullYear();
          memberNumber = `${currentYear}-GIFT-${1000 + (giftCount || 0)}`;

          // Create founding member record
          const { error: insertError } = await supabase
            .from('founding_members')
            .insert({
              user_id: userId,
              tier: 'admin_grant',
              member_number: memberNumber,
              price_paid: 0,
              special_badge: 'gift',
              display_on_wall: false,
            });

          if (insertError) {
            console.error('Failed to create founding member:', insertError);
            toast.error('Failed to create member record');
            setGrantingPremium(prev => {
              const next = new Set(prev);
              next.delete(userId);
              return next;
            });
            return;
          }
        }

        // Update profile to premium
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_premium: true,
            is_founding_member: true,
            founding_member_number: memberNumber,
            founding_tier: 'admin_grant',
            lifetime_access: true,
            premium_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            purchased_date: new Date().toISOString(),
          })
          .eq('id', userId);

        if (profileError) {
          toast.error('Failed to update user status');
          setGrantingPremium(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
          return;
        }

        // Send premium emails via edge function
        try {
          await supabase.functions.invoke('send-premium-emails', {
            body: {
              userId,
              memberNumber,
              tier: 'admin_grant',
              amount: 0,
              currency: 'USD',
              razorpay_payment_id: `ADMIN_${Date.now()}`,
              razorpay_order_id: `ADMIN_GRANT_${memberNumber}`,
            },
          });
          console.log('Premium emails sent for admin grant');
        } catch (emailError) {
          console.error('Failed to send premium emails:', emailError);
          // Don't fail the operation if emails fail
        }

        toast.success(`Premium granted! Member ${memberNumber}`);
        
        // Clear loading state
        setGrantingPremium(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } catch (error) {
        console.error('Error granting premium:', error);
        toast.error('Failed to grant premium');
        setGrantingPremium(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        return;
      }
    } else {
      // Show dialog to select email type for removing premium
      setRemovePremiumDialog({ open: true, userId });
      return; // Don't proceed until user selects email type
    }
    
    loadProfiles();
    loadAnalytics();
  };

  const handleRemovePremium = async () => {
    const userId = removePremiumDialog.userId;
    if (!userId) return;

    // Send subscription ended email if not 'none'
    if (selectedEmailType !== 'none') {
      try {
        await supabase.functions.invoke('send-premium-emails', {
          body: {
            userId,
            status: selectedEmailType,
            subscriptionId: `ADMIN_REVOKE_${Date.now()}`,
            periodEndDate: new Date().toISOString(),
          },
        });
        console.log(`Subscription ${selectedEmailType} email sent`);
        toast.success(`${selectedEmailType.charAt(0).toUpperCase() + selectedEmailType.slice(1)} notification email sent`);
      } catch (emailError) {
        console.error('Failed to send subscription ended email:', emailError);
        toast.error('Failed to send notification email');
      }
    }

    // Update profile to remove premium
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: false,
        premium_until: null,
        subscription_status: selectedEmailType === 'none' ? null : selectedEmailType,
      })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user status');
      return;
    }

    toast.success('Premium removed');
    setRemovePremiumDialog({ open: false, userId: null });
    setSelectedEmailType('expired');
    loadProfiles();
    loadAnalytics();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  return (
    <>
      {/* Remove Premium Dialog */}
      <AlertDialog open={removePremiumDialog.open} onOpenChange={(open) => setRemovePremiumDialog({ ...removePremiumDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Premium Access</AlertDialogTitle>
            <AlertDialogDescription>
              Select which notification email to send to the user:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                name="emailType"
                value="halted"
                checked={selectedEmailType === 'halted'}
                onChange={() => setSelectedEmailType('halted')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">Halted</p>
                <p className="text-sm text-muted-foreground">Payment failed message</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                name="emailType"
                value="expired"
                checked={selectedEmailType === 'expired'}
                onChange={() => setSelectedEmailType('expired')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">Expired</p>
                <p className="text-sm text-muted-foreground">Subscription ended naturally</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                name="emailType"
                value="cancelled"
                checked={selectedEmailType === 'cancelled'}
                onChange={() => setSelectedEmailType('cancelled')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">Cancelled</p>
                <p className="text-sm text-muted-foreground">User cancelled message</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                name="emailType"
                value="none"
                checked={selectedEmailType === 'none'}
                onChange={() => setSelectedEmailType('none')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">No email</p>
                <p className="text-sm text-muted-foreground">Silent removal (testing only)</p>
              </div>
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEmailType('expired')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemovePremium}>
              Remove Premium
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin Dashboard - Cake AI Artist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Manage users, analytics, and community content</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Home
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{analytics.activeUsers} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.premiumUsers}</div>
              <p className="text-xs text-muted-foreground">{analytics.conversionRate.toFixed(1)}% conversion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Total Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalImages}</div>
              <p className="text-xs text-muted-foreground">{analytics.avgImagesPerUser.toFixed(1)} avg/user</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Featured Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.featuredImages}</div>
              <p className="text-xs text-muted-foreground">{analytics.foundingMembers} founding members</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="page-visits">
              <Globe className="w-4 h-4 mr-2" />
              Page Visits
            </TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="images">Community Moderation</TabsTrigger>
            <TabsTrigger value="subscribers">
              <Mail className="w-4 h-4 mr-2" />
              Blog Subscribers
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {chartData && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth (Last 30 Days)</CardTitle>
                      <CardDescription>Total registered users over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Images Generated (Last 30 Days)</CardTitle>
                      <CardDescription>Daily cake creations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.imagesOverTime}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="images" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Occasion Types Distribution</CardTitle>
                      <CardDescription>What occasions are most popular</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.occasionTypes}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.occasionTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top 10 Popular Characters</CardTitle>
                      <CardDescription>Most requested themes and characters</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.characters} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--accent))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Most Active Users</CardTitle>
                      <CardDescription>Top users by number of cakes created</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Cakes Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chartData.topUsers.map((user, index) => (
                            <TableRow key={index}>
                              <TableCell>{user.email}</TableCell>
                              <TableCell className="text-right font-bold">{user.imageCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recipient Relations</CardTitle>
                      <CardDescription>Who are cakes being made for</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Relation</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chartData.relations.map((relation, index) => (
                            <TableRow key={index}>
                              <TableCell className="capitalize">{relation.name}</TableCell>
                              <TableCell className="text-right font-bold">{relation.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="page-visits" className="space-y-6">
            {chartData && (
              <>
                {/* Page Visits Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Total Page Views
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {chartData.pageVisits.reduce((sum, p) => sum + p.visits, 0)}
                      </div>
                    </CardContent>
                  </Card>
                  {['/', '/uk', '/canada', '/australia'].map((path) => {
                    const pageData = chartData.pageVisits.find(p => p.page === path);
                    const label = path === '/' ? 'US (Home)' : path.replace('/', '').toUpperCase();
                    return (
                      <Card key={path}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{pageData?.visits || 0}</div>
                          <p className="text-xs text-muted-foreground">
                            {pageData?.uniqueVisitors || 0} unique visitors
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Page Views (Last 30 Days)</CardTitle>
                      <CardDescription>Total daily page views across all pages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.pageVisitsOverTime}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="visits" fill="hsl(var(--primary))" name="Page Views" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Visits by Page</CardTitle>
                      <CardDescription>Distribution of traffic across landing pages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.pageVisits.filter(p => ['/', '/uk', '/canada', '/australia'].includes(p.page))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ page, percent }) => {
                              const label = page === '/' ? 'US' : page.replace('/', '').toUpperCase();
                              return `${label} ${(percent * 100).toFixed(0)}%`;
                            }}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="visits"
                            nameKey="page"
                          >
                            {chartData.pageVisits.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>All Page Visits</CardTitle>
                    <CardDescription>Complete breakdown of page traffic</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page</TableHead>
                          <TableHead className="text-right">Total Views</TableHead>
                          <TableHead className="text-right">Unique Visitors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chartData.pageVisits.map((page, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{page.page}</TableCell>
                            <TableCell className="text-right">{page.visits}</TableCell>
                            <TableCell className="text-right">{page.uniqueVisitors}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {/* Country Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { code: 'US', label: '🇺🇸 US', flag: '🇺🇸' },
                { code: 'UK', label: '🇬🇧 UK', flag: '🇬🇧' },
                { code: 'CA', label: '🇨🇦 Canada', flag: '🇨🇦' },
                { code: 'AU', label: '🇦🇺 Australia', flag: '🇦🇺' },
                { code: 'Unknown', label: '❓ Unknown', flag: '❓' },
              ].map(({ code, label }) => {
                const count = userCountryStats.find(s => s.country === code)?.count || 0;
                return (
                  <Card key={code} className={`cursor-pointer transition-all ${countryFilter === code ? 'ring-2 ring-primary' : ''}`} onClick={() => setCountryFilter(code)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{count}</div>
                      <p className="text-xs text-muted-foreground">users</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users by Country Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Users by Country</CardTitle>
                  <CardDescription>Distribution of users across countries</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={userCountryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="country"
                      >
                        {userCountryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Management Table */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage user accounts and premium status</CardDescription>
                    </div>
                    {/* Country Filter Tabs */}
                    <div className="flex gap-1 flex-wrap">
                      {['all', 'US', 'UK', 'CA', 'AU', 'Unknown'].map((filter) => (
                        <Button
                          key={filter}
                          size="sm"
                          variant={countryFilter === filter ? 'default' : 'outline'}
                          onClick={() => setCountryFilter(filter)}
                        >
                          {filter === 'all' ? 'All' : filter}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles
                        .filter((profile) => countryFilter === 'all' || profile.country === countryFilter)
                        .map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {profile.country === 'US' && '🇺🇸 '}
                                {profile.country === 'UK' && '🇬🇧 '}
                                {profile.country === 'CA' && '🇨🇦 '}
                                {profile.country === 'AU' && '🇦🇺 '}
                                {profile.country === 'Unknown' && '❓ '}
                                {profile.country}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {profile.is_premium && <Badge variant="default">Premium</Badge>}
                                {profile.is_founding_member && <Badge className="bg-amber-600">Founding</Badge>}
                                {!profile.is_premium && !profile.is_founding_member && <Badge variant="secondary">Free</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={profile.is_premium ? "destructive" : "default"}
                                onClick={() => togglePremium(profile.id, profile.is_premium)}
                                disabled={grantingPremium.has(profile.id)}
                              >
                                {grantingPremium.has(profile.id) 
                                  ? 'Processing...' 
                                  : (profile.is_premium ? 'Remove Premium' : 'Grant Premium')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Content Moderation</CardTitle>
                <CardDescription>Moderate and feature community cake images</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <Card key={image.id}>
                      <CardContent className="p-4">
                        <div className="aspect-square relative mb-2 overflow-hidden rounded-lg">
                          <img
                            src={image.image_url}
                            alt="Cake design"
                            className="w-full h-full object-cover"
                          />
                          {image.featured && (
                            <Badge className="absolute top-2 right-2 bg-green-600">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {image.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          By: {image.profiles?.email || 'Unknown'}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={image.featured ? "outline" : "default"}
                            onClick={() => toggleFeatured(image.id, image.featured)}
                            className="flex-1"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {image.featured ? 'Unfeature' : 'Feature'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteImage(image.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Total Subscribers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalSubscribers}</div>
                  <p className="text-xs text-muted-foreground">Active subscriptions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">With Names</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {subscribers.filter(s => s.first_name || s.last_name).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Identified users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Anonymous</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {subscribers.filter(s => !s.first_name && !s.last_name).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Email only</p>
                </CardContent>
              </Card>
            </div>

            {chartData && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Subscriber Growth (Last 30 Days)</CardTitle>
                  <CardDescription>Total active blog subscribers over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData.subscriberGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="subscribers" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Blog Subscribers</CardTitle>
                <CardDescription>Users who subscribed to blog updates</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No subscribers yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscribers.map((subscriber) => (
                        <TableRow key={subscriber.id}>
                          <TableCell className="font-medium">
                            {subscriber.first_name || subscriber.last_name
                              ? `${subscriber.first_name || ''} ${subscriber.last_name || ''}`.trim()
                              : <span className="text-muted-foreground italic">Anonymous</span>
                            }
                          </TableCell>
                          <TableCell>{subscriber.email}</TableCell>
                          <TableCell>{new Date(subscriber.subscribed_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {subscriber.is_active ? (
                              <Badge variant="default" className="bg-green-600">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Unsubscribed</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Site Settings
                </CardTitle>
                <CardDescription>Configure site-wide settings and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ads Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Enable Advertisements</h3>
                    <p className="text-sm text-muted-foreground">
                      Toggle Google AdSense advertisements across the entire site. 
                      Disable for testing or compliance purposes.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Note: Actual ads will only display once you have valid AdSense slot IDs configured.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={adsEnabled ? "default" : "secondary"}>
                      {adsEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch
                      checked={adsEnabled}
                      disabled={adsLoading || updateAdsEnabled.isPending}
                      onCheckedChange={(checked) => {
                        updateAdsEnabled.mutate(checked, {
                          onSuccess: () => {
                            toast.success(`Ads ${checked ? 'enabled' : 'disabled'} site-wide`);
                          },
                          onError: (error) => {
                            toast.error('Failed to update ads setting');
                            console.error('Error updating ads setting:', error);
                          },
                        });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}