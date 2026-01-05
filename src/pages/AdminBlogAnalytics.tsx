import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Eye, Users, TrendingUp, FileText, ArrowLeft, Send, Calendar, BarChart3, Sparkles, Check, X, RefreshCw, Globe, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BlogViewData {
  post_id: string;
  viewed_at: string;
  session_id: string | null;
  referrer: string | null;
}

interface SubscriberData {
  id: string;
  email: string;
  first_name: string | null;
  subscribed_at: string;
  is_active: boolean;
  digest_frequency: string | null;
}

interface PostStats {
  postId: string;
  title: string;
  views30d: number;
  views7d: number;
  uniqueSessions: number;
}

interface PendingPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  target_country: string | null;
  is_ai_generated: boolean;
  created_at: string;
}

interface ReferrerStats {
  type: string;
  count: number;
  percentage: number;
}

interface PostReferrerStats {
  postId: string;
  title: string;
  direct: number;
  search: number;
  social: number;
  internal: number;
  other: number;
}

// Referrer categorization helper
const categorizeReferrer = (referrer: string | null): string => {
  if (!referrer || referrer === '') return 'Direct';
  const lower = referrer.toLowerCase();
  
  // Social Media
  if (['facebook', 'twitter', 'instagram', 'linkedin', 'pinterest', 'tiktok', 'whatsapp', 't.co', 'fb.com'].some(s => lower.includes(s))) {
    return 'Social';
  }
  
  // Search Engines
  if (['google', 'bing', 'duckduckgo', 'yahoo', 'baidu', 'yandex'].some(s => lower.includes(s))) {
    return 'Search';
  }
  
  // Internal (same domain)
  if (lower.includes('cakeaiartist.com') || lower.includes('localhost')) {
    return 'Internal';
  }
  
  return 'Other';
};

const REFERRER_COLORS: Record<string, string> = {
  Direct: 'hsl(var(--primary))',
  Search: 'hsl(142, 76%, 36%)', // green
  Social: 'hsl(280, 87%, 56%)', // purple
  Internal: 'hsl(200, 80%, 50%)', // blue
  Other: 'hsl(30, 80%, 55%)', // orange
};

// Blog post titles mapping
const blogPostTitles: Record<string, string> = {
  'creative-cake-ideas-birthday': '10 Creative Cake Ideas for Birthday Celebrations',
  'perfect-birthday-messages': '50 Birthday Message Ideas',
  'cake-design-trends-2025': 'Cake Design Trends: What\'s Popular in 2025',
  'how-to-write-cake-messages': 'How to Write the Perfect Cake Message',
  'ai-cake-design-guide': 'AI Cake Design: Complete Guide',
  'anniversary-cake-ideas': 'Anniversary Cake Ideas for Every Milestone',
  'kids-birthday-cake-themes': 'Kids Birthday Cake Themes They\'ll Love',
  'wedding-cake-trends': 'Wedding Cake Trends 2025',
};

const countryNames: Record<string, string> = {
  IN: '🇮🇳 India',
  UK: '🇬🇧 UK',
  AU: '🇦🇺 Australia',
  CA: '🇨🇦 Canada',
};

export default function AdminBlogAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);
  const [generatingPost, setGeneratingPost] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  
  // Stats
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [activeSubscribers, setActiveSubscribers] = useState(0);
  const [subscriberGrowth, setSubscriberGrowth] = useState(0);
  
  // Chart data
  const [viewsOverTime, setViewsOverTime] = useState<{ date: string; views: number }[]>([]);
  const [subscriberGrowthData, setSubscriberGrowthData] = useState<{ date: string; subscribers: number }[]>([]);
  const [topPosts, setTopPosts] = useState<PostStats[]>([]);
  
  // Referrer data
  const [referrerStats, setReferrerStats] = useState<ReferrerStats[]>([]);
  const [postReferrerStats, setPostReferrerStats] = useState<PostReferrerStats[]>([]);
  const [topReferrers, setTopReferrers] = useState<{ url: string; count: number }[]>([]);
  
  // Pending posts
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);

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
      loadAnalytics();
      loadPendingPosts();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, category, target_country, is_ai_generated, created_at')
        .eq('is_published', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingPosts(data || []);
    } catch (error) {
      console.error('Error loading pending posts:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Load blog views
      const { data: viewsData, error: viewsError } = await supabase
        .from('blog_post_views')
        .select('*')
        .order('viewed_at', { ascending: false });

      if (viewsError) throw viewsError;

      // Load subscribers
      const { data: subscribersData, error: subError } = await supabase
        .from('blog_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (subError) throw subError;

      const views = viewsData || [];
      const subscribers = subscribersData || [];

      // Calculate stats
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);
      const sevenDaysAgo = subDays(now, 7);

      const recentViews = views.filter(v => new Date(v.viewed_at) >= thirtyDaysAgo);
      setTotalViews(recentViews.length);

      const uniqueSessions = new Set(views.filter(v => v.session_id).map(v => v.session_id));
      setUniqueVisitors(uniqueSessions.size);

      setTotalSubscribers(subscribers.length);
      const active = subscribers.filter(s => s.is_active);
      setActiveSubscribers(active.length);

      // Calculate subscriber growth (new this week)
      const newThisWeek = subscribers.filter(s => 
        new Date(s.subscribed_at) >= sevenDaysAgo
      ).length;
      const growthRate = active.length > 0 ? (newThisWeek / active.length) * 100 : 0;
      setSubscriberGrowth(growthRate);

      // Views over time (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(now, 29 - i);
        return format(date, 'MMM dd');
      });

      const viewsByDate = last30Days.map(dateStr => {
        const count = views.filter(v => {
          const viewDate = format(new Date(v.viewed_at), 'MMM dd');
          return viewDate === dateStr;
        }).length;
        return { date: dateStr, views: count };
      });
      setViewsOverTime(viewsByDate);

      // Subscriber growth over time
      const subGrowth = last30Days.map((dateStr, index) => {
        const targetDate = subDays(now, 29 - index);
        const count = subscribers.filter(s => {
          const subDate = new Date(s.subscribed_at);
          return subDate <= targetDate && s.is_active;
        }).length;
        return { date: dateStr, subscribers: count };
      });
      setSubscriberGrowthData(subGrowth);

      // Top performing posts with referrer breakdown
      const postViewCounts: Record<string, { 
        total30d: number; 
        total7d: number; 
        sessions: Set<string>;
        referrers: { direct: number; search: number; social: number; internal: number; other: number };
      }> = {};
      
      // Referrer counts for pie chart
      const referrerCounts: Record<string, number> = { Direct: 0, Search: 0, Social: 0, Internal: 0, Other: 0 };
      
      // Top specific referrers
      const specificReferrers: Record<string, number> = {};
      
      views.forEach(view => {
        const postId = view.post_id;
        const referrerType = categorizeReferrer(view.referrer);
        
        if (!postViewCounts[postId]) {
          postViewCounts[postId] = { 
            total30d: 0, 
            total7d: 0, 
            sessions: new Set(),
            referrers: { direct: 0, search: 0, social: 0, internal: 0, other: 0 }
          };
        }
        
        const viewDate = new Date(view.viewed_at);
        if (viewDate >= thirtyDaysAgo) {
          postViewCounts[postId].total30d++;
          referrerCounts[referrerType]++;
          
          // Track referrer by type for this post
          const key = referrerType.toLowerCase() as keyof typeof postViewCounts[string]['referrers'];
          postViewCounts[postId].referrers[key]++;
          
          // Track specific referrer URLs
          if (view.referrer) {
            try {
              const url = new URL(view.referrer);
              const host = url.hostname;
              specificReferrers[host] = (specificReferrers[host] || 0) + 1;
            } catch {
              specificReferrers[view.referrer] = (specificReferrers[view.referrer] || 0) + 1;
            }
          }
        }
        if (viewDate >= sevenDaysAgo) {
          postViewCounts[postId].total7d++;
        }
        if (view.session_id) {
          postViewCounts[postId].sessions.add(view.session_id);
        }
      });

      // Calculate referrer percentages
      const totalReferrerViews = Object.values(referrerCounts).reduce((a, b) => a + b, 0);
      const referrerData = Object.entries(referrerCounts)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => ({
          type,
          count,
          percentage: totalReferrerViews > 0 ? (count / totalReferrerViews) * 100 : 0,
        }));
      setReferrerStats(referrerData);

      // Top specific referrers
      const topRefs = Object.entries(specificReferrers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([url, count]) => ({ url, count }));
      setTopReferrers(topRefs);

      // Posts with referrer breakdown
      const sortedPosts = Object.entries(postViewCounts)
        .map(([postId, stats]) => ({
          postId,
          title: blogPostTitles[postId] || postId,
          views30d: stats.total30d,
          views7d: stats.total7d,
          uniqueSessions: stats.sessions.size,
        }))
        .sort((a, b) => b.views30d - a.views30d);

      setTopPosts(sortedPosts);

      // Post referrer stats for table
      const postRefStats = Object.entries(postViewCounts)
        .map(([postId, stats]) => ({
          postId,
          title: blogPostTitles[postId] || postId,
          direct: stats.referrers.direct,
          search: stats.referrers.search,
          social: stats.referrers.social,
          internal: stats.referrers.internal,
          other: stats.referrers.other,
        }))
        .filter(p => p.direct + p.search + p.social + p.internal + p.other > 0)
        .sort((a, b) => (b.direct + b.search + b.social) - (a.direct + a.search + a.social));
      setPostReferrerStats(postRefStats);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const sendTestDigest = async () => {
    setSendingDigest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-weekly-blog-digest', {
        body: { test: true }
      });

      if (error) throw error;

      toast.success(`Digest sent! ${data?.success || 0} emails delivered`);
    } catch (error) {
      console.error('Error sending digest:', error);
      toast.error('Failed to send digest');
    } finally {
      setSendingDigest(false);
    }
  };

  const generateNewPost = async (country?: string) => {
    setGeneratingPost(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: country ? { country } : { generate_weekly_batch: false }
      });

      if (error) throw error;

      toast.success(`Article generated: ${data?.title || 'New post created'}`);
      loadPendingPosts();
    } catch (error) {
      console.error('Error generating post:', error);
      toast.error('Failed to generate post');
    } finally {
      setGeneratingPost(false);
    }
  };

  const publishPost = async (postId: string) => {
    setPublishingId(postId);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          is_published: true, 
          published_at: new Date().toISOString() 
        })
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post published!');
      loadPendingPosts();
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Failed to publish post');
    } finally {
      setPublishingId(null);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post deleted');
      loadPendingPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blog Analytics | Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Blog Analytics</h1>
              <p className="text-muted-foreground">Track blog performance and manage AI-generated content</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={sendTestDigest} disabled={sendingDigest} variant="outline">
              <Send className="h-4 w-4 mr-2" />
              {sendingDigest ? 'Sending...' : 'Send Digest'}
            </Button>
            <Button onClick={() => generateNewPost()} disabled={generatingPost}>
              <Sparkles className="h-4 w-4 mr-2" />
              {generatingPost ? 'Generating...' : 'Generate Post'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Posts
              {pendingPosts.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingPosts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views (30d)</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueVisitors.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeSubscribers}</div>
                  <p className="text-xs text-muted-foreground">of {totalSubscribers} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscriberGrowth.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">new this week</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Views Over Time
                  </CardTitle>
                  <CardDescription>Daily blog views (last 30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={viewsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Subscriber Growth
                  </CardTitle>
                  <CardDescription>Total active subscribers over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={subscriberGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="subscribers" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Posts Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Top Performing Posts
                </CardTitle>
                <CardDescription>Ranked by views in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post Title</TableHead>
                      <TableHead className="text-right">Views (30d)</TableHead>
                      <TableHead className="text-right">Views (7d)</TableHead>
                      <TableHead className="text-right">Unique Sessions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPosts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No view data yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      topPosts.map((post, index) => (
                        <TableRow key={post.postId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-mono text-sm">#{index + 1}</span>
                              <a 
                                href={`/blog/${post.postId}`} 
                                className="text-primary hover:underline font-medium"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {post.title}
                              </a>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{post.views30d}</TableCell>
                          <TableCell className="text-right">{post.views7d}</TableCell>
                          <TableCell className="text-right">{post.uniqueSessions}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Referrer Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Sources Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Traffic Sources
                  </CardTitle>
                  <CardDescription>Where your blog visitors come from (30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  {referrerStats.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No referrer data available
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={referrerStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ type, percentage }) => `${type}: ${percentage.toFixed(0)}%`}
                          >
                            {referrerStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={REFERRER_COLORS[entry.type] || 'hsl(var(--muted))'} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [value, 'Views']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {referrerStats.map((stat) => (
                          <div key={stat.type} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: REFERRER_COLORS[stat.type] }}
                              />
                              <span>{stat.type}</span>
                            </div>
                            <span className="font-medium">{stat.count} views ({stat.percentage.toFixed(1)}%)</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Top Referrers List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Top Referrers
                  </CardTitle>
                  <CardDescription>Specific sites driving traffic (30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  {topReferrers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No external referrers tracked yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topReferrers.map((ref, index) => (
                        <div key={ref.url} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-mono text-sm w-5">#{index + 1}</span>
                            <span className="text-sm truncate max-w-[200px]" title={ref.url}>
                              {ref.url}
                            </span>
                          </div>
                          <span className="font-medium text-sm">{ref.count} views</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Article Performance by Source */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Article Performance by Source
                </CardTitle>
                <CardDescription>See which referrers drive views to each article</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead className="text-right">Direct</TableHead>
                      <TableHead className="text-right">Search</TableHead>
                      <TableHead className="text-right">Social</TableHead>
                      <TableHead className="text-right">Internal</TableHead>
                      <TableHead className="text-right">Other</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postReferrerStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No referrer data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      postReferrerStats.slice(0, 10).map((post) => (
                        <TableRow key={post.postId}>
                          <TableCell className="font-medium truncate max-w-[200px]" title={post.title}>
                            {post.title}
                          </TableCell>
                          <TableCell className="text-right">{post.direct}</TableCell>
                          <TableCell className="text-right">{post.search}</TableCell>
                          <TableCell className="text-right">{post.social}</TableCell>
                          <TableCell className="text-right">{post.internal}</TableCell>
                          <TableCell className="text-right">{post.other}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Pending AI-Generated Posts
                </CardTitle>
                <CardDescription>
                  Review and publish AI-generated articles before they go live
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingPosts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending posts awaiting review</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => generateNewPost()}
                      disabled={generatingPost}
                    >
                      Generate a new post
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPosts.map(post => (
                      <div 
                        key={post.id} 
                        className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{post.category}</Badge>
                            {post.target_country && (
                              <Badge variant="secondary">
                                {countryNames[post.target_country] || post.target_country}
                              </Badge>
                            )}
                            {post.is_ai_generated && (
                              <Badge variant="default" className="gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {post.excerpt}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {format(new Date(post.created_at), 'PPp')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              Preview
                            </a>
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => publishPost(post.id)}
                            disabled={publishingId === post.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {publishingId === post.id ? 'Publishing...' : 'Publish'}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deletePost(post.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generate New Articles
                </CardTitle>
                <CardDescription>
                  Manually trigger AI article generation for specific countries or universal content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                    onClick={() => generateNewPost('IN')}
                    disabled={generatingPost}
                  >
                    <span className="text-2xl">🇮🇳</span>
                    <span>India-focused</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                    onClick={() => generateNewPost('UK')}
                    disabled={generatingPost}
                  >
                    <span className="text-2xl">🇬🇧</span>
                    <span>UK-focused</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                    onClick={() => generateNewPost('AU')}
                    disabled={generatingPost}
                  >
                    <span className="text-2xl">🇦🇺</span>
                    <span>Australia-focused</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                    onClick={() => generateNewPost('CA')}
                    disabled={generatingPost}
                  >
                    <span className="text-2xl">🇨🇦</span>
                    <span>Canada-focused</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                    onClick={() => generateNewPost()}
                    disabled={generatingPost}
                  >
                    <Globe className="h-6 w-6" />
                    <span>Universal</span>
                  </Button>
                  <Button 
                    className="h-24 flex-col gap-2 bg-gradient-to-r from-primary to-purple-600"
                    onClick={async () => {
                      setGeneratingPost(true);
                      try {
                        const { data, error } = await supabase.functions.invoke('generate-blog-post', {
                          body: { generate_weekly_batch: true }
                        });
                        if (error) throw error;
                        toast.success(`Weekly batch generated: ${data?.articles?.length || 0} articles`);
                        loadPendingPosts();
                      } catch (error) {
                        toast.error('Failed to generate batch');
                      } finally {
                        setGeneratingPost(false);
                      }
                    }}
                    disabled={generatingPost}
                  >
                    <RefreshCw className={`h-6 w-6 ${generatingPost ? 'animate-spin' : ''}`} />
                    <span>Weekly Batch</span>
                  </Button>
                </div>

                {generatingPost && (
                  <div className="mt-6 text-center text-muted-foreground">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>Generating article... This may take 30-60 seconds.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cron Job Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Automated Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <Sparkles className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Weekly Article Generation</p>
                    <p className="text-sm text-muted-foreground">
                      Every <strong>Saturday at midnight UTC</strong> - Generates 2 articles (1 country-specific, 1 universal)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <Send className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Weekly Blog Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Every <strong>Sunday at 8:00 AM IST</strong> (2:30 AM UTC) - Sends digest email to all active subscribers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
