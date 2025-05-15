import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface CourseDetailsFormProps {
  form: any;
  thumbnailUrl: string;
  setThumbnailUrl: (url: string) => void;
  categories: { id: string; name: string }[];
}

export default function CourseDetailsForm({ 
  form, 
  thumbnailUrl, 
  setThumbnailUrl,
  categories 
}: CourseDetailsFormProps) {
  return (
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
                    {categories.map((category) => (
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
    </Card>
  );
} 
