"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Send,
  Youtube,
  Instagram,
  Linkedin,
  Music2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
}

export function PublishingScheduler({ videoId }: { videoId: string }) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    const { data } = await supabase
      .from("social_accounts")
      .select("id, platform, account_name")
      .order("platform");
    setAccounts(data || []);
  }

  function togglePlatform(platform: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  async function handlePublish() {
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    setIsPublishing(true);
    try {
      const scheduledDateTime =
        scheduleType === "later"
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          : new Date().toISOString();

      const response = await fetch("/api/publish/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          platforms: selectedPlatforms,
          scheduledTime: scheduledDateTime,
          caption,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to schedule");
      }

      if (scheduleType === "now") {
        toast.success("Publishing started! Check status in Publishing tab.");
      } else {
        toast.success(`Scheduled for ${new Date(scheduledDateTime).toLocaleString()}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publishing failed");
    } finally {
      setIsPublishing(false);
    }
  }

  const platformIcons: Record<string, React.ReactNode> = {
    tiktok: <Music2 className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    linkedin: <Linkedin className="h-5 w-5" />,
    youtube: <Youtube className="h-5 w-5" />,
  };

  const platformColors: Record<string, string> = {
    tiktok: "bg-black text-white",
    instagram: "bg-pink-500 text-white",
    linkedin: "bg-blue-600 text-white",
    youtube: "bg-red-600 text-white",
  };

  const connectedPlatforms = accounts.map((a) => a.platform);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish to Social Media</CardTitle>
        <CardDescription>Share your video to multiple platforms at once</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Selection */}
        <div>
          <Label>Select Platforms</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["tiktok", "instagram", "linkedin", "youtube"].map((platform) => {
              const isConnected = connectedPlatforms.includes(platform);
              return (
                <div
                  key={platform}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform)
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => isConnected && togglePlatform(platform)}
                >
                  <Checkbox
                    checked={selectedPlatforms.includes(platform)}
                    disabled={!isConnected}
                  />
                  <div className={`p-1.5 rounded ${platformColors[platform]}`}>
                    {platformIcons[platform]}
                  </div>
                  <span className="capitalize flex-1">{platform}</span>
                  {isConnected ? (
                    <Badge variant="outline" className="text-xs">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Not Connected
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Caption */}
        <div>
          <Label>Caption</Label>
          <Textarea
            placeholder="Write a caption for your post..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {caption.length}/2200 characters
          </p>
        </div>

        {/* Schedule Options */}
        <Tabs value={scheduleType} onValueChange={(v) => setScheduleType(v as "now" | "later")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="now">
              <Send className="h-4 w-4 mr-2" />
              Publish Now
            </TabsTrigger>
            <TabsTrigger value="later">
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
          </TabsList>
          <TabsContent value="later" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          className="w-full"
          onClick={handlePublish}
          disabled={isPublishing || selectedPlatforms.length === 0}
        >
          {isPublishing ? (
            <>Publishing...</>
          ) : scheduleType === "now" ? (
            <>
              <Send className="mr-2 h-4 w-4" /> Publish Now
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" /> Schedule Post
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}