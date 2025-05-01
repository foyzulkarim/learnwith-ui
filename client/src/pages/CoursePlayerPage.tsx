import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, Share2, Clock, MessageSquare, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import VideoPlayer from "@/components/VideoPlayer";
import LessonList from "@/components/LessonList";
import { Course, Lesson, QuizQuestion, Note } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CoursePlayerPage() {
  // Get parameters from URL using the useParams hook from wouter
  const params = useParams();
  
  // Extract courseId from either the /course/:courseId or /course/:courseId/lesson/:lessonId routes
  const courseIdStr = params.courseId || params.id;
  const lessonIdStr = params.lessonId;
  
  // Parse the IDs ensuring we get valid numbers
  const courseId = parseInt(courseIdStr || "0", 10);
  const [lessonId, setLessonId] = useState(lessonIdStr ? parseInt(lessonIdStr, 10) : undefined);
  const [activeTab, setActiveTab] = useState("overview");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [noteContent, setNoteContent] = useState("");
  
  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  
  // Fetch current lesson if provided, otherwise fetch first lesson
  const { data: lessons, isLoading: isLoadingLessons } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });

  // Get current lesson data
  const { data: currentLesson } = useQuery<Lesson>({
    queryKey: [`/api/lessons/${lessonId}`],
    enabled: !!lessonId,
  });

  // Get quiz questions for the current lesson
  const { data: quizQuestions } = useQuery<QuizQuestion[]>({
    queryKey: [`/api/lessons/${lessonId}/quiz`],
    enabled: !!lessonId,
  });

  // Get user note for the current lesson
  const { data: note } = useQuery<Note>({
    queryKey: [`/api/lessons/${lessonId}/note`],
    enabled: !!lessonId,
  });

  // Mutation to save note
  const saveNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/lessons/${lessonId}/note`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lessons/${lessonId}/note`] });
    },
  });

  // Mutation to check quiz answers
  const checkQuizAnswersMutation = useMutation({
    mutationFn: async (answers: Record<number, string>) => {
      return apiRequest("POST", `/api/lessons/${lessonId}/quiz/check`, { answers });
    },
  });

  // If no lessonId is provided, use the first lesson from the course
  useEffect(() => {
    if (!lessonId && lessons && lessons.length > 0) {
      setLessonId(lessons[0].id);
    }
  }, [lessonId, lessons]);

  // Initialize note content when note data loads
  useEffect(() => {
    if (note) {
      setNoteContent(note.content);
    } else {
      setNoteContent("");
    }
  }, [note]);

  const handleSaveNote = () => {
    if (lessonId) {
      saveNoteMutation.mutate(noteContent);
    }
  };

  const handleCheckAnswers = () => {
    if (quizQuestions && quizQuestions.length > 0) {
      checkQuizAnswersMutation.mutate(quizAnswers);
    }
  };

  // Course overview content when no lesson is selected or available
  const renderCourseOverview = () => {
    if (!course) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Course Overview</h2>
        <p className="text-gray-700 mb-6">{course.description}</p>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">What you'll learn</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Core concepts and fundamentals of {course.title}</li>
            <li>Practical skills for real-world applications</li>
            <li>Best practices and industry standards</li>
            <li>Problem-solving techniques and approaches</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Course includes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-primary mr-2" />
              <span>{course.totalLessons || 12} lessons</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{course.totalDuration || "6 hours"} of content</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Certificate on completion</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <span>Downloadable resources</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">About the instructor</h3>
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={course.instructorAvatar || undefined} alt={course.instructor} />
              <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{course.instructor}</div>
              <div className="text-sm text-gray-500">Expert Instructor</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoadingCourse) {
    return (
      <div className="py-10 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-gray-300 h-[400px] rounded-lg mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for could not be found.</p>
          <Link href="/courses">
            <Button className="bg-primary hover:bg-primary/90">
              Browse All Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate progress
  const totalLessons = lessons?.length || 0;
  const completedLessons = lessons?.filter(lesson => lesson.completed).length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Determine if we're in lesson view or course overview
  const isLessonView = !!currentLesson;

  // If we're in lesson view, use Udemy-style lesson player layout
  if (isLessonView) {
    return (
      <section className="min-h-screen bg-white flex flex-col">
        {/* Top navigation bar */}
        <header className="border-b border-gray-200 py-3 px-4 bg-white flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/courses`} className="text-gray-700 hover:text-primary mr-4">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-lg font-medium">{course.title}</h1>
              <div className="flex items-center text-sm text-gray-500">
                <span>{currentLesson?.title}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-600 hover:text-primary">
              <Share2 className="h-5 w-5" />
            </button>
            <Progress value={progressPercentage} className="w-24 h-2" />
            <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
          </div>
        </header>

        <div className="flex flex-col md:flex-row h-full">
          {/* Main content area */}
          <div className="md:w-2/3 lg:w-3/4">
            {/* Video player area */}
            <div className="bg-black">
              <VideoPlayer 
                videoUrl={currentLesson?.videoUrl || "https://demo-videos.vercel.app/placeholder.mp4"} 
                thumbnailUrl={course.thumbnail}
              />
            </div>
            
            {/* Lesson details area */}
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="border-b border-gray-200 w-full justify-start mb-6">
                  <TabsTrigger value="overview" className="px-6 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Overview
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="px-6 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Notes
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="px-6 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
                    <span className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Resources
                    </span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <h2 className="text-xl font-medium mb-4">Current Lesson: {currentLesson?.title}</h2>
                  <div className="text-gray-700 mb-6">
                    {currentLesson?.content || (
                      <p>
                        In this lesson, you'll learn core concepts that are essential for mastering the subject.
                        Follow along with the video and complete the exercises to reinforce your learning.
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium mb-2">Key Takeaways</h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      <li>Understanding the fundamental principles</li>
                      <li>How to apply these concepts in real-world scenarios</li>
                      <li>Best practices and common pitfalls to avoid</li>
                      <li>Tips for further learning and practice</li>
                    </ul>
                  </div>
                  
                  {/* Quiz section */}
                  {quizQuestions && quizQuestions.length > 0 && (
                    <div className="bg-background rounded-lg p-6 border border-gray-200 mb-6">
                      <h3 className="text-lg font-medium mb-4">Knowledge Check</h3>
                      <p className="mb-6">Test your understanding with this quick quiz.</p>
                      
                      <div className="space-y-4">
                        {quizQuestions.map((question, index) => {
                          // Default quiz options if parsing fails
                          const defaultOptions = ["Option A", "Option B", "Option C", "Option D"];
                          let parsedOptions: string[] = defaultOptions;
                          
                          return (
                            <div key={question.id}>
                              <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                              <RadioGroup 
                                value={quizAnswers[question.id] || ""} 
                                onValueChange={(value) => setQuizAnswers({...quizAnswers, [question.id]: value})}
                              >
                                <div className="space-y-2">
                                  {parsedOptions.map((option, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option.toString()} id={`q${question.id}-opt${i}`} />
                                      <Label htmlFor={`q${question.id}-opt${i}`}>{option.toString()}</Label>
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Button 
                        className="mt-6 bg-primary hover:bg-primary/90"
                        onClick={handleCheckAnswers}
                        disabled={checkQuizAnswersMutation.isPending}
                      >
                        {checkQuizAnswersMutation.isPending ? "Checking..." : "Check Answers"}
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="notes">
                  <h3 className="text-lg font-medium mb-4">Your Notes</h3>
                  <Textarea 
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                    placeholder="Add your notes for this lesson here..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                  <Button 
                    variant="secondary" 
                    className="mt-3 bg-gray-100 hover:bg-gray-200 text-foreground"
                    onClick={handleSaveNote}
                    disabled={saveNoteMutation.isPending}
                  >
                    {saveNoteMutation.isPending ? "Saving..." : "Save Notes"}
                  </Button>
                </TabsContent>
                
                <TabsContent value="resources">
                  <h3 className="text-lg font-medium mb-4">Course Resources</h3>
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <p className="text-gray-700 mb-4">
                      Access additional materials to enhance your learning experience.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center text-primary hover:text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                          <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                        <a href="#" className="hover:underline">Course slides (PDF)</a>
                      </li>
                      <li className="flex items-center text-primary hover:text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <a href="#" className="hover:underline">Exercise files</a>
                      </li>
                      <li className="flex items-center text-primary hover:text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <a href="#" className="hover:underline">Reference guide</a>
                      </li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Sidebar with course content */}
          <div className="md:w-1/3 lg:w-1/4 border-l border-gray-200">
            <LessonList 
              courseId={courseId}
              currentLessonId={lessonId}
            />
          </div>
        </div>
      </section>
    );
  }

  // Course overview page (when no lesson is selected)
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/courses" className="text-primary hover:text-secondary inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
          </Link>
        </div>
        
        {/* Course header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {course.totalLessons || 0} lessons
            </Badge>
            {course.featured && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Featured
              </Badge>
            )}
            {course.bestseller && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Bestseller
              </Badge>
            )}
            {course.isNew && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                New
              </Badge>
            )}
          </div>
          
          <div className="flex items-center mb-4">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={course.instructorAvatar || undefined} alt={course.instructor} />
              <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium mr-6">{course.instructor}</span>
            
            {course.rating && (
              <div className="flex items-center mr-6">
                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="text-sm font-medium">{course.rating}</span>
              </div>
            )}
            
            <div className="text-sm flex items-center">
              <span className="mr-2">Progress:</span>
              <Progress value={progressPercentage} className="w-20 h-2" />
              <span className="ml-2">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Main content area */}
          <div className="lg:w-8/12 lg:pr-8">
            {/* Course thumbnail image */}
            <div className="relative pb-[56.25%] bg-gray-100 rounded-lg mb-6 overflow-hidden">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <h3 className="text-xl font-bold mb-2">Start Learning</h3>
                  <p className="mb-4">Select a lesson from the curriculum to begin</p>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      if (lessons && lessons.length > 0) {
                        setLessonId(lessons[0].id);
                      }
                    }}
                  >
                    Start First Lesson
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Course overview content */}
            {renderCourseOverview()}
          </div>
          
          {/* Course content sidebar */}
          <div className="lg:w-4/12">
            <LessonList 
              courseId={courseId}
              currentLessonId={lessonId}
            />
          </div>
        </div>
      </div>
    </section>
  );
}