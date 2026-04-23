"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Youtube, Instagram, Music2, Linkedin, Link2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
}

interface ConnectedAccountsProps {
  userId: string;
  initialAccounts: SocialAccount[];
}

const platformConfig = {
  youtube: {
    name: "YouTube",
    icon: Youtube,
    color: "bg-red-500",
    oauthUrl: "/api/oauth/youtube",
  },
  tiktok: {
    name: "TikTok",
    icon: Music2,
    color: "bg-black",
    oauthUrl: "/api/oauth/tiktok",
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "bg-pink-500",
    oauthUrl: "/api/oauth/instagram",
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-600",
    oauthUrl: "/api/oauth/linkedin",
  },
};

export function ConnectedAccounts({ userId, initialAccounts }: ConnectedAccountsProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const supabase = createClient();

  const handleConnect = (platform: string) => {
    setConnecting(platform);
    window.location.href = platformConfig[platform as keyof typeof platformConfig].oauthUrl;
  };

  const handleDisconnect = async (accountId: string, platform: string) => {
    setDisconnecting(accountId);
    try {
      const response = await fetch(`/api/oauth/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) throw new Error("Failed to disconnect");

      setAccounts(accounts.filter((a) => a.id !== accountId));
      toast.success(`${platformConfig[platform as keyof typeof platformConfig].name} disconnected`);
    } catch (error) {
      toast.error("Failed to disconnect account");
    } finally {
      setDisconnecting(null);
    }
  };

  const getConnectedAccount = (platform: string) => {
    return accounts.find((a) => a.platform === platform);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Connect your social media accounts to publish videos directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(platformConfig).map(([key, config]) => {
          const connected = getConnectedAccount(key);
          const Icon = config.icon;

          return (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${config.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{config.name}</p>
                  {connected ? (
                    <p className="text-sm text-muted-foreground">{connected.account_name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  )}
                </div>
              </div>
              {connected ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Connected
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDisconnect(connected.id, key)}
                    disabled={disconnecting === connected.id}
                  >
                    {disconnecting === connected.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnect(key)}
                  disabled={connecting === key}
                >
                  {connecting === key ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="mr-2 h-4 w-4" />
                  )}
                  Connect
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}