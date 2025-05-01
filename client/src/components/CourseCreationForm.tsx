import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category } from "@shared/schema";
import { X, Upload, Plus, Trash, Eye } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

export default function CourseCreationForm() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details"); // details, curriculum, preview
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [modules, setModules] = useState<{
    id: number;
    title: string;
    order: number;
    lessons: {
      id: number;
      title: string;
      videoUrl: string;
      content: string;
      order: number;
      duration: string;
    }[];
  }[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Form setup
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

  // Handle thumbnail upload
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setThumbnailUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new module
  const addModule = () => {
    const newModuleId = modules.length + 1;
    setModules([
      ...modules,
      {
        id: newModuleId,
        title: `Module ${newModuleId}`,
        order: newModuleId,
        lessons: [],
      },
    ]);
  };

  // Update module title
  const updateModuleTitle = (moduleId: number, title: string) => {
    setModules(
      modules.map((module) =>
        module.id === moduleId ? { ...module, title } : module
      )
    );
  };

  // Delete module
  const deleteModule = (moduleId: number) => {
    setModules(modules.filter((module) => module.id !== moduleId));
  };

  // Add new lesson to a module
  const addLesson = (moduleId: number) => {
    setModules(
      modules.map((module) => {
        if (module.id === moduleId) {
          const newLessonId = (module.lessons.length + 1) * 1000 + moduleId;
          return {
            ...module,
            lessons: [
              ...module.lessons,
              {
                id: newLessonId,
                title: `Lesson ${module.lessons.length + 1}`,
                videoUrl: "",
                content: "",
                order: module.lessons.length + 1,
                duration: "00:00",
              },
            ],
          };
        }
        return module;
      })
    );
  };

  // Update lesson title
  const updateLessonTitle = (moduleId: number, lessonId: number, title: string) => {
    setModules(
      modules.map((module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, title } : lesson
            ),
          };
        }
        return module;
      })
    );
  };

  // Update lesson video
  const updateLessonVideo = (moduleId: number, lessonId: number, videoUrl: string) => {
    setModules(
      modules.map((module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, videoUrl } : lesson
            ),
          };
        }
        return module;
      })
    );
  };

  // Update lesson content
  const updateLessonContent = (moduleId: number, lessonId: number, content: string) => {
    setModules(
      modules.map((module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, content } : lesson
            ),
          };
        }
        return module;
      })
    );
  };

  // Delete lesson
  const deleteLesson = (moduleId: number, lessonId: number) => {
    setModules(
      modules.map((module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
          };
        }
        return module;
      })
    );
  };

  // Form submission
  const onSubmit = async (data: CourseFormValues) => {
    // Validation checks
    if (!thumbnailUrl) {
      toast({
        title: "Error",
        description: "Please upload a course thumbnail image",
        variant: "destructive",
      });
      return;
    }

    if (modules.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one module to your course",
        variant: "destructive",
      });
      return;
    }

    // Check if all modules have at least one lesson
    const emptyModules = modules.filter((module) => module.lessons.length === 0);
    if (emptyModules.length > 0) {
      toast({
        title: "Error",
        description: `Module "${emptyModules[0].title}" has no lessons. Please add at least one lesson to each module.`,
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, we would upload the thumbnail and create the course
    // For this demo, we'll just show a success toast
    console.log("Course data:", {
      ...data,
      thumbnail: thumbnailUrl,
      modules: modules,
    });

    toast({
      title: "Success",
      description: "Course created successfully!",
    });
  };

  // Handle save draft
  const saveDraft = () => {
    const data = form.getValues();
    console.log("Saving draft:", {
      ...data,
      thumbnail: thumbnailUrl,
      modules: modules,
    });

    toast({
      title: "Draft Saved",
      description: "Your course draft has been saved",
    });
  };

  return (
    <div className="space-y-6">
      {/* Course Creation Tabs */}
      <div className="flex space-x-1 rounded-lg bg-slate-100 p-1">
        <button
          className={`flex-1 rounded-md px-3 py-2 text-sm ${
            activeTab === "details"
              ? "bg-white shadow"
              : "text-slate-600 hover:text-slate-900"
          }`}
          onClick={() => setActiveTab("details")}
        >
          Course Details
        </button>
        <button
          className={`flex-1 rounded-md px-3 py-2 text-sm ${
            activeTab === "curriculum"
              ? "bg-white shadow"
              : "text-slate-600 hover:text-slate-900"
          }`}
          onClick={() => setActiveTab("curriculum")}
        >
          Curriculum
        </button>
        <button
          className={`flex-1 rounded-md px-3 py-2 text-sm ${
            activeTab === "preview"
              ? "bg-white shadow"
              : "text-slate-600 hover:text-slate-900"
          }`}
          onClick={() => setActiveTab("preview")}
        >
          Preview
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Course Details Tab */}
          {activeTab === "details" && (
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
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
                          defaultValue={field.value}
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
                  <FormLabel>Course Thumbnail</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="thumbnail"
                          className="hidden"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                        />
                        <label
                          htmlFor="thumbnail"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {thumbnailFile
                              ? "Replace thumbnail"
                              : "Upload thumbnail"}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            PNG, JPG or GIF (Max 2MB)
                          </span>
                        </label>
                      </div>
                      <FormDescription className="mt-2">
                        A high-quality image helps your course stand out
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
                            setThumbnailFile(null);
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
          )}

          {/* Curriculum Tab */}
          {activeTab === "curriculum" && (
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  Build your course structure with modules and lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {modules.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-gray-500 mb-4">
                      Your course curriculum is empty. Add your first module to get
                      started.
                    </p>
                    <Button variant="outline" onClick={addModule}>
                      <Plus className="mr-2 h-4 w-4" /> Create First Module
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module) => (
                      <div key={module.id} className="border rounded-lg">
                        <div className="p-4 bg-slate-50 rounded-t-lg flex items-center justify-between">
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) =>
                              updateModuleTitle(module.id, e.target.value)
                            }
                            className="text-lg font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 w-full"
                            placeholder="Module Title"
                          />
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteModule(module.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          {module.lessons.length === 0 ? (
                            <div className="text-center py-4 border border-dashed rounded-lg">
                              <p className="text-gray-500 mb-2">
                                No lessons in this module
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addLesson(module.id)}
                              >
                                <Plus className="mr-1 h-3 w-3" /> Add Lesson
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {module.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="border rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <input
                                      type="text"
                                      value={lesson.title}
                                      onChange={(e) =>
                                        updateLessonTitle(
                                          module.id,
                                          lesson.id,
                                          e.target.value
                                        )
                                      }
                                      className="text-base font-medium bg-transparent border-0 focus:outline-none focus:ring-0 w-full"
                                      placeholder="Lesson Title"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() =>
                                        deleteLesson(module.id, lesson.id)
                                      }
                                    >
                                      <Trash className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                                        Video URL
                                      </label>
                                      <input
                                        type="text"
                                        value={lesson.videoUrl}
                                        onChange={(e) =>
                                          updateLessonVideo(
                                            module.id,
                                            lesson.id,
                                            e.target.value
                                          )
                                        }
                                        className="w-full text-sm p-2 border rounded"
                                        placeholder="https://example.com/video.mp4"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                                        Lesson Content
                                      </label>
                                      <textarea
                                        value={lesson.content}
                                        onChange={(e) =>
                                          updateLessonContent(
                                            module.id,
                                            lesson.id,
                                            e.target.value
                                          )
                                        }
                                        className="w-full text-sm p-2 border rounded h-20"
                                        placeholder="Enter lesson content or description here..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addLesson(module.id)}
                            >
                              <Plus className="mr-1 h-3 w-3" /> Add Lesson
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4">
                      <Button variant="outline" onClick={addModule}>
                        <Plus className="mr-2 h-4 w-4" /> Add Module
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <Card>
              <CardHeader>
                <CardTitle>Course Preview</CardTitle>
                <CardDescription>
                  Review your course before publishing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Course Header Preview */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="relative h-48 bg-gray-100">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt="Course thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-400">
                            No thumbnail uploaded
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="text-xl font-bold">
                        {form.watch("title") || "Course Title"}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <span>
                          {categories?.find(
                            (c) => c.id.toString() === form.watch("categoryId")
                          )?.name || "Category"}
                        </span>
                        <span>•</span>
                        <span>
                          {form.watch("difficulty") === "beginner"
                            ? "Beginner"
                            : form.watch("difficulty") === "intermediate"
                            ? "Intermediate"
                            : form.watch("difficulty") === "advanced"
                            ? "Advanced"
                            : form.watch("difficulty") === "all-levels"
                            ? "All Levels"
                            : "Difficulty Level"}
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="text-gray-700">
                          {form.watch("description") ||
                            "No description provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Curriculum Preview */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Curriculum</h3>
                    {modules.length === 0 ? (
                      <p className="text-gray-500 italic">
                        No modules or lessons created yet
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {modules.map((module) => (
                          <div key={module.id} className="border rounded-lg">
                            <div className="p-3 bg-slate-50 font-semibold">
                              {module.title}
                            </div>
                            <div className="p-3">
                              {module.lessons.length === 0 ? (
                                <p className="text-gray-500 italic text-sm">
                                  No lessons in this module
                                </p>
                              ) : (
                                <ul className="space-y-2">
                                  {module.lessons.map((lesson) => (
                                    <li
                                      key={lesson.id}
                                      className="flex items-center text-sm p-2 hover:bg-gray-50 rounded"
                                    >
                                      <span className="w-4 h-4 mr-2 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                                        {lesson.order}
                                      </span>
                                      {lesson.title}
                                      {lesson.videoUrl && (
                                        <span className="ml-2 text-xs text-blue-500">
                                          (Video)
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={saveDraft}>
              Save as Draft
            </Button>
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Toggle between tabs
                  if (activeTab === "details") {
                    setActiveTab("curriculum");
                  } else if (activeTab === "curriculum") {
                    setActiveTab("preview");
                  } else {
                    // Submit form if on preview tab
                    form.handleSubmit(onSubmit)();
                  }
                }}
              >
                {activeTab === "preview" ? "Submit for Review" : "Next Step"}
              </Button>
              {activeTab === "preview" && (
                <Button type="submit">Publish Course</Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}