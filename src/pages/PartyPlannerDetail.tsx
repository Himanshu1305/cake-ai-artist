import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InvitePreview } from "@/components/InvitePreview";
import {
  Send,
  Sparkles,
  Plus,
  Trash2,
  Mail,
  Copy,
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  Save,
  Wand2,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const TRENDING_THEMES = [
  "Barbie Pink",
  "Space / Astronaut",
  "Iron Man / Avengers",
  "Spider-Man",
  "Star Wars",
  "Frozen / Elsa",
  "Peppa Pig",
  "Paw Patrol",
  "Dinosaur / Jurassic",
  "Mermaid / Under the Sea",
  "Construction / Trucks",
  "Jungle Safari",
  "Pokemon",
  "Minecraft",
  "Princess / Royal",
  "Wonder Woman",
  "Hot Wheels",
  "Bluey",
  "Taylor Swift Eras",
  "Cocomelon",
  "Harry Potter",
  "Floral Garden",
  "Boho Chic",
  "Disco / Y2K",
  "Unicorn & Rainbow",
  "Pastel Minimal",
  "Tropical Luau",
  "Black & Gold Elegance",
  "Retro 90s",
  "Sports / Football",
  "Spiritual / ISKCON",
  "Garden Tea Party",
  "Carnival / Circus",
  "Custom",
];

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
  const [activeTab, setActiveTab] = useState("details");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Event details form state
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventTime, setEventTime] = useState("18:00");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [themePick, setThemePick] = useState<string>("");
  const [customTheme, setCustomTheme] = useState("");
  const [guestCount, setGuestCount] = useState<string>("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const loadAll = async () => {
    const { data: p } = await supabase.from("parties").select("*").eq("id", id!).maybeSingle();
    if (!p) {
      navigate("/party-planner");
      return;
    }
    setParty(p);
    // Hydrate form
    if (p.event_date) {
      const d = new Date(p.event_date);
      setEventDate(d);
      setEventTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    }
    setVenue(p.venue || "");
    setCity((p as any).city || "");
    setGuestCount(p.guest_count ? String(p.guest_count) : "");
    setContactEmail((p as any).contact_email || "");
    setContactPhone((p as any).contact_phone || "");
    if (p.theme) {
      const match = TRENDING_THEMES.find((t) => t.toLowerCase() === p.theme.toLowerCase());
      if (match) {
        setThemePick(match);
      } else {
        setThemePick("Custom");
        setCustomTheme(p.theme);
      }
    }

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

  // Realtime RSVP updates
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`party-guests-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "party_guests", filter: `party_id=eq.${id}` },
        (payload) => {
          const updated = payload.new as any;
          const old = payload.old as any;
          setGuests((gs) => gs.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)));
          if (
            old?.rsvp_status === "pending" &&
            updated?.rsvp_status &&
            updated.rsvp_status !== "pending"
          ) {
            const emoji =
              updated.rsvp_status === "yes" ? "🎉" : updated.rsvp_status === "no" ? "😢" : "🤔";
            toast.success(`${updated.name} just RSVP'd ${updated.rsvp_status} ${emoji}`);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message when chat empty
  useEffect(() => {
    if (party && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `Hi! I'm your Party Concierge 🎉 Fill in the details on the left and I'll build a complete plan in seconds. Or just tell me what you're celebrating!`,
        },
      ]);
    }
  }, [party]);

  const saveDetails = async () => {
    if (!id) return;
    setSavingDetails(true);
    let isoDate: string | null = null;
    let tz: string | null = null;
    if (eventDate) {
      const [hh, mm] = eventTime.split(":").map(Number);
      const d = new Date(eventDate);
      d.setHours(hh || 0, mm || 0, 0, 0);
      isoDate = d.toISOString();
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    const finalTheme = themePick === "Custom" ? customTheme.trim() : themePick;
    const { error } = await supabase
      .from("parties")
      .update({
        event_date: isoDate,
        event_timezone: tz,
        venue: venue.trim() || null,
        city: city.trim() || null,
        theme: finalTheme || null,
        guest_count: guestCount ? Number(guestCount) : 0,
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
      } as any)
      .eq("id", id);
    setSavingDetails(false);
    if (error) {
      toast.error("Couldn't save details");
      return;
    }
    toast.success("Event details saved");
    await loadAll();
  };

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;
    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    if (!overrideText) setInput("");
    setSending(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Please sign in again");
      const { data, error } = await supabase.functions.invoke("party-planner-chat", {
        body: { partyId: id, userMessage: text },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((m) => [...m, { role: "assistant", content: data.message }]);
      if (data.planBuilt) {
        toast.success("Your party plan is ready!");
        await loadAll();
        setActiveTab("checklist");
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I hit a snag. Try again?" }]);
    } finally {
      setSending(false);
    }
  };

  const generatePlanNow = () =>
    sendMessage(
      "Use the event details I've already filled in to build the full party plan now. Skip clarifying questions and call build_party_plan immediately.",
    );

  const draftVendorMessage = () =>
    sendMessage(
      "Draft a short, friendly WhatsApp/email message I can send to vendors (caterer, decorator, baker) requesting a quote. Include all the event details, my contact info, and the party theme. Format it as a copy-paste block.",
    );

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

  if (!party) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const tz = party.event_timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link to="/party-planner" className="text-sm text-muted-foreground hover:underline">
          ← All parties
        </Link>
        <div className="mt-2 mb-6">
          <h1 className="text-3xl font-bold">{party.title}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
            {party.occasion && <Badge variant="secondary">🎉 {party.occasion}</Badge>}
            {party.event_date && (
              <Badge variant="secondary">
                <CalendarIcon className="w-3 h-3 mr-1" />{" "}
                {new Date(party.event_date).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: tz,
                })}
              </Badge>
            )}
            {party.guest_count > 0 && (
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" /> {party.guest_count}
              </Badge>
            )}
            {tasks.length > 0 && <Badge>{progress}% complete</Badge>}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">📋 Details</TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-1" /> Concierge
            </TabsTrigger>
            <TabsTrigger value="checklist">✅ Checklist {tasks.length > 0 && `(${tasks.length})`}</TabsTrigger>
            <TabsTrigger value="invites">
              <Mail className="w-4 h-4 mr-1" /> Invites {guests.length > 0 && `(${guests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fill these in once — your concierge will use them to build the plan and your invites.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !eventDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={eventDate}
                          onSelect={setEventDate}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Time ({tz})</Label>
                    <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input
                      placeholder="e.g. Our home, Skyline Banquets"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City / Location</Label>
                    <Input
                      placeholder="e.g. Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Guest count</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="15"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={themePick} onValueChange={setThemePick}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a trending theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRENDING_THEMES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {themePick === "Custom" && (
                      <Input
                        className="mt-2"
                        placeholder="Type your own theme"
                        value={customTheme}
                        onChange={(e) => setCustomTheme(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Your contact email (for vendors)</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Your phone / WhatsApp</Label>
                    <Input
                      type="tel"
                      placeholder="+91 98xxxxxxx"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={saveDetails} disabled={savingDetails}>
                    <Save className="w-4 h-4 mr-2" /> {savingDetails ? "Saving..." : "Save details"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setActiveTab("chat");
                      setTimeout(generatePlanNow, 200);
                    }}
                  >
                    <Wand2 className="w-4 h-4 mr-2" /> Generate plan now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Button size="sm" variant="outline" onClick={generatePlanNow} disabled={sending}>
                    <Wand2 className="w-3 h-3 mr-1" /> Generate plan now
                  </Button>
                  <Button size="sm" variant="outline" onClick={draftVendorMessage} disabled={sending}>
                    📨 Draft vendor message
                  </Button>
                </div>
                <div className="h-[450px] overflow-y-auto space-y-3 mb-4 px-2">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${
                          m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
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
                  <Button onClick={() => sendMessage()} disabled={sending || !input.trim()}>
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
                  <div className="text-center py-8 space-y-3">
                    <p className="text-muted-foreground">
                      No checklist yet. Fill in the details and let the concierge build one.
                    </p>
                    <Button onClick={() => setActiveTab("details")}>Go to details</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          t.is_completed ? "opacity-60 line-through" : ""
                        }`}
                      >
                        <Checkbox
                          checked={t.is_completed}
                          onCheckedChange={() => toggleTask(t.id, t.is_completed)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{t.title}</div>
                          {t.description && (
                            <div className="text-sm text-muted-foreground">{t.description}</div>
                          )}
                          <div className="flex gap-2 mt-1">
                            {t.category && (
                              <Badge variant="outline" className="text-xs">
                                {t.category}
                              </Badge>
                            )}
                            {t.due_date && (
                              <Badge variant="outline" className="text-xs">
                                📅 {new Date(t.due_date).toLocaleDateString()}
                              </Badge>
                            )}
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
              <CardHeader>
                <CardTitle>Add a guest</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                  <Input
                    placeholder="Email (optional)"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
                <Button onClick={addGuest} disabled={!guestName.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Add Guest
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Guest List ({guests.length})</CardTitle>
                <Button
                  onClick={sendInvites}
                  size="sm"
                  disabled={!guests.some((g) => g.email && !g.invited_at)}
                >
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
                            {g.email && (
                              <div className="text-xs text-muted-foreground truncate">{g.email}</div>
                            )}
                            <div className="flex gap-2 mt-1">
                              <Badge
                                variant={
                                  g.rsvp_status === "yes"
                                    ? "default"
                                    : g.rsvp_status === "no"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {g.rsvp_status}
                              </Badge>
                              {g.invited_at && (
                                <span className="text-xs text-muted-foreground">Invited</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(rsvpUrl);
                                toast.success("Link copied");
                              }}
                            >
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
