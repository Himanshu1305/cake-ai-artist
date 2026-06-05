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
import { Users, BarChart3, ImageIcon, Shield, Trash2, Star, Mail, Globe, Settings, FileText, Clock, Calendar, Eye, Download, Copy } from 'lucide-react';
import { ScheduledTasksWidget } from '@/components/ScheduledTasksWidget';
import { UserActivityPanel } from '@/components/admin/UserActivityPanel';
import { GlobalReachAdmin } from '@/components/admin/GlobalReachAdmin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HolidaySalesManager } from '@/components/HolidaySalesManager';
import { CountryPicker } from '@/components/CountryPicker';
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
  cake_count?: number;
  party_count?: number;
  last_seen?: string | null;
}

interface CommunityImage {
  id: string;
  image_url: string;
  featured: boolean;
  created_at: string;
  prompt: string;
  profiles: { email: string };
  featured_page: string | null;
  featured_pages: string[] | null;
  occasion_type: string | null;
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

const FEATURED_PAGE_OPTIONS = [
  // Main pages
  { value: "home", label: "🏠 Homepage" },
  { value: "free-ai-cake-designer", label: "🎂 Free AI Cake Designer" },
  { value: "ai-cake-generator-free", label: "✨ AI Cake Generator Free" },
  { value: "3d-cake-designer", label: "📦 3D Cake Designer" },
  { value: "ai-birthday-cake-with-name", label: "🔤 AI Birthday Cake with Name" },
  { value: "community", label: "🖼️ Community Gallery" },
  // Country pages
  { value: "india", label: "🇮🇳 India" },
  { value: "uk", label: "🇬🇧 UK" },
  { value: "usa", label: "🇺🇸 USA" },
  { value: "australia", label: "🇦🇺 Australia" },
  { value: "canada", label: "🇨🇦 Canada" },
  // Occasion pages
  { value: "wedding", label: "💍 Wedding" },
  { value: "graduation", label: "🎓 Graduation" },
  { value: "eid", label: "🌙 Eid" },
  { value: "anniversary", label: "❤️ Anniversary" },
  { value: "baby-shower", label: "👶 Baby Shower" },
  { value: "diwali", label: "🎆 Diwali" },
  { value: "halloween", label: "🎃 Halloween" },
  { value: "christmas", label: "🎄 Christmas" },
  { value: "birthday", label: "🎈 Birthday" },
  { value: "valentines", label: "💝 Valentine's Day" },
  { value: "mothers-day", label: "🌸 Mother's Day" },
  { value: "fathers-day", label: "👔 Father's Day" },
  { value: "thanksgiving", label: "🦃 Thanksgiving" },
  { value: "easter", label: "🐣 Easter" },
  { value: "holi", label: "🎨 Holi" },
  { value: "dussehra", label: "🙏 Dussehra" },
  { value: "raksha-bandhan", label: "🪢 Raksha Bandhan" },
  // Other public pages
  { value: "recipes", label: "📖 Recipes" },
  { value: "party-planner", label: "🎉 Party Planner" },
  { value: "how-it-works", label: "❓ How It Works" },
  { value: "use-cases", label: "💡 Use Cases" },
  { value: "pricing", label: "💰 Pricing" },
];

const FEATURED_PAGE_GROUPS = [
  { label: "Main Pages", options: FEATURED_PAGE_OPTIONS.slice(0, 6) },
  { label: "Country Pages", options: FEATURED_PAGE_OPTIONS.slice(6, 11) },
  { label: "Occasions", options: FEATURED_PAGE_OPTIONS.slice(11, 28) },
  { label: "Other Pages", options: FEATURED_PAGE_OPTIONS.slice(28) },
];

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [images, setImages] = useState<CommunityImage[]>([]);
  const [subscribers, setSubscribers] = useState<BlogSubscriber[]>([]);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'created_cakes' | 'never_created' | 'free_with_cakes' | 'premium' | 'dormant'>('all');
  const [activityPanel, setActivityPanel] = useState<{ open: boolean; userId: string | null; email: string | null }>({ open: false, userId: null, email: null });
  const [userCountryStats, setUserCountryStats] = useState<{ country: string; count: number }[]>([]);
  const [removePremiumDialog, setRemovePremiumDialog] = useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });
  const [grantingPremium, setGrantingPremium] = useState<Set<string>>(new Set());
  const [selectedEmailType, setSelectedEmailType] = useState<'halted' | 'expired' | 'cancelled' | 'none'>('expired');
  const [sendingNudgeTest, setSendingNudgeTest] = useState(false);
  const [sendingNudgeAll, setSendingNudgeAll] = useState(false);
  const [nudgeDialog, setNudgeDialog] = useState(false);
  const [nudgeFreeCount, setNudgeFreeCount] = useState(0);
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
  const [profileLoadLimit, setProfileLoadLimit] = useState(100);
  const [totalProfileCount, setTotalProfileCount] = useState(0);
  const [featuredPagesMap, setFeaturedPagesMap] = useState<Record<string, string[]>>({});
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

  const loadProfiles = async (limit?: number) => {
    const effectiveLimit = limit ?? profileLoadLimit;
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, is_premium, is_founding_member, created_at, founding_member_number, country')
      .order('created_at', { ascending: false })
      .limit(effectiveLimit);

    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    setTotalProfileCount(profileCount || 0);

    if (profilesError) {
      console.error('Error loading profiles:', profilesError);
      return;
    }

    // Fetch page visits to determine user countries for those without stored country
    const { data: pageVisitsData, error: pageVisitsError } = await supabase
      .from('page_visits')
      .select('user_id, country_code')
      .not('user_id', 'is', null)
      .limit(500);

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

    // Assign primary country to each profile (use stored country if available)
    const profilesWithCountry = (profilesData || []).map((profile) => {
      // Use stored country if available
      if (profile.country) {
        return { ...profile };
      }
      // Fall back to page visits inference
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

    // Fetch aggregates: cake counts, party counts, last seen — for engagement filters
    const [imagesAgg, partiesAgg, lastSeenAgg] = await Promise.all([
      supabase.from('generated_images').select('user_id'),
      supabase.from('parties').select('user_id'),
      supabase.from('page_visits').select('user_id, visited_at').not('user_id', 'is', null).order('visited_at', { ascending: false }).limit(100),
    ]);

    const cakeCounts: Record<string, number> = {};
    (imagesAgg.data || []).forEach((r: any) => { if (r.user_id) cakeCounts[r.user_id] = (cakeCounts[r.user_id] || 0) + 1; });
    const partyCounts: Record<string, number> = {};
    (partiesAgg.data || []).forEach((r: any) => { if (r.user_id) partyCounts[r.user_id] = (partyCounts[r.user_id] || 0) + 1; });
    const lastSeenMap: Record<string, string> = {};
    (lastSeenAgg.data || []).forEach((r: any) => { if (r.user_id && !lastSeenMap[r.user_id]) lastSeenMap[r.user_id] = r.visited_at; });

    const enriched = profilesWithCountry.map((p) => ({
      ...p,
      cake_count: cakeCounts[p.id] || 0,
      party_count: partyCounts[p.id] || 0,
      last_seen: lastSeenMap[p.id] || null,
    }));

    setProfiles(enriched);

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

  const updateUserCountry = async (userId: string, newCountry: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ country: newCountry })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update country');
      return;
    }
    
    toast.success('Country updated successfully');
    loadProfiles();
  };

  const loadImages = async () => {
    const { data, error } = await supabase
      .from('generated_images')
      .select('id, image_url, featured, created_at, prompt, profiles(email), featured_page, featured_pages, occasion_type')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading images:', error);
      return;
    }

    setImages(data || []);
  };

  const extractCharacterFromPrompt = (prompt: string): string => {
    // Primary pattern: "with character-name" at end of prompt
    // Format: "Name - occasion cake for relation (gender) with character-name"
    const withPattern = /\bwith\s+([\w-]+)\s*$/i;
    const withMatch = prompt.match(withPattern);
    if (withMatch) {
      // Convert "gojo-satoru" to "Gojo Satoru"
      return withMatch[1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // No character specified in prompt
    return "No Character";
  };

  const loadAnalytics = async () => {
    try {
      const { data: profilesData } = await supabase.from('profiles').select('*').limit(500).order('created_at', { ascending: false });
      const { data: imagesData } = await supabase.from('generated_images').select('*').limit(500).order('created_at', { ascending: false });
      const { data: subscribersData } = await supabase.from('blog_subscribers').select('*').limit(500).order('subscribed_at', { ascending: false });

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

  const getAutoPage = (occasionType: string | null): string => {
    if (!occasionType) return 'home';
    const o = occasionType.toLowerCase();
    if (o.includes('wedding')) return 'wedding';
    if (o.includes('eid')) return 'eid';
    if (o.includes('graduation')) return 'graduation';
    if (o.includes('diwali')) return 'diwali';
    if (o.includes('halloween')) return 'halloween';
    if (o.includes('baby') || o.includes('shower')) return 'baby-shower';
    if (o.includes('anniversary')) return 'anniversary';
    if (o.includes('christmas')) return 'christmas';
    if (o.includes('birthday')) return 'birthday';
    if (o.includes('valentine')) return 'valentines';
    if (o.includes('mother')) return 'mothers-day';
    if (o.includes('father')) return 'fathers-day';
    if (o.includes('thanksgiving')) return 'thanksgiving';
    if (o.includes('easter')) return 'easter';
    if (o.includes('holi')) return 'holi';
    if (o.includes('dussehra')) return 'dussehra';
    if (o.includes('raksha')) return 'raksha-bandhan';
    return 'home';
  };

  const featureImageOnPages = async (imageId: string, pages: string[]) => {
    if (pages.length === 0) {
      toast.error('Select at least one page');
      return;
    }
    const { error } = await supabase
      .from('generated_images')
      .update({ featured: true, featured_page: pages[0], featured_pages: pages })
      .eq('id', imageId);

    if (error) {
      toast.error('Failed to feature image');
      return;
    }

    toast.success(`Featured on ${pages.length} page${pages.length > 1 ? 's' : ''}`);
    loadImages();
    loadAnalytics();
  };

  const toggleFeatured = async (imageId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('generated_images')
      .update({ featured: !currentStatus, featured_page: currentStatus ? null : undefined, featured_pages: currentStatus ? [] : undefined })
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

    // Step 1: If the user has an active recurring subscription, cancel it on Razorpay first.
    // This stops future auto-charges. We cancel at cycle end so they keep access until paid period closes.
    try {
      const { data: profileForSub } = await supabase
        .from('profiles')
        .select('subscription_id, subscription_status')
        .eq('id', userId)
        .maybeSingle();

      const status = (profileForSub?.subscription_status || '').toLowerCase();
      const hasActiveSub = profileForSub?.subscription_id &&
        !['cancelled', 'expired', 'halted'].includes(status);

      if (hasActiveSub) {
        const { data: cancelData, error: cancelError } = await supabase.functions.invoke(
          'cancel-razorpay-subscription',
          { body: { userId, cancelAtCycleEnd: true } },
        );

        if (cancelError || (cancelData && cancelData.error)) {
          const msg = cancelError?.message || cancelData?.error || 'Razorpay cancel failed';
          console.error('Failed to cancel Razorpay subscription:', msg);
          toast.error(`Could not stop billing: ${msg}. Premium NOT removed — please retry.`);
          return; // Abort: do not flip is_premium if we can't stop charges
        }
        toast.success('Razorpay subscription cancelled — no further charges');
      }
    } catch (e: any) {
      console.error('Subscription cancel error:', e);
      toast.error(`Could not stop billing: ${e?.message || 'unknown error'}. Premium NOT removed.`);
      return;
    }

    // Step 2: Send subscription ended email if not 'none'
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

    // Step 3: Update profile to remove premium
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

  const sendTestNudgeEmail = async () => {
    setSendingNudgeTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-weekly-upgrade-nudge', {
        body: { testEmail: 'himanshu1305@gmail.com' },
      });
      if (error) throw error;
      toast.success(`Test nudge email (variant ${data.variant}) sent to himanshu1305@gmail.com`);
    } catch (err: any) {
      console.error('Failed to send test nudge:', err);
      toast.error('Failed to send test nudge email');
    } finally {
      setSendingNudgeTest(false);
    }
  };

  const openNudgeDialog = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .or('is_premium.is.null,is_premium.eq.false');
    setNudgeFreeCount(count || 0);
    setNudgeDialog(true);
  };

  const sendNudgeEmails = async () => {
    setSendingNudgeAll(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-weekly-upgrade-nudge', {
        body: {},
      });
      if (error) throw error;
      toast.success(`Nudge emails: ${data.sent} sent, ${data.failed} failed, ${data.skipped} skipped (variant ${data.variant})`);
    } catch (err: any) {
      console.error('Failed to send nudge emails:', err);
      toast.error('Failed to send nudge emails');
    } finally {
      setSendingNudgeAll(false);
      setNudgeDialog(false);
    }
  };

  const getEngagementTag = (p: Profile): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string } | null => {
    const cakes = p.cake_count || 0;
    const isPaid = p.is_premium || p.is_founding_member;
    const lastSeenMs = p.last_seen ? Date.now() - new Date(p.last_seen).getTime() : null;
    const dormant = lastSeenMs !== null && lastSeenMs > 30 * 24 * 60 * 60 * 1000;
    if (!isPaid && cakes >= 3) return { label: '🔥 Hot lead', variant: 'default', className: 'bg-orange-500 hover:bg-orange-500' };
    if (isPaid && lastSeenMs !== null && lastSeenMs < 14 * 24 * 60 * 60 * 1000) return { label: 'Active premium', variant: 'default' };
    if (cakes === 0 && p.last_seen) return { label: 'Window shopper', variant: 'outline' };
    if (dormant) return { label: 'Dormant', variant: 'secondary' };
    return null;
  };

  const filteredProfiles = profiles
    .filter((p) => countryFilter === 'all' || p.country === countryFilter)
    .filter((p) => {
      const cakes = p.cake_count || 0;
      const isPaid = p.is_premium || p.is_founding_member;
      const lastSeenMs = p.last_seen ? Date.now() - new Date(p.last_seen).getTime() : null;
      switch (activityFilter) {
        case 'created_cakes': return cakes > 0;
        case 'never_created': return cakes === 0;
        case 'free_with_cakes': return !isPaid && cakes > 0;
        case 'premium': return isPaid;
        case 'dormant': return lastSeenMs !== null && lastSeenMs > 30 * 24 * 60 * 60 * 1000;
        default: return true;
      }
    });

  const exportEmailsCSV = () => {
    const rows = [['email', 'country', 'cakes', 'parties', 'status', 'last_seen', 'joined']];
    filteredProfiles.forEach((p) => {
      const status = p.is_premium ? 'Premium' : p.is_founding_member ? 'Founding' : 'Free';
      rows.push([
        p.email,
        p.country || '',
        String(p.cake_count || 0),
        String(p.party_count || 0),
        status,
        p.last_seen ? new Date(p.last_seen).toISOString() : '',
        new Date(p.created_at).toISOString(),
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${activityFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredProfiles.length} users`);
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
      {/* Weekly Nudge Dialog */}
      <AlertDialog open={nudgeDialog} onOpenChange={setNudgeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Weekly Upgrade Nudge</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a weekly nudge email to <strong>{nudgeFreeCount}</strong> free users (excluding opted-out and already-sent this week). Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendingNudgeAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={sendNudgeEmails} disabled={sendingNudgeAll}>
              {sendingNudgeAll ? 'Sending...' : `Send to Free Users`}
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
            <h2 className="text-4xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h2>
            <p className="text-muted-foreground mt-2">Manage users, analytics, and community content</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin/blog-analytics')} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Blog Analytics
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
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
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { code: 'IN', label: '🇮🇳 India', flag: '🇮🇳' },
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
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage accounts, see activity & export for outreach</CardDescription>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {['all', 'IN', 'US', 'UK', 'CA', 'AU', 'Unknown'].map((filter) => (
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
                  <div className="flex items-center gap-2 flex-wrap pt-3">
                    <Select value={activityFilter} onValueChange={(v) => setActivityFilter(v as any)}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All users</SelectItem>
                        <SelectItem value="created_cakes">Created at least 1 cake</SelectItem>
                        <SelectItem value="never_created">Never created a cake</SelectItem>
                        <SelectItem value="free_with_cakes">🔥 Free + created cakes (best upsell)</SelectItem>
                        <SelectItem value="premium">Premium / Founding</SelectItem>
                        <SelectItem value="dormant">Dormant (30+ days)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="secondary">{filteredProfiles.length} matches</Badge>
                    <Button size="sm" variant="outline" onClick={exportEmailsCSV}>
                      <Download className="w-3 h-3 mr-1" /> Export CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const emails = filteredProfiles.map((p) => p.email).join(', ');
                        navigator.clipboard.writeText(emails);
                        toast.success(`Copied ${filteredProfiles.length} emails`);
                      }}
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copy emails
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Cakes</TableHead>
                        <TableHead>Last seen</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((profile) => {
                        const tag = getEngagementTag(profile);
                        return (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium max-w-[220px] truncate" title={profile.email}>{profile.email}</TableCell>
                            <TableCell>
                              <CountryPicker
                                value={profile.country || 'Unknown'}
                                onValueChange={(value) => updateUserCountry(profile.id, value)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {profile.is_premium && <Badge variant="default">Premium</Badge>}
                                {profile.is_founding_member && <Badge className="bg-amber-600">Founding</Badge>}
                                {!profile.is_premium && !profile.is_founding_member && <Badge variant="secondary">Free</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-semibold">{profile.cake_count || 0}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {profile.last_seen ? new Date(profile.last_seen).toLocaleDateString() : '—'}
                            </TableCell>
                            <TableCell>
                              {tag ? <Badge variant={tag.variant} className={tag.className}>{tag.label}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setActivityPanel({ open: true, userId: profile.id, email: profile.email })}
                                >
                                  <Eye className="w-3 h-3 mr-1" /> View
                                </Button>
                                <Button
                                  size="sm"
                                  variant={profile.is_premium ? "destructive" : "default"}
                                  onClick={() => togglePremium(profile.id, profile.is_premium)}
                                  disabled={grantingPremium.has(profile.id)}
                                >
                                  {grantingPremium.has(profile.id)
                                    ? '...'
                                    : (profile.is_premium ? 'Remove' : 'Grant')}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {totalProfileCount > profiles.length && (
              <div className="flex items-center justify-center gap-3 py-2">
                <span className="text-sm text-muted-foreground">
                  Showing {profiles.length} of {totalProfileCount} users
                </span>
                <Button variant="outline" size="sm" onClick={async () => {
                  const newLimit = profileLoadLimit + 100;
                  setProfileLoadLimit(newLimit);
                  await loadProfiles(newLimit);
                }}>
                  Load more
                </Button>
              </div>
            )}

            <GlobalReachAdmin liveCountryStats={userCountryStats} />
          </TabsContent>

          <UserActivityPanel
            open={activityPanel.open}
            onOpenChange={(open) => setActivityPanel((s) => ({ ...s, open }))}
            userId={activityPanel.userId}
            email={activityPanel.email}
          />

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
                        <div className="flex gap-2 flex-col">
                          {image.featured ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {(image.featured_pages?.length ? image.featured_pages : [image.featured_page].filter(Boolean)).map((page) => (
                                  <Badge key={page} className="bg-green-600 text-white text-xs">
                                    <Star className="w-2.5 h-2.5 mr-1" />{page}
                                  </Badge>
                                ))}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleFeatured(image.id, true)}
                                className="w-full"
                              >
                                Unfeature
                              </Button>
                            </div>
                          ) : (() => {
                            const autoPage = getAutoPage(image.occasion_type);
                            const selected = featuredPagesMap[image.id] ?? [autoPage];
                            const toggle = (val: string) =>
                              setFeaturedPagesMap(prev => ({
                                ...prev,
                                [image.id]: selected.includes(val)
                                  ? selected.filter(v => v !== val)
                                  : [...selected, val],
                              }));
                            return (
                              <div className="space-y-1.5">
                                <div className="flex gap-1">
                                  <button
                                    className="text-xs text-party-pink underline"
                                    onClick={() => setFeaturedPagesMap(prev => ({ ...prev, [image.id]: FEATURED_PAGE_OPTIONS.map(o => o.value) }))}
                                  >Select All</button>
                                  <span className="text-xs text-muted-foreground">·</span>
                                  <button
                                    className="text-xs text-muted-foreground underline"
                                    onClick={() => setFeaturedPagesMap(prev => ({ ...prev, [image.id]: [] }))}
                                  >Clear</button>
                                  <span className="ml-auto text-xs text-muted-foreground">{selected.length} selected</span>
                                </div>
                                <div className="overflow-y-auto border rounded p-1.5 space-y-2" style={{ maxHeight: 200 }}>
                                  {FEATURED_PAGE_GROUPS.map(group => (
                                    <div key={group.label}>
                                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">{group.label}</p>
                                      <div className="grid grid-cols-1 gap-0.5">
                                        {group.options.map(opt => (
                                          <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer hover:bg-muted rounded px-1 py-0.5">
                                            <input
                                              type="checkbox"
                                              className="accent-party-pink"
                                              checked={selected.includes(opt.value)}
                                              onChange={() => toggle(opt.value)}
                                            />
                                            <span className="text-xs">{opt.label}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => featureImageOnPages(image.id, selected)}
                                >
                                  <Star className="w-3 h-3 mr-1" />
                                  Feature on {selected.length || 0} page{selected.length !== 1 ? 's' : ''}
                                </Button>
                              </div>
                            );
                          })()}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteImage(image.id)}
                            className="w-full"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
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
            {/* Weekly Upgrade Nudge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Upgrade Nudge
                </CardTitle>
                <CardDescription>Rotating weekly emails to free users (4 template variants based on week number)</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button onClick={sendTestNudgeEmail} variant="outline" className="gap-2" disabled={sendingNudgeTest}>
                  <Mail className="w-4 h-4" />
                  {sendingNudgeTest ? 'Sending...' : 'Send Test Nudge'}
                </Button>
                <Button onClick={openNudgeDialog} variant="default" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Send Nudge to Free Users
                </Button>
              </CardContent>
            </Card>

            <HolidaySalesManager />

            {/* Scheduled Tasks Widget */}
            <ScheduledTasksWidget />

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