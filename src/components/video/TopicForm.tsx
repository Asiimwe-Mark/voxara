"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const topicSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(200, "Topic too long"),
  tone: z.enum(["casual", "professional", "enthusiastic"]),
  duration: z.enum(["short", "medium", "long"]),
});

export type TopicFormValues = z.infer<typeof topicSchema>;

interface TopicFormProps {
  onSubmit: (values: TopicFormValues) => Promise<void>;
  isGenerating: boolean;
  defaultTopic?: string;
}

export function TopicForm({ onSubmit, isGenerating, defaultTopic = "" }: TopicFormProps) {
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: { topic: defaultTopic, tone: "casual", duration: "medium" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Topic</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 5 morning habits that changed my life"
                  disabled={isGenerating}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="short">Short (~30s)</SelectItem>
                    <SelectItem value="medium">Medium (~60s)</SelectItem>
                    <SelectItem value="long">Long (~90s)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isGenerating}>
          {isGenerating ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Script…</>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" />Generate Script</>
          )}
        </Button>
      </form>
    </Form>
  );
}
