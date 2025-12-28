import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  user_id: string;
  image_id: string;
  content: string;
  created_at: string;
}

interface GalleryCommentsProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  isCommenting: boolean;
  isAuthenticated: boolean;
  currentUserId: string | null;
}

export const GalleryComments = ({
  comments,
  onAddComment,
  onDeleteComment,
  isCommenting,
  isAuthenticated,
  currentUserId,
}: GalleryCommentsProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await onAddComment(newComment);
    setNewComment("");
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm text-foreground">
        Comments ({comments.length})
      </h4>
      
      {/* Comments List */}
      <ScrollArea className="h-[200px] pr-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-muted/50 rounded-lg p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {currentUserId === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteComment(comment.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[60px] resize-none text-sm"
            disabled={isCommenting}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isCommenting || !newComment.trim()}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          Sign in to leave a comment
        </p>
      )}
    </div>
  );
};
