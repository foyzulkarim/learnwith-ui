import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the category type
export interface Category {
  id: string;
  name: string;
}

// Form validation schema
const courseFormSchema = z.object({
  title: z.string().min(3, "Course title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  difficulty: z.string().min(1, "Difficulty level is required"),
  price: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNew: z.boolean().default(true),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseDetailsFormProps {
  courseId?: number;
  onCourseSaved: (savedCourseId: number) => void;
}

export default function CourseDetailsForm({ 
  courseId,
  onCourseSaved
}: CourseDetailsFormProps) {
  const { toast } = useToast();
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define hardcoded categories - can be replaced with an API call later
  const hardcodedCategories: Category[] = [
    { id: "1", name: "Web Development" },
    { id: "2", name: "Data Science" },
    { id: "3", name: "Mobile Development" },
    { id: "4", name: "Cybersecurity" },
    { id: "5", name: "Cloud Computing" },
  ];
  
  // Initialize form with react-hook-form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      difficulty: "",
      price: "",
      isFeatured: false,
      isBestseller: false,
      isNew: true,
    },
  });
  
  // Fetch course data if in edit mode
  const { data: courseData, isLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      try {
        const response = await apiRequest(`/api/courses/${courseId}`);
        return await response.json();
      } catch (error) {
        console.error("Error fetching course data:", error);
        toast({ title: "Error", description: "Could not load course data.", variant: "destructive" });
        return null;
      }
    },
    enabled: !!courseId,
  });
  
  // Update form values when course data is loaded
  useEffect(() => {
    if (courseData) {
      form.reset({
        title: courseData.title || "",
        description: courseData.description || "",
        categoryId: courseData.categoryId || "",
        difficulty: courseData.difficulty || "",
        price: courseData.price ? courseData.price.toString() : "",
        isFeatured: courseData.isFeatured || false,
        isBestseller: courseData.isBestseller || false,
        isNew: courseData.isNew || true,
      });
      // Handle both property names for thumbnail
      setThumbnailUrl(courseData.thumbnailUrl || courseData.thumbnail || "");
    }
  }, [courseData, form]);
  
  // Handle form submission
  const onSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      const courseData = {
        ...values,
        thumbnailUrl,
        price: values.price ? parseFloat(values.price) : null,
      };
      
      const apiUrl = courseId 
        ? `/api/courses/${courseId}` 
        : '/api/courses';
      
      const response = await apiRequest(apiUrl, {
        method: courseId ? 'PUT' : 'POST',
        body: JSON.stringify(courseData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save course');
      }
      
      const savedCourse = await response.json();
      toast({
        title: courseId ? "Course Updated" : "Course Created",
        description: courseId ? "Your course has been updated successfully." : "Your new course has been created successfully.",
      });
      
      onCourseSaved(savedCourse.id);
    } catch (error) {
      console.error('Error saving course:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save course information.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading && courseId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-4">
            <div className="inline-block w-6 h-6 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading course details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Provide essential information about your course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Advanced JavaScript Techniques"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Give your course a clear and descriptive title
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what students will learn in this course"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a comprehensive description of your course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hardcodedCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the most relevant category for your course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course Difficulty */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="all-levels">All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Define the skill level required for this course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Course Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., 49.99 (leave empty for free)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Set a price for your course (leave empty for free courses)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course Thumbnail */}
            <div className="space-y-2">
              <FormLabel>Course Thumbnail URL</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.png"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription className="mt-2">
                    Enter the URL for the course thumbnail image.
                  </FormDescription>
                </div>
                {thumbnailUrl && (
                  <div className="relative">
                    <img
                      src={thumbnailUrl}
                      alt="Course thumbnail preview"
                      className="rounded-lg object-cover w-full h-36"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      onClick={() => {
                        setThumbnailUrl("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Course Flags */}
            <div className="space-y-4">
              <FormLabel>Course Flags</FormLabel>
              <div className="flex flex-wrap gap-4">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-sm font-normal">
                          Featured Course
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isBestseller"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-sm font-normal">
                          Bestseller
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isNew"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-sm font-normal">
                          New Course
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">
                    <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin inline-block"></div>
                  </span>
                  {courseId ? "Updating..." : "Creating..."}
                </>
              ) : (
                courseId ? "Update Course" : "Create Course"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
} 
