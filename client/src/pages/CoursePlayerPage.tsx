import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
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

export default function CoursePlayerPage() {
  const { id: courseIdStr, lessonId: lessonIdStr } = useParams();
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

  if (isLoadingCourse || isLoadingLessons || !course || !lessonId) {
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

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/courses" className="text-primary hover:text-secondary inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Video player and main content */}
          <div className="lg:w-8/12 lg:pr-8">
            {currentLesson?.videoUrl && (
              <VideoPlayer 
                videoUrl={currentLesson.videoUrl} 
                thumbnailUrl={course.thumbnail}
              />
            )}
            
            <div className="mb-10">
              <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
              
              <div className="flex items-center mb-4">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={course.instructorAvatar || undefined} alt={course.instructor} />
                  <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{course.instructor}</span>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="border-b border-gray-200 w-full justify-start">
                  <TabsTrigger value="overview" className="px-4 py-4">Overview</TabsTrigger>
                  <TabsTrigger value="notes" className="px-4 py-4">Notes</TabsTrigger>
                  <TabsTrigger value="resources" className="px-4 py-4">Resources</TabsTrigger>
                  <TabsTrigger value="discussion" className="px-4 py-4">Discussion</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  {currentLesson && (
                    <>
                      <h2 className="text-xl font-medium mb-4">Current Lesson: {currentLesson.title}</h2>
                      <div className="text-gray-700 mb-6">
                        {currentLesson.content || (
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
                              const options = Array.isArray(question.options) 
                                ? question.options 
                                : typeof question.options === 'object' 
                                  ? Object.values(question.options) 
                                  : [];
                              
                              return (
                                <div key={question.id}>
                                  <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                                  <RadioGroup 
                                    value={quizAnswers[question.id] || ""} 
                                    onValueChange={(value) => setQuizAnswers({...quizAnswers, [question.id]: value})}
                                  >
                                    <div className="space-y-2">
                                      {options.map((option, i) => (
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
                    </>
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
                
                <TabsContent value="discussion">
                  <h3 className="text-lg font-medium mb-4">Discussion Forum</h3>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-700 mb-4">
                      Join the conversation with other students and instructors.
                    </p>
                    <Button className="bg-primary hover:bg-primary/90">
                      Go to Forum
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Sidebar with course content */}
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
