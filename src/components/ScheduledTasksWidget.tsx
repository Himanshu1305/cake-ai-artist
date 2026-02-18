import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, RefreshCw, Play, CheckCircle2, XCircle, Loader2, AlertCircle, Send } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TaskRun {
  id: string;
  task_name: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  result_message: string | null;
  error_message: string | null;
  records_processed: number;
}

interface ScheduledTask {
  name: string;
  displayName: string;
  icon: string;
  description: string;
  schedule: string;
  scheduleHuman: string;
  functionName: string;
  lastRun: TaskRun | null;
}

// Predefined scheduled tasks (since we can't query cron.job from frontend)
const SCHEDULED_TASKS: Omit<ScheduledTask, 'lastRun'>[] = [
  {
    name: 'weekly-blog-generation',
    displayName: 'Weekly Blog Generation',
    icon: '📝',
    description: 'Generates 2 AI blog posts (1 country-specific + 1 universal)',
    schedule: '0 0 * * 6', // Saturday midnight UTC
    scheduleHuman: 'Every Saturday at 00:00 UTC',
    functionName: 'generate-blog-post',
  },
  {
    name: 'weekly-blog-digest',
    displayName: 'Weekly Blog Digest',
    icon: '📧',
    description: 'Sends email digest to all blog subscribers',
    schedule: '30 2 * * 0', // Sunday 02:30 UTC
    scheduleHuman: 'Every Sunday at 02:30 UTC',
    functionName: 'send-weekly-blog-digest',
  },
  {
    name: 'anniversary-reminders',
    displayName: 'Anniversary Reminders',
    icon: '🎂',
    description: 'Sends reminder emails for occasions coming up in 7 days',
    schedule: '0 9 * * *', // Daily at 9 AM UTC
    scheduleHuman: 'Every day at 09:00 UTC',
    functionName: 'send-anniversary-reminders',
  },
];

// Calculate next run time from cron schedule
function getNextRunTime(schedule: string): Date {
  const parts = schedule.split(' ');
  if (parts.length !== 5) return new Date();

  const [minute, hour, , , dayOfWeek] = parts;
  const now = new Date();
  const targetHour = parseInt(hour);
  const targetMinute = parseInt(minute);

  let next = new Date(now);
  next.setUTCHours(targetHour, targetMinute, 0, 0);

  if (dayOfWeek === '*') {
    // Daily schedule
    if (now >= next) {
      next = addDays(next, 1);
    }
  } else {
    const targetDay = parseInt(dayOfWeek);
    const currentDay = now.getUTCDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0 || (daysUntil === 0 && now >= next)) {
      daysUntil += 7;
    }
    next = addDays(next, daysUntil);
  }

  return next;
}

export function ScheduledTasksWidget() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTask, setRunningTask] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTaskRuns = useCallback(async () => {
    try {
      const taskNames = SCHEDULED_TASKS.map(t => t.name);
      
      const { data, error } = await supabase
        .from('scheduled_task_runs')
        .select('*')
        .in('task_name', taskNames)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error loading task runs:', error);
        return;
      }

      const tasksWithRuns: ScheduledTask[] = SCHEDULED_TASKS.map(task => {
        const lastRun = (data as TaskRun[])?.find(run => run.task_name === task.name) || null;
        return { ...task, lastRun };
      });

      setTasks(tasksWithRuns);
    } catch (error) {
      console.error('Error loading task runs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTaskRuns();
    const interval = setInterval(loadTaskRuns, 30000);
    return () => clearInterval(interval);
  }, [loadTaskRuns]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTaskRuns();
    setRefreshing(false);
    toast.success('Task status refreshed');
  };

  const handleRunNow = async (task: ScheduledTask) => {
    setRunningTask(task.name);
    try {
      let body = {};
      if (task.functionName === 'generate-blog-post') {
        body = { generate_weekly_batch: true };
      }

      const { data, error } = await supabase.functions.invoke(task.functionName, { body });
      if (error) throw error;

      toast.success(`${task.displayName} completed successfully`, {
        description: data?.message || `Processed ${data?.records_processed || 0} records`,
      });

      await loadTaskRuns();
    } catch (error: any) {
      console.error('Error running task:', error);
      toast.error(`Failed to run ${task.displayName}`, {
        description: error.message || 'Unknown error occurred',
      });
    } finally {
      setRunningTask(null);
    }
  };

  const handleSendTestReminder = async () => {
    setRunningTask('anniversary-reminders-test');
    try {
      const { data, error } = await supabase.functions.invoke('send-anniversary-reminders', {
        body: {},
      });
      if (error) throw error;
      toast.success('Test reminder check completed', {
        description: data?.sent > 0
          ? `${data.sent} reminder(s) sent for upcoming occasions`
          : data?.message || 'No upcoming occasions found in the next 7 days',
      });
    } catch (error: any) {
      toast.error('Test reminder failed', { description: error.message });
    } finally {
      setRunningTask(null);
    }
  };

  const getStatusBadge = (run: TaskRun | null) => {
    if (!run) {
      return (
        <Badge variant="outline" className="gap-1">
          <AlertCircle className="w-3 h-3" />
          Never run
        </Badge>
      );
    }

    switch (run.status) {
      case 'success':
        return (
          <Badge className="bg-green-600 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      case 'running':
        return (
          <Badge className="bg-yellow-600 gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Running
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            {run.status}
          </Badge>
        );
    }
  };

  const formatLastRun = (run: TaskRun | null) => {
    if (!run) return 'Never';
    const date = new Date(run.completed_at || run.started_at);
    const timeAgo = getTimeAgo(date);
    let detail = '';
    if (run.status === 'success' && run.records_processed > 0) {
      detail = ` (${run.records_processed} ${run.records_processed === 1 ? 'record' : 'records'})`;
    } else if (run.result_message) {
      detail = ` - ${run.result_message}`;
    }
    return `${timeAgo}${detail}`;
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return format(date, 'MMM d, yyyy');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Scheduled Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Scheduled Tasks
            </CardTitle>
            <CardDescription>Automated cron jobs and their execution status</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => {
          const nextRun = getNextRunTime(task.schedule);
          const isRunning = runningTask === task.name;
          const isTestRunning = runningTask === 'anniversary-reminders-test';

          return (
            <div
              key={task.name}
              className="border rounded-lg p-4 space-y-3 bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{task.icon}</span>
                  <div>
                    <h4 className="font-semibold">{task.displayName}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {task.name === 'anniversary-reminders' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSendTestReminder}
                      disabled={isTestRunning || !!runningTask}
                    >
                      {isTestRunning ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 mr-1" />
                          Test Email
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRunNow(task)}
                    disabled={isRunning || !!runningTask}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Run Now
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Schedule:</span>
                  <p className="font-medium">{task.scheduleHuman}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Next Run:</span>
                  <p className="font-medium">{format(nextRun, "EEE, MMM d 'at' HH:mm")} UTC</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Run:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(task.lastRun)}
                    <span className="text-xs text-muted-foreground">
                      {formatLastRun(task.lastRun)}
                    </span>
                  </div>
                </div>
              </div>

              {task.lastRun?.status === 'failed' && task.lastRun?.error_message && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-2 text-sm">
                  <span className="font-medium text-destructive">Error: </span>
                  <span className="text-destructive/80">{task.lastRun.error_message}</span>
                </div>
              )}
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No scheduled tasks configured
          </div>
        )}
      </CardContent>
    </Card>
  );
}
