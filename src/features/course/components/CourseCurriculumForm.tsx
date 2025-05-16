import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Trash, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import LessonEditModal from "./LessonEditModal";

interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
  content: string;
  order: number;
  duration: string;
}

interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface EditingLesson {
  id?: number;
  moduleId: number;
  title: string;
  videoUrl: string;
  content: string;
  order: number;
  duration: string;
}

interface CourseCurriculumFormProps {
  courseId: number;
}

export default function CourseCurriculumForm({
  courseId
}: CourseCurriculumFormProps) {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<EditingLesson | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch curriculum data
  const { data: curriculumData, isLoading } = useQuery({
    queryKey: ["/api/courses", courseId, "curriculum"],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/courses/${courseId}/curriculum`);
        if (!response.ok) {
          throw new Error("Failed to fetch curriculum");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching curriculum:", error);
        toast({ 
          title: "Error", 
          description: "Failed to load course curriculum.", 
          variant: "destructive" 
        });
        return { modules: [] };
      }
    },
    enabled: !!courseId,
  });

  // Set modules and expanded state when data is loaded
  useEffect(() => {
    if (curriculumData?.modules) {
      setModules(curriculumData.modules);
      // Initialize expanded state for all modules
      const expandedState: Record<string, boolean> = {};
      curriculumData.modules.forEach((module: Module) => {
        expandedState[module.id.toString()] = true; // Default expanded
      });
      setExpandedModules(expandedState);
    }
  }, [curriculumData]);

  // Save curriculum mutation
  const saveCurriculumMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      try {
        console.log("Saving curriculum for course ID:", courseId);
        console.log("Modules to save:", modules);
        const response = await apiRequest(
          `/api/courses/${courseId}/curriculum`,
          { modules },
          { method: 'POST' }
        );
        console.log("Response:", response);
        if (!response.ok) {
          throw new Error('Failed to save curriculum');
        }
        
        return await response.json();
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Curriculum Saved",
        description: "Your course curriculum has been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId, 'curriculum'] });
    },
    onError: (error) => {
      console.error("Error saving curriculum:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save curriculum.", 
        variant: "destructive" 
      });
    }
  });

  // Module functions
  const addModule = () => {
    const newModuleId = Date.now(); // Temporary ID until saved
    const newModule: Module = {
      id: newModuleId,
      title: "New Module",
      order: modules.length + 1,
      lessons: []
    };
    
    setModules([...modules, newModule]);
    // Expand the new module
    setExpandedModules({
      ...expandedModules,
      [newModuleId.toString()]: true
    });
  };

  const toggleModuleExpanded = (moduleId: number) => {
    setExpandedModules({
      ...expandedModules,
      [moduleId.toString()]: !expandedModules[moduleId.toString()]
    });
  };

  const updateModuleTitle = (moduleId: number, title: string) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, title } : module
    ));
  };

  const deleteModule = (moduleId: number) => {
    setModules(modules.filter(module => module.id !== moduleId));
  };

  // Lesson functions
  const addLesson = (moduleId: number) => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;

    const lessonOrder = modules[moduleIndex].lessons.length + 1;
    
    setEditingLesson({
      moduleId,
      title: "",
      videoUrl: "",
      content: "",
      order: lessonOrder,
      duration: ""
    });
    
    setIsLessonModalOpen(true);
  };

  const editLesson = (moduleId: number, lesson: Lesson) => {
    setEditingLesson({
      id: lesson.id,
      moduleId,
      title: lesson.title,
      videoUrl: lesson.videoUrl || "",
      content: lesson.content || "",
      order: lesson.order,
      duration: lesson.duration || ""
    });
    
    setIsLessonModalOpen(true);
  };

  const deleteLesson = (moduleId: number, lessonId: number) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { 
            ...module, 
            lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
          } 
        : module
    ));
  };

  const handleLessonSave = async (lessonData: EditingLesson): Promise<void> => {
    const moduleIndex = modules.findIndex(m => m.id === lessonData.moduleId);
    if (moduleIndex === -1) return;
    
    const updatedModules = [...modules];
    const module = updatedModules[moduleIndex];
    
    if (lessonData.id) {
      // Update existing lesson
      updatedModules[moduleIndex] = {
        ...module,
        lessons: module.lessons.map(lesson => 
          lesson.id === lessonData.id 
            ? { 
                ...lesson, 
                title: lessonData.title,
                videoUrl: lessonData.videoUrl,
                content: lessonData.content,
                duration: lessonData.duration
              } 
            : lesson
        )
      };
    } else {
      // Add new lesson
      const newLessonId = Date.now(); // Temporary ID until saved
      updatedModules[moduleIndex] = {
        ...module,
        lessons: [
          ...module.lessons,
          {
            id: newLessonId,
            title: lessonData.title,
            videoUrl: lessonData.videoUrl,
            content: lessonData.content,
            order: lessonData.order,
            duration: lessonData.duration
          }
        ]
      };
    }
    
    setModules(updatedModules);
    setIsLessonModalOpen(false);
    setEditingLesson(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-4">
            <div className="inline-block w-6 h-6 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading curriculum...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
                                  onClick={() => editLesson(module.id, lesson)}
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
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            type="button" 
            disabled={isSubmitting}
            onClick={() => saveCurriculumMutation.mutate()}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">
                  <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin inline-block"></div>
                </span>
                Saving Curriculum...
              </>
            ) : (
              "Save Curriculum"
            )}
          </Button>
        </CardFooter>
      </Card>

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
          courseId={courseId}
          order={editingLesson.order}
          onSave={handleLessonSave}
        />
      )}
    </>
  );
} 
