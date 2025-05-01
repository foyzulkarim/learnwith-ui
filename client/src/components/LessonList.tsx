import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Module, Lesson } from "@shared/schema";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";

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
  useState(() => {
    if (currentLessonId && lessons && modules) {
      const moduleId = findModuleForLesson(currentLessonId);
      if (moduleId) {
        setExpandedModules([`module-${moduleId}`]);
      }
    }
  });

  if (isLoadingModules || isLoadingLessons) {
    return (
      <div className="bg-background rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-white p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group lessons by module
  const lessonsByModule = modules?.reduce((acc, module) => {
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
        <span className="text-sm">{totalLessons} lessons • {modules?.[0]?.courseId ? "4 hours" : "0 hours"}</span>
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
        {modules?.map((module) => (
          <AccordionItem 
            key={module.id} 
            value={`module-${module.id}`}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="flex items-center justify-between bg-white p-4 hover:no-underline">
              <h3 className="font-medium text-left">{module.title}</h3>
            </AccordionTrigger>
            <AccordionContent className="p-0 border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {lessonsByModule?.[module.id]?.map((lesson) => {
                  const isActive = lesson.id === currentLessonId;
                  const isCompleted = lesson.completed;
                  const isLocked = !isCompleted && lesson.id !== currentLessonId;
                  
                  return (
                    <li 
                      key={lesson.id}
                      className={`
                        ${isActive ? 'lesson-item-active' : ''}
                        ${isCompleted && !isActive ? 'lesson-item-completed' : ''}
                      `}
                    >
                      <Link href={isLocked ? "#" : `/course/${courseId}/lesson/${lesson.id}`}>
                        <a className="lesson-item block">
                          <div className="flex items-center">
                            {isLocked ? (
                              <Lock className="text-gray-400 mr-3 h-5 w-5" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="text-accent mr-3 h-5 w-5" />
                            ) : (
                              <PlayCircle className="text-primary mr-3 h-5 w-5" />
                            )}
                            <span className={isLocked ? "text-gray-500" : "font-medium"}>
                              {lesson.title}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">{lesson.duration}</span>
                        </a>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {currentLessonId && (
        <div className="mt-6">
          <Link href={`/course/${courseId}/next-lesson`} className="block text-center bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-4 py-3 transition-colors">
            Next Lesson <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
