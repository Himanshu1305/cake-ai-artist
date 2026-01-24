import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, MailX, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

type Status = 'loading' | 'ready' | 'processing' | 'success' | 'error';

interface SubscriberData {
  id: string;
  email: string;
  is_active: boolean;
  digest_frequency: string | null;
}

export default function BlogUnsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<Status>('loading');
  const [unsubscribeType, setUnsubscribeType] = useState<'digest' | 'all' | null>(null);
  const [subscriber, setSubscriber] = useState<SubscriberData | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    
    // Verify subscriber exists by token (secure lookup)
    const checkSubscriber = async () => {
      const { data, error } = await supabase
        .from('blog_subscribers')
        .select('id, email, is_active, digest_frequency')
        .eq('unsubscribe_token', token)
        .maybeSingle();

      if (error || !data) {
        setSubscriber(null);
      } else {
        setSubscriber(data);
      }
      setStatus('ready');
    };

    checkSubscriber();
  }, [token]);

  const handleUnsubscribe = async (type: 'digest' | 'all') => {
    if (!subscriber) return;

    setStatus('processing');
    setUnsubscribeType(type);

    try {
      const updateData = type === 'all' 
        ? { 
            is_active: false, 
            unsubscribed_at: new Date().toISOString() 
          }
        : { 
            digest_frequency: 'none' as const
          };

      const { error } = await supabase
        .from('blog_subscribers')
        .update(updateData)
        .eq('id', subscriber.id);

      if (error) throw error;

      setStatus('success');
      toast.success(type === 'all' 
        ? 'You have been unsubscribed from all emails'
        : 'You have been unsubscribed from the weekly digest'
      );
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
      toast.error('Failed to process your request');
    }
  };

  // Mask email for privacy (show first 2 chars and domain)
  const getMaskedEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local.substring(0, 2)}***@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Helmet>
        <title>Unsubscribe | Cake AI Artist Blog</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'success' ? (
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          ) : status === 'error' ? (
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          ) : (
            <MailX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          )}
          
          <CardTitle className="text-2xl">
            {status === 'success' 
              ? 'Unsubscribed' 
              : status === 'error'
                ? 'Something went wrong'
                : 'Manage Subscription'}
          </CardTitle>
          
          <CardDescription>
            {status === 'success' && unsubscribeType === 'all' && (
              "You've been removed from our mailing list. We're sorry to see you go!"
            )}
            {status === 'success' && unsubscribeType === 'digest' && (
              "You won't receive the weekly digest anymore, but you may still get important updates."
            )}
            {status === 'error' && !token && (
              "Invalid unsubscribe link. Please use the link from your email."
            )}
            {status === 'error' && token && !subscriber && (
              "This unsubscribe link is invalid or has expired."
            )}
            {status === 'error' && token && subscriber && (
              "There was a problem processing your request. Please try again."
            )}
            {status === 'ready' && subscriber && (
              "Choose your email preference below."
            )}
            {status === 'ready' && !subscriber && (
              "This unsubscribe link is invalid or has expired."
            )}
            {status === 'loading' && "Loading..."}
            {status === 'processing' && "Processing your request..."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'ready' && subscriber && (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="break-all">{getMaskedEmail(subscriber.email)}</span>
                </div>
              </div>

              <Button 
                onClick={() => handleUnsubscribe('digest')}
                variant="outline" 
                className="w-full"
              >
                Stop Weekly Digest Only
              </Button>
              
              <Button 
                onClick={() => handleUnsubscribe('all')}
                variant="destructive" 
                className="w-full"
              >
                Unsubscribe from All Emails
              </Button>

              <p className="text-xs text-muted-foreground text-center pt-2">
                "Stop Weekly Digest" will only stop the Sunday newsletter. 
                "Unsubscribe from All" will stop all communications.
              </p>
            </>
          )}

          {(status === 'success' || status === 'error') && (
            <Link to="/blog" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          )}

          {status === 'ready' && !subscriber && (
            <Link to="/blog" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Visit Our Blog
              </Button>
            </Link>
          )}

          {(status === 'loading' || status === 'processing') && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
