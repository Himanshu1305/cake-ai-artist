import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Plus, Trash2, Mail, Copy, Check, Calendar, Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function PartyPlannerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadAll = async () => {
    const { data: p } = await supabase.from("parties").select("*").eq("id", id!).maybeSingle();
    if (!p) {
      navigate("/party-planner");
      return;
    }
    setParty(p);
    const [{ data: t }, { data: g }, { data: m }] = await Promise.all([
      supabase.from("party_tasks").select("*").eq("party_id", id!).order("due_date"),
      supabase.from("party_guests").select("*").eq("party_id", id!).order("created_at"),
      supabase.from("party_chat_messages").select("*").eq("party_id", id!).order("created_at"),
    ]);
    setTasks(t || []);
    setGuests(g || []);
    setMessages(m || []);
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Seed with welcome message if empty
  useEffect(() => {
    if (party && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hi! I'm your Party Concierge 🎉 Let's plan **${party.title}**. To get started — what's the occasion, and roughly when is it happening?`,
      }]);
    }
  }, [party]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Please sign in again");
      const { data, error } = await supabase.functions.invoke("party-planner-chat", {
        body: { partyId: id, userMessage: userMsg.content },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((m) => [...m, { role: "assistant", content: data.message }]);
      if (data.planBuilt) {
        toast.success("Your party plan is ready!");
        await loadAll();
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I hit a snag. Try again?" }]);
    } finally {
      setSending(false);
    }
  };

  const toggleTask = async (taskId: string, current: boolean) => {
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, is_completed: !current } : t)));
    await supabase.from("party_tasks").update({ is_completed: !current }).eq("id", taskId);
  };

  const addGuest = async () => {
    if (!guestName.trim()) return;
    const { data, error } = await supabase
      .from("party_guests")
      .insert({ party_id: id, name: guestName.trim(), email: guestEmail.trim() || null })
      .select()
      .single();
    if (error) {
      toast.error("Could not add guest");
      return;
    }
    setGuests((g) => [...g, data]);
    setGuestName("");
    setGuestEmail("");
  };

  const removeGuest = async (gid: string) => {
    await supabase.from("party_guests").delete().eq("id", gid);
    setGuests((g) => g.filter((x) => x.id !== gid));
  };

  const sendInvites = async () => {
    const pending = guests.filter((g) => g.email && !g.invited_at);
    if (!pending.length) {
      toast.info("No new guests with email to invite");
      return;
    }
    toast.loading("Sending invites...", { id: "inv" });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Please sign in again");
      const { data, error } = await supabase.functions.invoke("send-party-invite", {
        body: { partyId: id, guestIds: pending.map((g) => g.id) },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;
      toast.success(`Sent ${data.sent} invitation${data.sent === 1 ? "" : "s"}`, { id: "inv" });
      await loadAll();
    } catch (e: any) {
      toast.error(e.message || "Failed to send", { id: "inv" });
    }
  };

  const shareLink = `${window.location.origin}/rsvp-info/${party?.public_slug}`;
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!party) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link to="/party-planner" className="text-sm text-muted-foreground hover:underline">← All parties</Link>
        <div className="mt-2 mb-6">
          <h1 className="text-3xl font-bold">{party.title}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
            {party.occasion && <Badge variant="secondary">🎉 {party.occasion}</Badge>}
            {party.event_date && <Badge variant="secondary"><Calendar className="w-3 h-3 mr-1" /> {new Date(party.event_date).toLocaleDateString()}</Badge>}
            {party.guest_count > 0 && <Badge variant="secondary"><Users className="w-3 h-3 mr-1" /> {party.guest_count}</Badge>}
            {tasks.length > 0 && <Badge>{progress}% complete</Badge>}
          </div>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-1" /> Concierge</TabsTrigger>
            <TabsTrigger value="checklist">✅ Checklist {tasks.length > 0 && `(${tasks.length})`}</TabsTrigger>
            <TabsTrigger value="invites"><Mail className="w-4 h-4 mr-1" /> Invites {guests.length > 0 && `(${guests.length})`}</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardContent className="p-4">
                <div className="h-[500px] overflow-y-auto space-y-3 mb-4 px-2">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {sending && <div className="text-sm text-muted-foreground">Concierge is thinking...</div>}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Tell me about your party..."
                    disabled={sending}
                  />
                  <Button onClick={sendMessage} disabled={sending || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist">
            <Card>
              <CardHeader>
                <CardTitle>Smart Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Chat with the Concierge to generate your personalized checklist <Sparkles className="w-4 h-4 inline" />
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((t) => (
                      <div key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border ${t.is_completed ? "opacity-60 line-through" : ""}`}>
                        <Checkbox checked={t.is_completed} onCheckedChange={() => toggleTask(t.id, t.is_completed)} className="mt-1" />
                        <div className="flex-1">
                          <div className="font-medium">{t.title}</div>
                          {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
                          <div className="flex gap-2 mt-1">
                            {t.category && <Badge variant="outline" className="text-xs">{t.category}</Badge>}
                            {t.due_date && <Badge variant="outline" className="text-xs">📅 {new Date(t.due_date).toLocaleDateString()}</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites">
            <Card className="mb-4">
              <CardHeader><CardTitle>Add a guest</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input placeholder="Name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                  <Input placeholder="Email (optional)" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                </div>
                <Button onClick={addGuest} disabled={!guestName.trim()}><Plus className="w-4 h-4 mr-1" /> Add Guest</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Guest List ({guests.length})</CardTitle>
                <Button onClick={sendInvites} size="sm" disabled={!guests.some((g) => g.email && !g.invited_at)}>
                  <Mail className="w-4 h-4 mr-1" /> Send New Invites
                </Button>
              </CardHeader>
              <CardContent>
                {guests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No guests yet</p>
                ) : (
                  <div className="space-y-2">
                    {guests.map((g) => {
                      const rsvpUrl = `${window.location.origin}/rsvp/${g.rsvp_token}`;
                      return (
                        <div key={g.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{g.name}</div>
                            {g.email && <div className="text-xs text-muted-foreground truncate">{g.email}</div>}
                            <div className="flex gap-2 mt-1">
                              <Badge variant={g.rsvp_status === "yes" ? "default" : g.rsvp_status === "no" ? "destructive" : "secondary"} className="text-xs">
                                {g.rsvp_status}
                              </Badge>
                              {g.invited_at && <span className="text-xs text-muted-foreground">Invited</span>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(rsvpUrl); toast.success("Link copied"); }}>
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removeGuest(g.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
