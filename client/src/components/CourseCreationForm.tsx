import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category } from "@shared/schema";
import { X, Upload, Plus, Trash, Eye, ChevronDown, ChevronRight } from "lucide-react";
import LessonEditModal from "./LessonEditModal";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

type CourseCreationFormProps = {
  courseId?: number;
};

export default function CourseCreationForm({ courseId: propsCourseId }: CourseCreationFormProps = {}) {
  // Parse course ID from URL parameters if not provided in props
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const urlCourseId = params.get('id') ? parseInt(params.get('id')!, 10) : undefined;
  
  // Use courseId from props or URL
  const courseId = propsCourseId || urlCourseId;
  const isEditMode = !!courseId;
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
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{
    id?: number;
    moduleId: number;
    title: string;
    videoUrl?: string;
    content?: string;
    duration?: string;
    order: number;
  } | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Define types for API responses
  interface CourseResponse {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    categoryId: number;
    difficulty: string;
    price?: string;
    featured?: boolean;
    bestseller?: boolean;
    isNew?: boolean;
    published?: boolean;
  }
  
  interface ModuleResponse {
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
  }
  
  // Fetch course data if in edit mode
  const { data: courseData, isLoading: isLoadingCourse } = useQuery<CourseResponse>({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      if (!courseId) return null as any;
      const response = await apiRequest(`/api/courses/${courseId}`);
      return await response.json() as CourseResponse;
    },
    enabled: !!courseId,
  });
  
  // Fetch course modules and lessons if in edit mode
  const { data: courseModules, isLoading: isLoadingModules } = useQuery<ModuleResponse[]>({
    queryKey: ["/api/courses", courseId, "modules"],
    queryFn: async () => {
      if (!courseId) return null as any;
      const response = await apiRequest(`/api/courses/${courseId}/modules`);
      return await response.json() as ModuleResponse[];
    },
    enabled: !!courseId,
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
  
  // Update form with course data when in edit mode
  useEffect(() => {
    if (isEditMode && courseData) {
      // Set form values
      form.reset({
        title: courseData.title || "",
        description: courseData.description || "",
        categoryId: courseData.categoryId ? courseData.categoryId.toString() : "",
        difficulty: courseData.difficulty || "beginner",
        price: courseData.price || "",
        isFeatured: courseData.featured || false,
        isBestseller: courseData.bestseller || false,
        isNew: courseData.isNew || false,
      });
      
      // Set thumbnail
      if (courseData.thumbnail) {
        setThumbnailUrl(courseData.thumbnail);
      }
    }
  }, [isEditMode, courseData, form]);
  
  // Update modules and lessons when in edit mode
  useEffect(() => {
    if (isEditMode && courseModules && courseModules.length > 0) {
      setModules(courseModules);
      
      // Expand all modules initially
      const expandAll: Record<string, boolean> = {};
      courseModules.forEach(module => {
        expandAll[module.id.toString()] = true;
      });
      setExpandedModules(expandAll);
    }
  }, [isEditMode, courseModules]);

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
    
    // Auto-expand newly created module
    setExpandedModules({
      ...expandedModules,
      [newModuleId.toString()]: true
    });
  };
  
  // Toggle module expanded state
  const toggleModuleExpanded = (moduleId: number) => {
    const moduleIdStr = moduleId.toString();
    setExpandedModules({
      ...expandedModules,
      [moduleIdStr]: !expandedModules[moduleIdStr]
    });
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
    // Find the module
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    // Set up the lesson model with defaults
    setEditingLesson({
      moduleId,
      title: `Lesson ${module.lessons.length + 1}`,
      order: module.lessons.length + 1,
      videoUrl: "",
      content: "",
      duration: "00:00"
    });
    
    // Open the modal
    setIsLessonModalOpen(true);
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

    try {
      // Prepare the course data
      const coursePayload = {
        ...data,
        categoryId: parseInt(data.categoryId),
        thumbnail: thumbnailUrl,
      };

      let response;
      
      if (isEditMode) {
        // Update existing course
        response = await apiRequest(`/api/courses/${courseId}`, 
          JSON.stringify(coursePayload),
          { method: 'PATCH' }
        );
        
        // Update modules and lessons
        for (const module of modules) {
          if (module.id && module.id > 0) {
            // Update existing module
            await apiRequest(`/api/modules/${module.id}`, 
              JSON.stringify({
                title: module.title,
                courseId: courseId,
                order: module.order,
              }),
              { method: 'PATCH' }
            );
          } else {
            // Create new module
            const moduleResponse = await apiRequest('/api/modules', 
              JSON.stringify({
                title: module.title,
                courseId: courseId,
                order: module.order,
              }),
              { method: 'POST' }
            );
            const newModule = await moduleResponse.json() as { id: number };
            
            module.id = newModule.id;
          }
          
          // Handle lessons within the module
          for (const lesson of module.lessons) {
            if (lesson.id && lesson.id > 0) {
              // Update existing lesson
              await apiRequest(`/api/lessons/${lesson.id}`, 
                JSON.stringify({
                  title: lesson.title,
                  moduleId: module.id,
                  courseId: courseId,
                  order: lesson.order,
                  videoUrl: lesson.videoUrl,
                  content: lesson.content,
                  duration: lesson.duration,
                }),
                { method: 'PATCH' }
              );
            } else {
              // Create new lesson
              await apiRequest('/api/lessons', 
                JSON.stringify({
                  title: lesson.title,
                  moduleId: module.id,
                  courseId: courseId,
                  order: lesson.order,
                  videoUrl: lesson.videoUrl,
                  content: lesson.content,
                  duration: lesson.duration,
                }),
                { method: 'POST' }
              );
            }
          }
        }
        
        toast({
          title: "Success",
          description: "Course updated successfully!",
        });
      } else {
        // Create new course
        const courseResponse = await apiRequest('/api/courses', 
          JSON.stringify(coursePayload),
          { method: 'POST' }
        );
        
        const courseData = await courseResponse.json() as { id: number };
        const newCourseId = courseData.id;
        
        // Create modules and lessons
        for (const module of modules) {
          const newModule = await apiRequest('/api/modules', 
            JSON.stringify({
              title: module.title,
              courseId: newCourseId,
              order: module.order,
            }),
            { method: 'POST' }
          ) as { id: number };
          
          // Create lessons for this module
          for (const lesson of module.lessons) {
            await apiRequest('/api/lessons', 
              JSON.stringify({
                title: lesson.title,
                moduleId: newModule.id,
                courseId: newCourseId,
                order: lesson.order,
                videoUrl: lesson.videoUrl,
                content: lesson.content,
                duration: lesson.duration,
              }),
              { method: 'POST' }
            );
          }
        }
        
        toast({
          title: "Success",
          description: "Course created successfully!",
        });
      }
      
      // Invalidate queries to refresh the course list
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      
      // If we were editing, also invalidate the specific course data
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId] });
        queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId, 'modules'] });
      }
      
      // In a real application, we might redirect to the courses page here
    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: "Failed to save course. Please try again.",
        variant: "destructive",
      });
    }
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

  // Show loading state while fetching course data in edit mode
  if (isEditMode && (isLoadingCourse || isLoadingModules)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Loading course data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Creation/Edit Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold">{isEditMode ? "Edit Course" : "Create New Course"}</h2>
        {isEditMode && (
          <div className="mt-2 sm:mt-0 text-sm text-gray-500">
            Course ID: {courseId}
          </div>
        )}
      </div>
      
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
          onClick={() => {
            // Expand all modules for better visibility in preview
            const expandAll: Record<string, boolean> = {};
            modules.forEach(module => {
              expandAll[module.id.toString()] = true;
            });
            setExpandedModules(expandAll);
            setActiveTab("preview");
          }}
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
                    {/* Modules Accordion */}
                    {modules.map((module) => (
                      <div key={module.id} className="border rounded-lg">
                        <div 
                          className="p-4 bg-slate-50 rounded-t-lg flex items-center justify-between cursor-pointer"
                          onClick={(e) => {
                            // Prevent collapsing when clicking on input or buttons
                            if (
                              e.target instanceof HTMLInputElement ||
                              e.target instanceof HTMLButtonElement ||
                              (e.target instanceof Element && 
                                (e.target.closest('button') || e.target.tagName === 'svg' || e.target.tagName === 'path'))
                            ) {
                              return;
                            }
                            toggleModuleExpanded(module.id);
                          }}
                        >
                          <div className="flex items-center flex-1">
                            {expandedModules[module.id.toString()] ? (
                              <ChevronDown className="h-5 w-5 mr-2 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-5 w-5 mr-2 text-gray-500" />
                            )}
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                              className="text-lg font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 flex-1"
                              placeholder="Module Title"
                              onClick={(e) => e.stopPropagation()} // Prevent collapse when editing title
                            />
                            <div className="text-sm text-gray-500 ml-2">
                              {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent collapse toggle
                                addLesson(module.id);
                              }}
                            >
                              <Plus className="mr-1 h-3 w-3" /> Add Lesson
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent collapse toggle
                                deleteModule(module.id);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {expandedModules[module.id.toString()] && (
                          <div className="p-4">
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
                              <div className="divide-y">
                                {module.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="py-3 flex items-center justify-between"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium">
                                        {lesson.order}
                                      </span>
                                      <span className="font-medium">{lesson.title}</span>
                                      {lesson.videoUrl && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                          Video
                                        </span>
                                      )}
                                      {lesson.duration && (
                                        <span className="text-xs text-gray-500">
                                          {lesson.duration}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingLesson({
                                            id: lesson.id,
                                            moduleId: module.id,
                                            title: lesson.title,
                                            videoUrl: lesson.videoUrl,
                                            content: lesson.content,
                                            duration: lesson.duration,
                                            order: lesson.order
                                          });
                                          setIsLessonModalOpen(true);
                                        }}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => deleteLesson(module.id, lesson.id)}
                                      >
                                        <Trash className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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
          
          {/* Lesson Edit Modal */}
          {isLessonModalOpen && editingLesson && (
            <LessonEditModal
              isOpen={isLessonModalOpen}
              onClose={() => {
                setIsLessonModalOpen(false);
                setEditingLesson(null);
              }}
              lesson={editingLesson}
              moduleId={editingLesson.moduleId}
              courseId={parseInt(form.getValues().categoryId)}
              order={editingLesson.order}
              onSave={async (lessonData) => {
                if (editingLesson.id) {
                  // Update existing lesson
                  updateLessonTitle(
                    editingLesson.moduleId,
                    editingLesson.id,
                    lessonData.title
                  );
                  updateLessonVideo(
                    editingLesson.moduleId,
                    editingLesson.id,
                    lessonData.videoUrl
                  );
                  updateLessonContent(
                    editingLesson.moduleId,
                    editingLesson.id,
                    lessonData.content
                  );
                  
                  // Update duration if included
                  if (lessonData.duration) {
                    setModules(modules.map(module => {
                      if (module.id === editingLesson.moduleId) {
                        return {
                          ...module,
                          lessons: module.lessons.map(lesson => {
                            if (lesson.id === editingLesson.id) {
                              return {
                                ...lesson,
                                duration: lessonData.duration
                              };
                            }
                            return lesson;
                          })
                        };
                      }
                      return module;
                    }));
                  }
                } else {
                  // This is a new lesson being added
                  const newLessonId = Date.now(); // Simple way to get a unique ID
                  setModules(modules.map(module => {
                    if (module.id === editingLesson.moduleId) {
                      return {
                        ...module,
                        lessons: [
                          ...module.lessons,
                          {
                            id: newLessonId,
                            title: lessonData.title,
                            videoUrl: lessonData.videoUrl || "",
                            content: lessonData.content || "",
                            order: editingLesson.order,
                            duration: lessonData.duration || "00:00"
                          }
                        ]
                      };
                    }
                    return module;
                  }));
                }
              }}
            />
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
                            <div 
                              className="p-3 bg-slate-50 font-semibold flex items-center justify-between cursor-pointer"
                              onClick={() => toggleModuleExpanded(module.id)}
                            >
                              <div className="flex items-center">
                                {expandedModules[module.id.toString()] ? (
                                  <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                                )}
                                {module.title}
                              </div>
                              <span className="text-xs text-gray-500 font-normal">
                                {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {expandedModules[module.id.toString()] && (
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
                                        {lesson.duration && (
                                          <span className="ml-2 text-xs text-gray-500">
                                            {lesson.duration}
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
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
                    // Before switching to preview, expand all modules for better visibility
                    const expandAll: Record<string, boolean> = {};
                    modules.forEach(module => {
                      expandAll[module.id.toString()] = true;
                    });
                    setExpandedModules(expandAll);
                    setActiveTab("preview");
                  } else {
                    // Submit form if on preview tab
                    form.handleSubmit(onSubmit)();
                  }
                }}
              >
                {activeTab === "preview" ? (isEditMode ? "Save Changes" : "Submit for Review") : "Next Step"}
              </Button>
              {activeTab === "preview" && (
                <Button type="submit">
                  {isEditMode ? "Update Course" : "Publish Course"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}