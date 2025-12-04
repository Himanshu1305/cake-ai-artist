import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify cron secret for scheduled function calls
    const cronSecret = req.headers.get('X-Cron-Secret');
    const expectedSecret = Deno.env.get('CRON_SECRET');
    
    if (expectedSecret && cronSecret !== expectedSecret) {
      console.error('Invalid cron secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Get date 7 days from now
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 7);
    const reminderDateStr = reminderDate.toISOString().split('T')[0];

    console.log(`Checking for occasions on ${reminderDateStr}`);

    // Get all images with occasions matching the reminder date
    const { data: images, error: imagesError } = await supabaseClient
      .from('generated_images')
      .select(`
        id,
        user_id,
        recipient_name,
        occasion_type,
        occasion_date,
        profiles!inner(email)
      `)
      .eq('occasion_date', reminderDateStr)
      .not('recipient_name', 'is', null);

    if (imagesError) {
      console.error('Error fetching images:', imagesError);
      throw imagesError;
    }

    if (!images || images.length === 0) {
      console.log('No upcoming occasions found');
      return new Response(
        JSON.stringify({ message: 'No reminders to send', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${images.length} occasions`);

    let sentCount = 0;
    const errors: string[] = [];

    for (const image of images) {
      try {
        // Check user settings
        const { data: settings } = await supabaseClient
          .from('user_settings')
          .select('anniversary_reminders')
          .eq('user_id', image.user_id)
          .single();

        if (!settings?.anniversary_reminders) {
          console.log(`User ${image.user_id} has reminders disabled`);
          continue;
        }

        // Check if reminder already sent
        const { data: existingLog } = await supabaseClient
          .from('reminder_logs')
          .select('id')
          .eq('user_id', image.user_id)
          .eq('image_id', image.id)
          .eq('reminder_date', reminderDateStr)
          .maybeSingle();

        if (existingLog) {
          console.log(`Reminder already sent for image ${image.id}`);
          continue;
        }

        const email = image.profiles?.email;
        if (!email) {
          console.log(`No email found for user ${image.user_id}`);
          continue;
        }

        // Send email
        const occasionType = image.occasion_type || 'special occasion';
        const recipientName = image.recipient_name || 'someone special';

        const { error: emailError } = await resend.emails.send({
          from: 'Cake AI Artist <reminders@cakeaiartist.com>',
          to: [email],
          subject: `Reminder: ${recipientName}'s ${occasionType} is coming up!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">🎂 Upcoming Occasion Reminder</h1>
              <p style="font-size: 16px; line-height: 1.5;">
                Hi there! This is a friendly reminder that <strong>${recipientName}'s ${occasionType}</strong> 
                is coming up in one week on <strong>${new Date(image.occasion_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong>.
              </p>
              <p style="font-size: 16px; line-height: 1.5;">
                Don't forget to prepare something special! 
                <a href="https://your-app-url.com/cake-creator" style="color: #0066cc; text-decoration: none;">
                  Create a personalized cake design
                </a> to make the day memorable.
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                You can manage your reminder preferences in your account settings.
              </p>
            </div>
          `,
        });

        if (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
          errors.push(`${email}: ${emailError.message}`);
          continue;
        }

        // Log the sent reminder
        const { error: logError } = await supabaseClient
          .from('reminder_logs')
          .insert({
            user_id: image.user_id,
            image_id: image.id,
            reminder_date: reminderDateStr,
          });

        if (logError) {
          console.error('Error logging reminder:', logError);
        } else {
          sentCount++;
          console.log(`Reminder sent to ${email} for ${recipientName}'s ${occasionType}`);
        }
      } catch (err) {
        console.error(`Error processing image ${image.id}:`, err);
        errors.push(`Image ${image.id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Reminders processed', 
        sent: sentCount, 
        total: images.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-anniversary-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});