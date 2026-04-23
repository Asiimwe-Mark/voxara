"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, UserPlus, Crown, Shield, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Member {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

interface TeamSettingsProps {
  organizationId: string;
}

export function TeamSettings({ organizationId }: TeamSettingsProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isInviting, setIsInviting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadMembers();
  }, [organizationId]);

  async function loadMembers() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("organization_members")
      .select(
        `
        id, user_id, role, joined_at,
        profiles:user_id (email, full_name)
      `
      )
      .eq("organization_id", organizationId)
      .order("joined_at", { ascending: true });

    if (!error && data) {
      setMembers(
        data.map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          email: m.profiles?.email,
          full_name: m.profiles?.full_name,
          role: m.role,
          joined_at: m.joined_at,
        }))
      );
    }
    setIsLoading(false);
  }

  async function handleInvite() {
    if (!inviteEmail) return;
    setIsInviting(true);

    const response = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, organizationId, role: inviteRole }),
    });

    if (!response.ok) {
      toast.error("Failed to send invitation");
    } else {
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    }
    setIsInviting(false);
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return;

    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast.error("Failed to remove member");
    } else {
      toast.success("Member removed");
      loadMembers();
    }
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "owner":
        return (
          <Badge className="bg-amber-500">
            <Crown className="mr-1 h-3 w-3" />
            Owner
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-blue-500">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members ({members.length})
        </CardTitle>
        <CardDescription>Manage who has access to your workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invite Form */}
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label>Invite Team Member</Label>
            <Input
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "member")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite
          </Button>
        </div>

        {/* Members List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || member.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.full_name || member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getRoleBadge(member.role)}
                  {member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}