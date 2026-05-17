"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { Users, UserPlus, Crown, Shield, Trash2, Loader2, Search, Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

interface Member {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: "owner" | "admin" | "member"
  joined_at: string
}

interface TeamSettingsProps {
  organizationId: string
}

export function TeamSettings({ organizationId }: TeamSettingsProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [isInviting, setIsInviting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const supabase = createClient()

  // Pro Tip: Real-time email validation
  const isEmailValid = useMemo(() => {
    if (!inviteEmail.trim()) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)
  }, [inviteEmail])

  // Pro Tip: Filter members by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members
    const query = searchQuery.toLowerCase()
    return members.filter(
      (m) =>
        m.email.toLowerCase().includes(query) ||
        m.full_name?.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query)
    )
  }, [members, searchQuery])

  // Pro Tip: Count members by role for summary
  const roleCounts = useMemo(() => {
    const counts = { owner: 0, admin: 0, member: 0 }
    members.forEach((m) => {
      counts[m.role] = (counts[m.role] || 0) + 1
    })
    return counts
  }, [members])

  useEffect(() => {
    loadMembers()
  }, [organizationId])

  async function loadMembers() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("organization_members")
      .select(
        `
        id, user_id, role, joined_at,
        profiles:user_id (email, full_name)
      `
      )
      .eq("organization_id", organizationId)
      .order("joined_at", { ascending: true })

    if (!error && data) {
      setMembers(
        data.map((m: any) => ({
          id: String(m.id),
          user_id: String(m.user_id),
          email: (m.profiles as any)?.email ?? "",
          full_name: (m.profiles as any)?.full_name ?? null,
          role: String(m.role) as "owner" | "admin" | "member",
          joined_at: String(m.joined_at),
        }))
      )
    } else if (error) {
      toast.error("Failed to load team members")
    }
    setIsLoading(false)
  }

  // Pro Tip: Handle invite with validation + analytics hook
  async function handleInvite() {
    if (!isEmailValid) {
      setEmailError("Please enter a valid email address")
      return
    }
    setEmailError(null)
    setIsInviting(true)

    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, organizationId, role: inviteRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send invitation")
      }

      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail("")
      // Optional: track invite for analytics
      // analytics.track('team_member_invited', { role: inviteRole })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation")
    } finally {
      setIsInviting(false)
    }
  }

  // Pro Tip: Handle member removal with confirmation + reload
  async function handleRemoveMember(memberId: string, memberEmail: string) {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from the team?`)) return

    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId)

    if (error) {
      toast.error("Failed to remove member")
    } else {
      toast.success("Member removed")
      loadMembers()
    }
  }

  // Pro Tip: Handle role change (owner can't be changed)
  async function handleRoleChange(memberId: string, newRole: "admin" | "member") {
    const { error } = await supabase
      .from("organization_members")
      .update({ role: newRole })
      .eq("id", memberId)

    if (error) {
      toast.error("Failed to update role")
    } else {
      toast.success("Role updated")
      loadMembers()
    }
  }

  // Pro Tip: Copy member email for support/debugging
  const copyMemberEmail = useCallback((email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      toast.success("Email copied to clipboard")
    })
  }, [])

  // Pro Tip: Role badge with theme-aware colors
  function getRoleBadge(role: string) {
    switch (role) {
      case "owner":
        return (
          <Badge className="bg-amber-500/90 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700">
            <Crown className="mr-1 h-3 w-3" />
            Owner
          </Badge>
        )
      case "admin":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        )
      default:
        return <Badge variant="secondary" className="bg-muted/50">Member</Badge>
    }
  }

  // Pro Tip: Handle Enter key for invite submission
  const handleInviteKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isEmailValid && !isInviting) {
      e.preventDefault()
      handleInvite()
    }
  }, [isEmailValid, isInviting])

  return (
    <Card className="card-premium max-w-4xl mx-auto">
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl tracking-tight">
              <Users className="h-5 w-5 text-primary" />
              Team Members
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {members.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1.5">
              Manage who has access to your workspace
            </CardDescription>
          </div>
          {/* Role Summary */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(roleCounts).map(([role, count]) => count > 0 && (
              <Badge key={role} variant="outline" className="text-[10px] sm:text-xs">
                {count} {role}{count !== 1 ? "s" : ""}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-5 sm:space-y-6">
        {/* Search & Invite Section */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30"
              aria-label="Search team members"
            />
          </div>

          {/* Invite Form */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex-1 w-full space-y-2">
              <Label htmlFor="invite-email" className="text-sm font-medium">
                Invite Team Member
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="invite-email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value)
                    if (emailError) setEmailError(null)
                  }}
                  onKeyDown={handleInviteKeyDown}
                  className={`pl-10 h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30 ${
                    emailError ? "border-destructive focus-visible:ring-destructive/30" : ""
                  }`}
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  aria-describedby={emailError ? "invite-error" : "invite-help"}
                  disabled={isInviting}
                />
              </div>
              {emailError ? (
                <p id="invite-error" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {emailError}
                </p>
              ) : (
                <p id="invite-help" className="text-xs text-muted-foreground">
                  Enter an email to invite a new team member.
                </p>
              )}
            </div>
            <Select 
              value={inviteRole} 
              onValueChange={(v) => setInviteRole(v as "admin" | "member")}
            >
              <SelectTrigger className="h-10 sm:h-11 w-full sm:w-32 rounded-lg text-sm focus:ring-2 focus:ring-primary/30">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleInvite} 
              disabled={isInviting || !isEmailValid}
              className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-full sm:w-auto disabled:opacity-50"
            >
              {isInviting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Invite
            </Button>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Members List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10 sm:py-12">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-sm text-muted-foreground">Loading members...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty-state border-2 border-dashed border-border/50 rounded-xl py-10 sm:py-12">
            <div className="empty-state-icon">
              <Users className="h-full w-full" />
            </div>
            <p className="empty-state-title">
              {searchQuery ? "No members match your search" : "No team members yet"}
            </p>
            <p className="empty-state-description">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Invite your first team member to start collaborating."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 rounded-xl border border-border/50 overflow-hidden">
            {filteredMembers.map((member) => {
              const initials = member.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || member.email?.[0]?.toUpperCase() || "U"

              return (
                <div 
                  key={member.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-4 sm:px-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 ring-2 ring-border/50">
                      <AvatarFallback className="text-sm bg-primary/10 text-primary font-medium">
                        {initials.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium truncate" title={member.full_name || member.email}>
                          {member.full_name || member.email}
                        </p>
                        {getRoleBadge(member.role)}
                      </div>
                      <p 
                        className="text-sm text-muted-foreground truncate cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => copyMemberEmail(member.email)}
                        title="Click to copy email"
                      >
                        {member.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                        Joined {new Date(member.joined_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
                    {/* Role selector for non-owners */}
                    {member.role !== "owner" && (
                      <Select
                        value={member.role}
                        onValueChange={(v) => handleRoleChange(member.id, v as "admin" | "member")}
                      >
                        <SelectTrigger className="h-9 w-24 sm:w-28 rounded-md text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {/* Remove button for non-owners */}
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id, member.email)}
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
                        aria-label={`Remove ${member.email} from team`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}