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

// Import our components
import CourseDetailsForm from "./CourseDetailsForm";
import CourseCurriculumForm from "./CourseCurriculumForm";
import CourseNavTabs from "./CourseNavTabs";

// Import types
import { Module, Lesson, EditingLesson } from "./types";

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
  const urlParamsString = location.includes('?') ? location.split('?')[1] : '';
  const params = new URLSearchParams(urlParamsString);
  const urlCourseId = params.get('id') ? parseInt(params.get('id')!, 10) : undefined;
  
  // Use courseId from props or URL
  const courseId = propsCourseId || urlCourseId;
  const isEditMode = !!courseId;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details"); // details, curriculum
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<EditingLesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Define hardcoded categories
  const hardcodedCategories: Category[] = [
    { id: "1", name: "Web Development" },
    { id: "2", name: "Data Science" },
    { id: "3", name: "Mobile Development" },
    { id: "4", name: "Cybersecurity" },
    { id: "5", name: "Cloud Computing" },
  ];

  
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
  
  // Fetch course data if in edit mode
  const { data: courseData, isLoading: isLoadingCourse } = useQuery<CourseResponse>({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      if (!courseId) return null as any;
      try {
        const response = await apiRequest(`/api/courses/${courseId}`);
        const data = await response.json() as CourseResponse;
        return data;
      } catch (error) {
        console.error("Error fetching course data:", error);
        throw error;
      }
    },
    enabled: !!courseId,
  });
  
  // Fetch course modules and lessons if in edit mode
  const { data: courseModules, isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: ["/api/courses", courseId, "modules"],
    queryFn: async () => {
      if (!courseId) return null as any;
      const response = await apiRequest(`/api/courses/${courseId}/modules`);
      return await response.json() as Module[];
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

  // Edit an existing lesson
  const editLesson = (moduleId: number, lesson: Lesson) => {
    setEditingLesson({
      id: lesson.id,
      moduleId: moduleId,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      content: lesson.content,
      duration: lesson.duration,
      order: lesson.order
    });
    setIsLessonModalOpen(true);
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

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Course details form submission
  const handleCourseSubmit = async () => {
    console.log("handleCourseSubmit called");
    const data = form.getValues();
    console.log("Form values:", data);
    // Validation checks
    if (!thumbnailUrl) {
      toast({
        title: "Error",
        description: "Please provide a course thumbnail URL",
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
        instructor: "Default Instructor", // TODO: Consider making this dynamic
        featured: data.isFeatured,
        bestseller: data.isBestseller,
        isNew: data.isNew,
      };
      console.log("Course payload:", coursePayload);
      // Create or Update Course
      if (isEditMode && courseId) {
        await apiRequest(`/api/courses/save`, 
          JSON.stringify({ ...coursePayload, id: courseId }),
          { method: 'POST' }
        );
      } else {
        await apiRequest('/api/courses/save', 
          JSON.stringify(coursePayload),
          { method: 'POST' }
        );
      }

      toast({
        title: "Success",
        description: `Course details ${isEditMode ? 'updated' : 'created'} successfully!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      if (courseId) { 
        queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId] });
      }
      
      // Switch to curriculum tab after successful save
      setActiveTab("curriculum");
    } catch (error) {
      console.error("Error saving course details:", error);
      toast({
        title: "Error",
        description: "Failed to save course details. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Curriculum form submission
  const handleCurriculumSubmit = async () => {
    // Validation checks
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
      // Prepare the curriculum data
      const curriculumPayload = {
        courseId: courseId || null, // Include courseId if available
        modules: modules.map(module => ({
          id: module.id,
          title: module.title,
          order: module.order,
          lessons: module.lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.order,
            videoUrl: lesson.videoUrl,
            content: lesson.content,
            duration: lesson.duration
          }))
        }))
      };

      // Save curriculum data
      const response = await apiRequest('/api/curriculum/save', 
        JSON.stringify(curriculumPayload),
        { method: 'POST' }
      );
      
      const responseData = await response.json();
      
      // If response contains the updated modules with new IDs, update the local state
      if (responseData.modules) {
        setModules(responseData.modules);
      }

      toast({
        title: "Success",
        description: `Curriculum ${isEditMode ? 'updated' : 'created'} successfully!`,
      });
      
      if (courseId) { 
        queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId, 'modules'] });
      }
    } catch (error) {
      console.error("Error saving curriculum:", error);
      toast({
        title: "Error",
        description: "Failed to save curriculum. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle lesson save
  const handleLessonSave = async (lessonData: any) => {
    if (!editingLesson) return;

    if (editingLesson.id) {
      // Update existing lesson
      setModules(modules.map(module => {
        if (module.id === editingLesson.moduleId) {
          return {
            ...module,
            lessons: module.lessons.map(lesson => {
              if (lesson.id === editingLesson.id) {
                return {
                  ...lesson,
                  title: lessonData.title,
                  videoUrl: lessonData.videoUrl || "",
                  content: lessonData.content || "",
                  duration: lessonData.duration || "00:00"
                };
              }
              return lesson;
            })
          };
        }
        return module;
      }));
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
      {/* Course Header */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Course" : "Create New Course"}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Edit the details of your existing course" 
              : "Fill in the details to create your new course"}
          </CardDescription>
          {isEditMode && (
            <div className="text-sm text-gray-500 mt-1">
              Course ID: {courseId}
            </div>
          )}
        </CardHeader>
      </Card>
      
      {/* Navigation Tabs */}
      <CourseNavTabs 
        activeTab={activeTab} 
        onChangeTab={handleTabChange} 
        tabOptions={["details", "curriculum"]} 
      />

      {/* Course Details Tab */}
      {activeTab === "details" && (
        <Form {...form}>
          <div className="space-y-8">
            <CourseDetailsForm 
              form={form} 
              thumbnailUrl={thumbnailUrl} 
              setThumbnailUrl={setThumbnailUrl}
              categories={hardcodedCategories}
            />
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                onClick={handleCourseSubmit}
              >
                Save Course Details
              </Button>
            </div>
          </div>
        </Form>
      )}

      {/* Curriculum Tab */}
      {activeTab === "curriculum" && (
        <div className="space-y-8">
          <CourseCurriculumForm
            modules={modules}
            expandedModules={expandedModules}
            onAddModule={addModule}
            onDeleteModule={deleteModule}
            onUpdateModuleTitle={updateModuleTitle}
            onAddLesson={addLesson}
            onDeleteLesson={deleteLesson}
            onEditLesson={editLesson}
            onToggleModuleExpanded={toggleModuleExpanded}
          />
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              onClick={handleCurriculumSubmit}
            >
              Save Curriculum
            </Button>
          </div>
        </div>
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
          courseId={courseId || 0}
          order={editingLesson.order}
          onSave={handleLessonSave}
        />
      )}
    </div>
  );
}
