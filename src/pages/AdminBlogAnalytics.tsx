import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Eye, Users, TrendingUp, FileText, ArrowLeft, Send, Calendar, BarChart3 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface BlogViewData {
  post_id: string;
  viewed_at: string;
  session_id: string | null;
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

export default function AdminBlogAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);
  
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
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    } finally {
      setLoading(false);
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

      // Top performing posts
      const postViewCounts: Record<string, { total30d: number; total7d: number; sessions: Set<string> }> = {};
      
      views.forEach(view => {
        const postId = view.post_id;
        if (!postViewCounts[postId]) {
          postViewCounts[postId] = { total30d: 0, total7d: 0, sessions: new Set() };
        }
        
        const viewDate = new Date(view.viewed_at);
        if (viewDate >= thirtyDaysAgo) {
          postViewCounts[postId].total30d++;
        }
        if (viewDate >= sevenDaysAgo) {
          postViewCounts[postId].total7d++;
        }
        if (view.session_id) {
          postViewCounts[postId].sessions.add(view.session_id);
        }
      });

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
              <p className="text-muted-foreground">Track blog performance and subscriber growth</p>
            </div>
          </div>
          <Button onClick={sendTestDigest} disabled={sendingDigest}>
            <Send className="h-4 w-4 mr-2" />
            {sendingDigest ? 'Sending...' : 'Send Test Digest'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

        {/* Cron Job Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Digests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Weekly blog digest is automatically sent every <strong>Sunday at 8:00 AM IST</strong> (2:30 AM UTC) 
              to all active subscribers who have not unsubscribed from the digest.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
