import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ImageStats {
  like_count: number;
  comment_count: number;
}

interface Comment {
  id: string;
  user_id: string;
  image_id: string;
  content: string;
  created_at: string;
  user_email?: string;
}

interface UseGalleryInteractionsReturn {
  stats: Record<string, ImageStats>;
  userLikes: Set<string>;
  comments: Record<string, Comment[]>;
  isLiking: boolean;
  isCommenting: boolean;
  toggleLike: (imageId: string) => Promise<void>;
  addComment: (imageId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string, imageId: string) => Promise<void>;
  loadComments: (imageId: string) => Promise<void>;
  isAuthenticated: boolean;
  currentUserId: string | null;
}

export const useGalleryInteractions = (imageIds: string[]): UseGalleryInteractionsReturn => {
  const [stats, setStats] = useState<Record<string, ImageStats>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setCurrentUserId(session?.user?.id || null);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
      setCurrentUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Load stats for all images
  useEffect(() => {
    if (imageIds.length === 0) return;
    
    const loadStats = async () => {
      const { data, error } = await supabase
        .from("gallery_image_stats")
        .select("image_id, like_count, comment_count")
        .in("image_id", imageIds);
      
      if (error) {
        console.error("Error loading stats:", error);
        return;
      }
      
      const statsMap: Record<string, ImageStats> = {};
      imageIds.forEach(id => {
        statsMap[id] = { like_count: 0, comment_count: 0 };
      });
      
      data?.forEach(stat => {
        statsMap[stat.image_id] = {
          like_count: stat.like_count,
          comment_count: stat.comment_count
        };
      });
      
      setStats(statsMap);
    };
    
    loadStats();
  }, [imageIds]);

  // Load user's likes
  useEffect(() => {
    if (!currentUserId || imageIds.length === 0) return;
    
    const loadUserLikes = async () => {
      const { data, error } = await supabase
        .from("gallery_likes")
        .select("image_id")
        .eq("user_id", currentUserId)
        .in("image_id", imageIds);
      
      if (error) {
        console.error("Error loading user likes:", error);
        return;
      }
      
      setUserLikes(new Set(data?.map(like => like.image_id) || []));
    };
    
    loadUserLikes();
  }, [currentUserId, imageIds]);

  const toggleLike = useCallback(async (imageId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like images",
        variant: "destructive",
      });
      return;
    }
    
    if (isLiking) return;
    setIsLiking(true);
    
    const isCurrentlyLiked = userLikes.has(imageId);
    
    // Optimistic update
    setUserLikes(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
    
    setStats(prev => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        like_count: (prev[imageId]?.like_count || 0) + (isCurrentlyLiked ? -1 : 1)
      }
    }));
    
    try {
      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from("gallery_likes")
          .delete()
          .eq("user_id", currentUserId!)
          .eq("image_id", imageId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("gallery_likes")
          .insert({ user_id: currentUserId!, image_id: imageId });
        
        if (error) throw error;
      }
    } catch (error) {
      // Revert on error
      setUserLikes(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(imageId);
        } else {
          newSet.delete(imageId);
        }
        return newSet;
      });
      
      setStats(prev => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          like_count: (prev[imageId]?.like_count || 0) + (isCurrentlyLiked ? 1 : -1)
        }
      }));
      
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  }, [isAuthenticated, isLiking, userLikes, currentUserId]);

  const loadComments = useCallback(async (imageId: string) => {
    const { data, error } = await supabase
      .from("gallery_comments")
      .select("*")
      .eq("image_id", imageId)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error loading comments:", error);
      return;
    }
    
    setComments(prev => ({ ...prev, [imageId]: data || [] }));
  }, []);

  const addComment = useCallback(async (imageId: string, content: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) return;
    if (isCommenting) return;
    
    setIsCommenting(true);
    
    try {
      const { data, error } = await supabase
        .from("gallery_comments")
        .insert({ 
          user_id: currentUserId!, 
          image_id: imageId, 
          content: content.trim() 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to local state
      setComments(prev => ({
        ...prev,
        [imageId]: [...(prev[imageId] || []), data]
      }));
      
      // Update comment count
      setStats(prev => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          comment_count: (prev[imageId]?.comment_count || 0) + 1
        }
      }));
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsCommenting(false);
    }
  }, [isAuthenticated, isCommenting, currentUserId]);

  const deleteComment = useCallback(async (commentId: string, imageId: string) => {
    try {
      const { error } = await supabase
        .from("gallery_comments")
        .delete()
        .eq("id", commentId);
      
      if (error) throw error;
      
      // Remove from local state
      setComments(prev => ({
        ...prev,
        [imageId]: (prev[imageId] || []).filter(c => c.id !== commentId)
      }));
      
      // Update comment count
      setStats(prev => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          comment_count: Math.max(0, (prev[imageId]?.comment_count || 0) - 1)
        }
      }));
      
      toast({
        title: "Comment deleted",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  }, []);

  return {
    stats,
    userLikes,
    comments,
    isLiking,
    isCommenting,
    toggleLike,
    addComment,
    deleteComment,
    loadComments,
    isAuthenticated,
    currentUserId,
  };
};
