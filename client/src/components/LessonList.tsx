import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Module, Lesson } from "@shared/schema";
import { CheckCircle2, Lock, PlayCircle, FileText, Video } from "lucide-react";

interface LessonListProps {
  courseId: number;
  currentLessonId?: number;
}

export default function LessonList({ courseId, currentLessonId }: LessonListProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Fetch course modules and lessons
  const { data: modules, isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: [`/api/courses/${courseId}/modules`],
  });

  const { data: lessons, isLoading: isLoadingLessons } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
  });

  // Find the module that contains the current lesson and expand it by default
  const findModuleForLesson = (lessonId: number) => {
    const lesson = lessons?.find(l => l.id === lessonId);
    return lesson?.moduleId;
  };

  // When modules and current lesson load, expand the current module
  useEffect(() => {
    if (currentLessonId && lessons && modules) {
      const moduleId = findModuleForLesson(currentLessonId);
      if (moduleId) {
        setExpandedModules([`module-${moduleId}`]);
      }
    } else if (modules && modules.length > 0) {
      // If no lesson is selected, expand the first module by default
      setExpandedModules([`module-${modules[0].id}`]);
    }
  }, [currentLessonId, lessons, modules]);

  // Loading state for the lesson list
  if (isLoadingModules || isLoadingLessons) {
    return (
      <div className="bg-background shadow-sm border border-gray-200 rounded-md p-0 animate-pulse">
        <div className="p-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        </div>
        <div className="space-y-0 divide-y divide-gray-200">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center">
                <div className="h-4 w-4 bg-gray-200 rounded-full mr-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no modules available, show sample content structure based on the Udemy interface
  if (!modules || modules.length === 0) {
    // Create fake modules and lessons following the Udemy format
    const dummyModules = [
      {
        id: 1,
        title: "Section 1: Getting Started",
        courseId,
        order: 1,
        lessons: [
          { id: 101, title: "Introduction to the Course", duration: "5min", completed: false },
          { id: 102, title: "Course Overview", duration: "10min", completed: false },
          { id: 103, title: "Setting Up Your Environment", duration: "15min", completed: false }
        ]
      },
      {
        id: 2,
        title: "Section 2: Core Concepts",
        courseId,
        order: 2,
        lessons: [
          { id: 201, title: "Understanding the Basics", duration: "12min", completed: false },
          { id: 202, title: "Key Principles", duration: "18min", completed: false },
          { id: 203, title: "Practical Applications", duration: "20min", completed: false }
        ]
      }
    ];

    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold">Course content</h2>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">6 lessons • 1h 20m total length</span>
            <button className="text-sm text-primary hover:underline">Expand all sections</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {dummyModules.map(module => (
            <div key={module.id} className="border-0">
              <div className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                <h3 className="font-medium text-sm">{module.title}</h3>
                <div className="text-sm text-gray-500">{module.lessons.length} lectures • {module.lessons.length * 10}min</div>
              </div>
              <div className="divide-y divide-gray-200">
                {module.lessons.map(lesson => (
                  <div key={lesson.id} className="p-4 pl-6 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                      <PlayCircle className="text-primary mr-3 h-4 w-4" />
                      <span className="text-sm">{lesson.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">{lesson.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group lessons by module
  const lessonsByModule = modules.reduce((acc, module) => {
    acc[module.id] = lessons?.filter(lesson => lesson.moduleId === module.id) || [];
    return acc;
  }, {} as Record<number, Lesson[]>);

  // Calculate total lessons and course completion
  const totalLessons = lessons?.length || 0;
  const completedLessons = lessons?.filter(lesson => lesson.completed).length || 0;
  const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="bg-background rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Course Content</h2>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm">{totalLessons} lessons • {modules[0]?.courseId ? "4 hours" : "0 hours"}</span>
        <span className="text-sm font-medium text-accent">{completionPercentage.toFixed(0)}% complete</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-accent h-2 rounded-full" 
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      {/* Modules and lessons accordion */}
      <Accordion 
        type="multiple" 
        value={expandedModules}
        onValueChange={setExpandedModules}
        className="space-y-4"
      >
        {modules.map((module) => (
          <AccordionItem 
            key={module.id} 
            value={`module-${module.id}`}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="flex items-center justify-between bg-white p-4 hover:no-underline">
              <h3 className="font-medium text-left">{module.title}</h3>
            </AccordionTrigger>
            <AccordionContent className="p-0 border-t border-gray-200">
              {lessonsByModule[module.id]?.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {lessonsByModule[module.id].map((lesson) => {
                    const isActive = lesson.id === currentLessonId;
                    const isCompleted = lesson.completed;
                    const isLocked = !isCompleted && lesson.id !== currentLessonId;
                    
                    return (
                      <li 
                        key={lesson.id}
                        className={`
                          py-3 px-4 hover:bg-gray-50
                          ${isActive ? 'bg-blue-50' : ''}
                          ${isCompleted && !isActive ? 'bg-gray-50' : ''}
                        `}
                      >
                        <Link href={isLocked ? "#" : `/course/${courseId}/lesson/${lesson.id}`}>
                          <div className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center">
                              {isLocked ? (
                                <Lock className="text-gray-400 mr-3 h-5 w-5" />
                              ) : isCompleted ? (
                                <CheckCircle2 className="text-green-500 mr-3 h-5 w-5" />
                              ) : (
                                <PlayCircle className="text-primary mr-3 h-5 w-5" />
                              )}
                              <span className={`${isLocked ? "text-gray-500" : "text-gray-800"} ${isActive ? "font-medium" : ""}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">{lesson.duration || "10:00"}</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-4 px-6 text-center text-gray-500">
                  <Video className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No lessons available in this module</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {currentLessonId && lessons && lessons.length > 0 && (
        <div className="mt-6">
          {/* Find the next lesson based on order within the modules */}
          {(() => {
            // Find current lesson index
            const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);
            if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
              const nextLesson = lessons[currentIndex + 1];
              return (
                <Link href={`/course/${courseId}/lesson/${nextLesson.id}`} className="block text-center bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-4 py-3 transition-colors">
                  Next Lesson: {nextLesson.title} <span aria-hidden="true">→</span>
                </Link>
              );
            }
            // If there's no next lesson, show a "Complete Course" button
            return (
              <div className="text-center bg-green-600 text-white font-medium rounded-lg px-4 py-3">
                Course Complete!
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
