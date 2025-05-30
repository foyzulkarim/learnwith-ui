import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const lessonFormSchema = z.object({
  title: z.string().min(3, "Lesson title must be at least 3 characters"),
  content: z.string().optional(),
  duration: z.string().optional(),
  videoUrl: z.string().optional(),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

interface LessonEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson?: {
    _id?: string;
    title: string;
    content?: string;
    videoUrl?: string;
    duration?: string;
  };
  moduleId: string;
  courseId: string;
  order: number;
  onSave: (lessonData: any) => Promise<void>;
}

export default function LessonEditModal({
  isOpen,
  onClose,
  lesson,
  moduleId,
  courseId,
  order,
  onSave,
}: LessonEditModalProps) {
  const { toast } = useToast();

  // Form setup
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: lesson?.title || "",
      content: lesson?.content || "",
      duration: lesson?.duration || "",
      videoUrl: lesson?.videoUrl || "",
    },
  });

  // Form submission
  const onSubmit = async (data: LessonFormValues) => {
    try {
      const lessonData = {
        ...data,
        moduleId,
        courseId,
        order,
        _id: lesson?._id
      };

      await onSave(lessonData);
      
      toast({
        title: "Success",
        description: `Lesson ${lesson?._id ? "updated" : "created"} successfully!`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the lesson.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lesson?._id ? "Edit" : "Add"} Lesson</DialogTitle>
          <DialogDescription>
            {lesson?._id
              ? "Update the lesson details below."
              : "Fill in the details to create a new lesson."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Lesson Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Introduction to React Hooks"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lesson Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter lesson content or description..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Video URL */}
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter video URL (YouTube, Vimeo, or direct video link)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (hh:mm:ss)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 00:15:30"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {lesson?._id ? "Update" : "Create"} Lesson
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
