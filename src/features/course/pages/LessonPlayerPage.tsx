import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, Share2, BookOpen, MessageSquare, ListChecks, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import VideoPlayer from "../components/VideoPlayer";
import LessonList from "../components/LessonList";
import AIAssistant from "../../ai-assistant/components/AIAssistant";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "../../auth/context/AuthContext";

export default function LessonPlayerPage() {
  const params = useParams();
  const courseId = parseInt(params.courseId || "0", 10);
  const lessonId = parseInt(params.lessonId || "0", 10);
  const [activeTab, setActiveTab] = useState("overview");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [noteContent, setNoteContent] = useState("");
  const { isLoggedIn } = useAuth();

  const { data: course } = useQuery<any>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  const { data: lessons } = useQuery<any[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });
  const { data: currentLesson } = useQuery<any>({
    queryKey: [`/api/lessons/${lessonId}`],
    enabled: !!lessonId,
  });
  const { data: quizQuestions } = useQuery<any[]>({
    queryKey: [`/api/lessons/${lessonId}/quiz`],
    enabled: !!lessonId,
  });
  const { data: note } = useQuery<any>({
    queryKey: [`/api/lessons/${lessonId}/note`],
    enabled: !!lessonId,
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/lessons/${lessonId}/note`, { content }, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lessons/${lessonId}/note`] });
    },
  });

  const checkQuizAnswersMutation = useMutation({
    mutationFn: async (answers: Record<number, string>) => {
      return apiRequest(`/api/lessons/${lessonId}/quiz/check`, { answers }, { method: "POST" });
    },
  });

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

  const totalLessons = lessons?.length || 0;
  const completedLessons = lessons?.filter(lesson => lesson.completed).length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (!course || !currentLesson) {
    return <div className="py-10 bg-white text-center">Loading lesson...</div>;
  }

  return (
    <section className="min-h-screen bg-white flex flex-col">
      {/* Top navigation bar */}
      <header className="border-b border-gray-200 py-3 px-4 bg-white flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            href={`/course/${courseId}`} 
            className="flex items-center text-gray-700 hover:text-primary mr-4 border border-gray-200 rounded-md py-1 px-2 hover:bg-gray-50 transition-colors"
            onClick={e => {
              e.preventDefault();
              window.location.href = `/course/${courseId}`;
            }}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1 text-sm">Back to course</span>
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
                    <BookOpen className="h-4 w-4" /> Overview
                  </span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="px-6 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Notes
                  </span>
                </TabsTrigger>
                {isLoggedIn && (
                  <TabsTrigger value="resources" className="px-6 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
                    <span className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4" /> Resources
                    </span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="ai-assistant" className="px-6 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  <span className="flex items-center gap-2">
                    <Bot className="h-4 w-4" /> Ask AI Assistant
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
                        const defaultOptions = ["Option A", "Option B", "Option C", "Option D"];
                        let parsedOptions: string[] = defaultOptions;
                        try {
                          if (question.options) {
                            let optionsArray;
                            if (typeof question.options === 'string') {
                              optionsArray = JSON.parse(question.options);
                            } else if (typeof question.options === 'object') {
                              optionsArray = question.options;
                            }
                            if (Array.isArray(optionsArray) && optionsArray.length > 0) {
                              parsedOptions = optionsArray.map(opt => String(opt));
                            }
                          }
                        } catch (e) {
                          console.error("Error handling quiz options:", e);
                        }
                        return (
                          <div key={question.id}>
                            <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                            <RadioGroup 
                              value={quizAnswers[question.id] || ""} 
                              onValueChange={value => setQuizAnswers({ ...quizAnswers, [question.id]: value })}
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
                      disabled={checkQuizAnswersMutation.isPending || !isLoggedIn}
                    >
                      {checkQuizAnswersMutation.isPending ? "Checking..." : "Check Answers"}
                    </Button>
                    {!isLoggedIn && <div className="text-xs text-red-500 mt-2">Login to check answers</div>}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="notes">
                <h3 className="text-lg font-medium mb-4">Your Notes</h3>
                <Textarea 
                  className="w-full border border-gray-300 rounded-lg p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  placeholder="Add your notes for this lesson here..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  disabled={!isLoggedIn}
                />
                {!isLoggedIn && <div className="text-xs text-red-500 mt-2">Login to take notes</div>}
                <Button 
                  variant="secondary" 
                  className="mt-3 bg-gray-100 hover:bg-gray-200 text-foreground"
                  onClick={handleSaveNote}
                  disabled={saveNoteMutation.isPending || !isLoggedIn}
                >
                  {saveNoteMutation.isPending ? "Saving..." : "Save Notes"}
                </Button>
              </TabsContent>
              {isLoggedIn && (
                <TabsContent value="resources">
                  <h3 className="text-lg font-medium mb-4">Course Resources</h3>
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <p className="text-gray-700 mb-4">
                      Access additional materials to enhance your learning experience.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center text-primary hover:text-secondary">
                        <a href="#" className="hover:underline">Course slides (PDF)</a>
                      </li>
                      <li className="flex items-center text-primary hover:text-secondary">
                        <a href="#" className="hover:underline">Exercise files</a>
                      </li>
                      <li className="flex items-center text-primary hover:text-secondary">
                        <a href="#" className="hover:underline">Reference guide</a>
                      </li>
                    </ul>
                  </div>
                </TabsContent>
              )}
              <TabsContent value="ai-assistant">
                <div className="h-[500px] overflow-hidden">
                  <AIAssistant lessonTitle={currentLesson?.title} disabled={!isLoggedIn} />
                </div>
                {!isLoggedIn && <div className="text-xs text-red-500 mt-2">Login to chat with AI</div>}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {/* Sidebar with course content */}
        <div className="md:w-1/3 lg:w-1/4 border-l border-gray-200">
          <LessonList courseId={courseId} currentLessonId={lessonId} isLocked={!isLoggedIn} />
        </div>
      </div>
    </section>
  );
} 
