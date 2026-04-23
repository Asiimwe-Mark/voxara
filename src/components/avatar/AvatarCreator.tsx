'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function AvatarCreator({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      setImageBase64(base64);
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!name) { toast.error('Please enter a name'); return; }
    setIsCreating(true);
    try {
      const res = await fetch('/api/avatar/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, imageBase64, gender }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Avatar creation started! This may take a few minutes.');
      setOpen(false);
      setName('');
      setImageBase64(null);
      setPreview(null);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Camera className="mr-2 h-4 w-4" />Create Avatar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create AI Avatar</DialogTitle>
          <DialogDescription>Upload a photo to create your digital twin.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Avatar Name</Label>
            <Input placeholder="e.g., Professional Me" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Your Photo</Label>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary" onClick={() => fileInputRef.current?.click()}>
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload a photo</p>
                </>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}