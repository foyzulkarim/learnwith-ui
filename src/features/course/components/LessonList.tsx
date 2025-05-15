import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, Lock, PlayCircle, FileText, Video } from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  order: number;
  content?: string;
  moduleId?: string;
  moduleTitle?: string;
}

interface Module {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface LessonListProps {
  courseId: string;
  modules: Module[];
  currentLessonId?: string;
  isLocked?: boolean;
}

export default function LessonList({ courseId, modules, currentLessonId, isLocked = false }: LessonListProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Find the module that contains the current lesson and expand it by default
  const findModuleForLesson = (lessonId: string) => {
    for (const module of modules) {
      if (module.lessons.some(lesson => lesson._id === lessonId)) {
        return module._id;
      }
    }
    return undefined;
  };

  // When modules and current lesson load, expand the current module
  useEffect(() => {
    if (currentLessonId && modules) {
      const moduleId = findModuleForLesson(currentLessonId);
      if (moduleId) {
        setExpandedModules([`module-${moduleId}`]);
      }
    } else if (modules && modules.length > 0) {
      // If no lesson is selected, expand the first module by default
      setExpandedModules([`module-${modules[0]._id}`]);
    }
  }, [currentLessonId, modules]);

  // Loading state for the lesson list
  if (!modules || modules.length === 0) {
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

  // Calculate total lessons and course completion across all modules
  const allLessons = modules.flatMap(module => module.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter(lesson => lesson.isCompleted).length;
  const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Estimate total duration
  const totalDuration = modules.reduce((total, module) => {
    // Sum up the durations of all lessons in the module
    // Assuming duration is in a format like "10:00" or "5min"
    return total + module.lessons.length * 10; // Simple approximation
  }, 0);
  
  // Format the total duration in hours and minutes
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const formattedDuration = hours > 0 
    ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    : `${minutes}m`;

  return (
    <div className="bg-background rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Course Content</h2>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm">{totalLessons} lessons • {formattedDuration}</span>
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
            key={module._id} 
            value={`module-${module._id}`}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="flex items-center justify-between bg-white p-4 hover:no-underline">
              <h3 className="font-medium text-left">{module.title}</h3>
            </AccordionTrigger>
            <AccordionContent className="p-0 border-t border-gray-200">
              {module.lessons && module.lessons.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {module.lessons.map((lesson) => {
                    const isActive = lesson._id === currentLessonId;
                    const isCompleted = lesson.isCompleted;
                    const showLock = isLocked || (!isCompleted && lesson._id !== currentLessonId);
                    return (
                      <li 
                        key={lesson._id}
                        className={`
                          py-3 px-4 hover:bg-gray-50
                          ${isActive ? 'bg-blue-50' : ''}
                          ${isCompleted && !isActive ? 'bg-gray-50' : ''}
                        `}
                      >
                        <Link href={showLock ? "#" : `/course/${courseId}/lesson/${lesson._id}`}>
                          <div className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center">
                              {showLock ? (
                                <span className="relative group">
                                  <Lock className="text-gray-400 mr-3 h-5 w-5" />
                                  <span className="sr-only">{isLocked ? 'Login to unlock this lesson' : 'Complete previous lessons to unlock'}</span>
                                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap">
                                    {isLocked ? 'Login to unlock this lesson' : 'Complete previous lessons to unlock'}
                                  </span>
                                </span>
                              ) : isCompleted ? (
                                <CheckCircle2 className="text-green-500 mr-3 h-5 w-5" />
                              ) : (
                                <PlayCircle className="text-primary mr-3 h-5 w-5" />
                              )}
                              <span className={`${showLock ? "text-gray-500" : "text-gray-800"} ${isActive ? "font-medium" : ""}`}>
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
      
      {currentLessonId && allLessons.length > 0 && (
        <div className="mt-6">
          {/* Find the next lesson based on order across all modules */}
          {(() => {
            // Sort all lessons by module order and then lesson order
            const sortedLessons = [...allLessons].sort((a, b) => {
              const moduleA = modules.find(m => m._id === a.moduleId);
              const moduleB = modules.find(m => m._id === b.moduleId);
              
              if (!moduleA || !moduleB) return 0;
              
              // First sort by module order
              if (moduleA.order !== moduleB.order) {
                return moduleA.order - moduleB.order;
              }
              
              // Then by lesson order within module
              return a.order - b.order;
            });
            
            // Find current lesson index
            const currentIndex = sortedLessons.findIndex(lesson => lesson._id === currentLessonId);
            if (currentIndex >= 0 && currentIndex < sortedLessons.length - 1) {
              const nextLesson = sortedLessons[currentIndex + 1];
              return (
                <Link href={`/course/${courseId}/lesson/${nextLesson._id}`} className="block text-center bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-4 py-3 transition-colors">
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
