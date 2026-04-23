"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const scriptSchema = z.object({
  script: z.string().min(50, "Script must be at least 50 characters").max(5000, "Script is too long"),
});

export type ScriptFormValues = z.infer<typeof scriptSchema>;

interface ScriptEditorProps {
  initialScript: string;
  onSubmit: (values: ScriptFormValues) => Promise<void>;
  onRegenerate: () => void;
  isSubmitting: boolean;
}

export function ScriptEditor({ initialScript, onSubmit, onRegenerate, isSubmitting }: ScriptEditorProps) {
  const form = useForm<ScriptFormValues>({
    resolver: zodResolver(scriptSchema),
    defaultValues: { script: initialScript },
  });

  // Sync if parent updates the script (e.g., after re-generation)
  useEffect(() => {
    form.setValue("script", initialScript, { shouldDirty: false });
  }, [initialScript, form]);

  const charCount = form.watch("script").length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="script"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Script</FormLabel>
                <span className={`text-xs tabular-nums ${charCount > 4500 ? "text-destructive" : "text-muted-foreground"}`}>
                  {charCount} / 5000
                </span>
              </div>
              <FormControl>
                <Textarea
                  rows={12}
                  className="resize-none font-mono text-sm leading-relaxed"
                  placeholder="Your script will appear here…"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onRegenerate} disabled={isSubmitting} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Video…</>
            ) : (
              <><Send className="mr-2 h-4 w-4" />Create Video</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
