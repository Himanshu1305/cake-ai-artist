import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, BarChart3, ImageIcon, Shield, Trash2, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface Profile {
  id: string;
  email: string;
  is_premium: boolean;
  is_founding_member: boolean;
  created_at: string;
}

interface CommunityImage {
  id: string;
  image_url: string;
  featured: boolean;
  created_at: string;
  prompt: string;
  profiles: { email: string };
}

interface Analytics {
  totalUsers: number;
  premiumUsers: number;
  foundingMembers: number;
  totalImages: number;
  featuredImages: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [images, setImages] = useState<CommunityImage[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    premiumUsers: 0,
    foundingMembers: 0,
    totalImages: 0,
    featuredImages: 0,
  });

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
    ]);
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, is_premium, is_founding_member, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading profiles:', error);
      return;
    }

    setProfiles(data || []);
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

  const loadAnalytics = async () => {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('is_premium, is_founding_member');

    const { data: imagesData } = await supabase
      .from('generated_images')
      .select('featured');

    if (profilesData && imagesData) {
      setAnalytics({
        totalUsers: profilesData.length,
        premiumUsers: profilesData.filter(p => p.is_premium).length,
        foundingMembers: profilesData.filter(p => p.is_founding_member).length,
        totalImages: imagesData.length,
        featuredImages: imagesData.filter(i => i.featured).length,
      });
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
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: !currentStatus,
        premium_until: !currentStatus ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null
      })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user status');
      return;
    }

    toast.success(currentStatus ? 'Premium removed' : 'Premium granted');
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

  return (
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.premiumUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Founding Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{analytics.foundingMembers}</div>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Featured Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.featuredImages}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="images">Community Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and premium status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.email}</TableCell>
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
                          >
                            {profile.is_premium ? 'Remove Premium' : 'Grant Premium'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
        </Tabs>
      </div>
    </div>
  );
}