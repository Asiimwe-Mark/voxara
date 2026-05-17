"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { User, Mail, Loader2, Camera, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50, "Name too long"),
  email: z.string().email("Invalid email address"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface VoxaraUser {
  id: string
  email: string
  user_metadata?: Record<string, string>
}

interface VoxaraProfile {
  full_name?: string | null
  avatar_url?: string | null
  plan?: string
  credits?: number
}

interface ProfileSettingsProps {
  user: VoxaraUser
  profile: VoxaraProfile
}

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isEmailChanged, setIsEmailChanged] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Pro Tip: Memoized initial values for form reset
  const defaultValues = useMemo(() => ({
    fullName: profile?.full_name || "",
    email: user.email || "",
  }), [profile?.full_name, user.email])

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: "onChange", // Real-time validation
  })

  // Pro Tip: Track email changes for confirmation warning
  const emailValue = form.watch("email")
  useEffect(() => {
    setIsEmailChanged(emailValue !== user.email)
  }, [emailValue, user.email])

  // Pro Tip: Avatar upload handler with preview
 // Pro Tip: Avatar upload handler with Supabase Storage + preview
const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Validate file type and size
  if (!file.type.startsWith("image/")) {
    toast.error("Please select an image file (JPG, PNG, GIF, or WebP)")
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image must be less than 5MB")
    return
  }

  // Create preview URL for immediate feedback
  const previewUrl = URL.createObjectURL(file)
  setAvatarPreview(previewUrl)
  toast.info("Uploading avatar...")

  try {
    // Generate unique filename to avoid collisions
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage bucket 'avatars'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Prevent accidental overwrites
        contentType: file.type,
      })

    if (uploadError) throw uploadError

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update profile in Supabase with new avatar URL
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (profileError) throw profileError

    toast.success("Avatar uploaded successfully!")
    
    // Optional: Track upload for analytics
    // analytics.track('avatar_uploaded', { userId: user.id, fileExt })
    
  } catch (error) {
    console.error("Avatar upload failed:", error)
    toast.error(error instanceof Error ? error.message : "Failed to upload avatar")
    
    // Revert preview on error
    setAvatarPreview(null)
  } finally {
    // Clean up preview URL to prevent memory leaks
    URL.revokeObjectURL(previewUrl)
  }
}, [user.id, supabase])

async function onSubmit(values: ProfileFormValues) {
  setIsLoading(true)
  try {
    // Update profile metadata (name, etc.)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: values.fullName })
      .eq("id", user.id)

    if (profileError) throw profileError

    // Update email if changed (requires auth update)
    if (values.email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: values.email,
      })
      if (emailError) throw emailError
      toast.info("Check your new email for confirmation")
    }

    toast.success("Profile updated successfully")
    router.refresh()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to update profile")
  } finally {
    setIsLoading(false)
    // Clean up preview URL if still set
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
      setAvatarPreview(null)
    }
  }
}

  // Pro Tip: Memoized initials calculation
  const initials = useMemo(() => {
    const name = profile?.full_name || user.email?.split("@")[0] || "U"
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }, [profile?.full_name, user.email])

  // Pro Tip: Plan badge color mapping
  const planBadgeClass = useMemo(() => {
    const plan = profile?.plan?.toLowerCase()
    if (plan === "pro") return "bg-primary text-primary-foreground"
    if (plan === "agency") return "bg-violet-600 text-white dark:bg-violet-500"
    return "bg-muted text-muted-foreground"
  }, [profile?.plan])

  return (
    <Card className="card-premium max-w-2xl mx-auto">
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl tracking-tight">Profile Information</CardTitle>
        <CardDescription className="text-sm sm:text-base mt-1.5">
          Update your personal details and account settings
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <div className="relative group">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-border/50">
              <AvatarImage 
                src={avatarPreview || profile?.avatar_url || undefined} 
                alt={profile?.full_name || "Profile"} 
              />
              <AvatarFallback className="text-lg sm:text-xl bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
              aria-label="Change avatar"
            >
              <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Profile Picture</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG, or GIF. Max 5MB.
            </p>
            {avatarPreview && (
              <Badge variant="secondary" className="mt-2 text-xs animate-pulse">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Preview updated — click Save to apply
              </Badge>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input 
                        placeholder="John Doe" 
                        className="pl-10 h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30" 
                        disabled={isLoading} 
                        {...field} 
                        aria-describedby="name-help"
                      />
                    </div>
                  </FormControl>
                  <p id="name-help" className="text-xs text-muted-foreground mt-1">
                    Use your real name for professional accounts.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field with Change Warning */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    {isEmailChanged && (
                      <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-300/50">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Confirmation required
                      </Badge>
                    )}
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input 
                        placeholder="you@example.com" 
                        className="pl-10 h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30" 
                        disabled={isLoading} 
                        {...field} 
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        aria-describedby="email-help"
                      />
                    </div>
                  </FormControl>
                  <p id="email-help" className="text-xs text-muted-foreground mt-1">
                    {isEmailChanged 
                      ? "You'll need to confirm this new email address." 
                      : "Used for login and notifications."}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={isLoading || !form.formState.isDirty}
                className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 w-full sm:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  form.reset(defaultValues)
                  setAvatarPreview(null)
                }}
                disabled={isLoading || !form.formState.isDirty}
                className="h-10 rounded-lg text-sm font-medium transition-smooth w-full sm:w-auto"
              >
                Cancel
              </Button>
              {form.formState.isDirty && !isLoading && (
                <span className="text-xs text-muted-foreground sm:ml-auto">
                  Unsaved changes
                </span>
              )}
            </div>
          </form>
        </Form>

        {/* Plan & Credits Summary */}
        <div className="border-t border-border/50 pt-4">
          <h4 className="font-medium text-sm sm:text-base tracking-tight mb-3">Current Plan</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Plan</span>
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{profile?.plan || "Free"}</span>
              {profile?.plan && (
                <Badge variant="secondary" className={`text-[10px] ${planBadgeClass}`}>
                  {profile.plan}
                </Badge>
              )}
            </div>
            <span className="text-muted-foreground">Credits</span>
            <span className="font-medium tabular-nums">{profile?.credits ?? 0}</span>
          </div>
          <Button 
            variant="link" 
            className="px-0 h-auto text-sm font-medium mt-2" 
            asChild
          >
            <a href="/dashboard/billing">Manage Billing →</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}