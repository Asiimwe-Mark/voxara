'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Camera, Upload, Loader2, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function AvatarCreator({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'neutral'>('neutral')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      const base64 = result.split(',')[1]
      setImageBase64(base64)
      setPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleCreate = async () => {
    if (!name) {
      toast.error('Please enter a name')
      return
    }
    if (!imageBase64) {
      toast.error('Please upload a photo')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/avatar/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, imageBase64, gender }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast.success('Avatar creation started! This may take a few minutes.')
      setOpen(false)
      setName('')
      setImageBase64(null)
      setPreview(null)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 sm:h-11 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <Camera className="mr-2 h-4 w-4" />
          Create Avatar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl">Create AI Avatar</DialogTitle>
          <DialogDescription className="text-sm">
            Upload a photo to create your digital twin.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Avatar Name */}
          <div className="space-y-2">
            <Label htmlFor="avatar-name" className="text-sm font-medium">
              Avatar Name
            </Label>
            <Input
              id="avatar-name"
              placeholder="e.g., Professional Me"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-lg text-sm focus-visible:ring-primary/30"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="avatar-gender" className="text-sm font-medium">
              Gender
            </Label>
            <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female' | 'neutral')}>
              <SelectTrigger id="avatar-gender" className="h-11 rounded-lg text-sm focus-visible:ring-primary/30">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Photo</Label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
                transition-smooth hover:bg-muted/30 group
                ${preview ? 'border-primary/50 bg-primary/5' : 'border-border/80 hover:border-primary'}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="relative flex flex-col items-center">
                  <img
                    src={preview}
                    alt="Avatar Preview"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      <ImagePlus className="h-4 w-4" />
                      Change Image
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click to change image
                  </p>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center">
                  <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Upload a photo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, max 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-11 sm:h-10 rounded-xl w-full sm:w-auto text-sm font-medium transition-smooth"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !name || !imageBase64}
            className="h-11 sm:h-10 rounded-xl w-full sm:w-auto text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}