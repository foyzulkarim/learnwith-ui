import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ChevronDown, ChevronRight } from "lucide-react";

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

interface CourseCurriculumFormProps {
  modules: Module[];
  expandedModules: Record<string, boolean>;
  onAddModule: () => void;
  onDeleteModule: (moduleId: number) => void;
  onUpdateModuleTitle: (moduleId: number, title: string) => void;
  onAddLesson: (moduleId: number) => void;
  onDeleteLesson: (moduleId: number, lessonId: number) => void;
  onEditLesson: (moduleId: number, lesson: Lesson) => void;
  onToggleModuleExpanded: (moduleId: number) => void;
}

export default function CourseCurriculumForm({
  modules,
  expandedModules,
  onAddModule,
  onDeleteModule,
  onUpdateModuleTitle,
  onAddLesson,
  onDeleteLesson,
  onEditLesson,
  onToggleModuleExpanded
}: CourseCurriculumFormProps) {
  return (
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
            <Button variant="outline" onClick={onAddModule}>
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
                    onToggleModuleExpanded(module.id);
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
                      onChange={(e) => onUpdateModuleTitle(module.id, e.target.value)}
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
                        onAddLesson(module.id);
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
                        onDeleteModule(module.id);
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
                          onClick={() => onAddLesson(module.id)}
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
                                onClick={() => onEditLesson(module.id, lesson)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onDeleteLesson(module.id, lesson.id)}
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
              <Button variant="outline" onClick={onAddModule}>
                <Plus className="mr-2 h-4 w-4" /> Add Module
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
