import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Clock, MessageSquare, Star, Globe, Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import LessonList from "../components/LessonList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useAuth } from "../../auth/context/AuthContext";
import { fetcher } from "@/lib/api";

// Define interfaces that match LessonList component's expected types
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

interface CurriculumData {
  modules: Module[];
}

// Interface for enrollment data
interface EnrollmentLesson {
  lessonId: string;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  watchDuration: number;
  notes?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  bookmarked?: boolean;
}

interface Enrollment {
  enrolled: boolean;
  enrolledAt: string;
  lastAccessedAt: string;
  lastWatchedLessonId?: string;
  lessons: Record<string, EnrollmentLesson>;
  completedLessons: number;
  progress: number;
  notes?: string;
  rating?: number;
  feedback?: string;
  course: {
    _id: string;
    title: string;
    thumbnailUrl: string;
    totalLessons: number;
  };
}

interface Course {
  _id?: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructor: string;
  instructorAvatar?: string;
  categoryId: number;
  bestseller?: boolean;
  featured?: boolean;
  isNew?: boolean;
  totalLessons: number;
  totalDuration?: string;
  lastUpdated?: string;
  language?: string;
  captions?: string[];
  studentCount?: number;
  rating?: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId || "";
  const [lessonId, setLessonId] = useState<string | undefined>(undefined);
  const { isLoggedIn } = useAuth();
  const effectiveIsLoggedIn = isLoggedIn;

  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    queryFn: () => fetcher<Course>(`/api/courses/${courseId}`),
    enabled: !!courseId,
    staleTime: 0, // Data is immediately considered stale
    refetchOnMount: 'always', // Always refetch when component mounts
    gcTime: 1000, // Short cache time (1 second)
  });
  
  const { data: curriculumData, isLoading: isLoadingModules } = useQuery<CurriculumData>({
    queryKey: [`/api/courses/${courseId}/curriculum`],
    queryFn: () => fetcher<CurriculumData>(`/api/courses/${courseId}/curriculum`),
    enabled: !!courseId,
    staleTime: 0, // Data is immediately considered stale
    refetchOnMount: 'always', // Always refetch when component mounts  
    gcTime: 1000, // Short cache time (1 second)
  });

  // Fetch enrollment data if user is logged in
  const { data: enrollment, isLoading: isLoadingEnrollment } = useQuery<Enrollment>({
    queryKey: [`/api/enrollments/courses/${courseId}`],
    queryFn: () => fetcher<Enrollment>(`/api/enrollments/courses/${courseId}`),
    enabled: !!courseId && effectiveIsLoggedIn,
    staleTime: 0,
    refetchOnMount: 'always',
    gcTime: 1000,
    // Don't throw error if enrollment doesn't exist (user not enrolled)
    retry: false,
    onError: () => {
      console.log('User not enrolled in this course or error fetching enrollment');
    }
  });

  // Extract modules from curriculum data
  const modules = curriculumData?.modules || [];
  
  // Log curriculum data for debugging
  console.log('Curriculum data:', curriculumData);
  console.log('Enrollment data:', enrollment);

  // Process curriculum data with enrollment information if available
  const processedModules = modules.map(module => {
    // Create a new module object with processed lessons
    return {
      ...module,
      lessons: module.lessons.map(lesson => {
        // Check if this lesson is completed in enrollment data
        const enrollmentLesson = enrollment?.lessons?.[lesson._id];
        const isCompleted = enrollmentLesson?.status === 'completed';
        
        // Return lesson with updated completion status
        return {
          ...lesson,
          isCompleted: isCompleted || false
        };
      })
    };
  });

  // Safely flatten all lessons from all modules
  const allLessons = processedModules.flatMap((module: Module) => 
    (module.lessons || []).map((lesson: Lesson) => ({
      ...lesson,
      moduleId: module._id,
      moduleTitle: module.title
    }))
  );

  console.log('All lessons:', allLessons);

  // Get first lesson for "Start First Lesson" button
  const firstLesson = allLessons.length > 0 ? allLessons.sort((a: Lesson, b: Lesson) => a.order - b.order)[0] : null;
  
  // Get the lesson to resume (if user is enrolled)
  const getResumeLesson = () => {
    if (!enrollment) return firstLesson;
    
    // Sort all lessons by module order and then lesson order
    const sortedLessons = [...allLessons].sort((a, b) => {
      const moduleA = processedModules.find(m => m._id === a.moduleId);
      const moduleB = processedModules.find(m => m._id === b.moduleId);
      
      if (!moduleA || !moduleB) return 0;
      
      // First sort by module order
      if (moduleA.order !== moduleB.order) {
        return moduleA.order - moduleB.order;
      }
      
      // Then by lesson order within module
      return a.order - b.order;
    });
    
    // Find the first uncompleted lesson
    const nextLesson = sortedLessons.find(lesson => !lesson.isCompleted);
    
    // If all lessons are completed, use the last watched lesson
    if (!nextLesson && enrollment.lastWatchedLessonId) {
      const lastWatchedLesson = sortedLessons.find(lesson => 
        lesson._id === enrollment.lastWatchedLessonId
      );
      return lastWatchedLesson || firstLesson;
    }
    
    // Return the next uncompleted lesson or the first lesson if none found
    return nextLesson || firstLesson;
  };
  
  // Determine which lesson to use for the CTA button
  const resumeLesson = enrollment ? getResumeLesson() : firstLesson;
  const isEnrolled = !!enrollment?.enrolled;

  if (isLoadingCourse || isLoadingModules) {
    return (
      <div className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="py-16 bg-white text-center">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-gray-600 mb-6">The course you're looking for could not be found.</p>
        <Link href="/courses">
          <Button className="bg-primary hover:bg-primary/90">Browse All Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <section className="pt-12 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/courses" className="text-primary hover:text-secondary inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
          </Link>
        </div>
        <div className="bg-gray-900 text-white p-10 py-12 rounded-t-lg mb-0">
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl mb-6">{course.description || "Master key concepts and techniques with this comprehensive course"}</p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {course.bestseller && (
              <span className="bg-yellow-500 text-black text-xs font-semibold px-2.5 py-0.5 rounded">BESTSELLER</span>
            )}
            {course.featured && (
              <span className="bg-purple-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded">FEATURED</span>
            )}
            {course.isNew && (
              <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded">NEW</span>
            )}
            {/* <div className="flex items-center text-yellow-400 ml-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 opacity-60" />
              <span className="ml-2 text-white text-md">{course.rating ? `(${course.rating})` : "(1,245 ratings)"}</span>
            </div> */}
            {/* <span className="text-gray-300 ml-2">{course.studentCount?.toLocaleString() || "0"} students</span> */}
          </div>
          <div className="flex items-center mb-4">
            <span className="text-gray-300">Created by</span>
            <Link href="#instructor" className="text-primary ml-2 hover:underline">{course.instructor || "Default Instructor"}</Link>
          </div>
          <div className="flex flex-wrap items-center text-sm text-gray-300 mt-4">
            <div className="flex items-center mr-6">
              <Clock className="h-4 w-4 mr-2" />
              <span>Last updated {course.lastUpdated || "May 2025"}</span>
            </div>
            <div className="flex items-center mr-6">
              <Globe className="h-4 w-4 mr-2" />
              <span>{course.language || "Bengali"}</span>
            </div>
            {/* <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>{course.captions?.join(", ") || "English, Spanish, Arabic captions"}</span>
            </div> */}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row mt-2">
          <div className="lg:w-8/12 lg:pr-10">
            <div className="relative pb-[56.25%] bg-gray-100 rounded-lg mb-8 overflow-hidden shadow-md">
              <img 
                src={course.thumbnailUrl || "https://via.placeholder.com/800x450?text=Course+Thumbnail"} 
                alt={course.title} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <h3 className="text-xl font-bold mb-2">
                    {isEnrolled ? 'Resume Learning' : 'Start Learning'}
                  </h3>
                  <p className="mb-4">
                    {allLessons.length > 0 
                      ? isEnrolled 
                        ? `Continue where you left off (${enrollment.progress.toFixed(0)}% complete)`
                        : "Select a lesson from the curriculum to begin" 
                      : "This course doesn't have any lessons yet"}
                  </p>
                  {effectiveIsLoggedIn ? (
                    <Button 
                      className="bg-primary hover:bg-primary/90" 
                      onClick={() => {
                        if (resumeLesson && resumeLesson._id && resumeLesson.moduleId) {
                          // Use Link navigation instead of direct window.location
                          window.location.href = `/course/${courseId}/module/${resumeLesson.moduleId}/lesson/${resumeLesson._id}`;
                        }
                      }}
                      disabled={!resumeLesson}
                    >
                      {isEnrolled 
                        ? `Resume ${resumeLesson?.title || 'Learning'}`
                        : 'Start First Lesson'}
                    </Button>
                  ) : (
                    <Link href={`/login`}>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Login to Start
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {/* Course overview content */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Course Overview</h2>
              <p className="text-gray-700 mb-8">{course.description}</p>
              {/* <div className="mb-6">
                <h3 className="font-medium mb-2">What you'll learn</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Core concepts and fundamentals of {course.title}</li>
                  <li>Practical skills for real-world applications</li>
                  <li>Best practices and industry standards</li>
                  <li>Problem-solving techniques and approaches</li>
                </ul>
              </div> */}
              {/* <div className="mb-6">
                <h3 className="font-medium mb-2">Course includes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-primary mr-2" />
                    <span>{course.totalLessons || allLessons.length} lessons</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-2" />
                    <span>{course.totalDuration || "6 hours"} of content</span>
                  </div>
                  <div className="flex items-center">
                    <Badge className="h-5 w-5 text-primary mr-2" />
                    <span>Certificate on completion</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowLeft className="h-5 w-5 text-primary mr-2 rotate-180" />
                    <span>Downloadable resources</span>
                  </div>
                </div>
              </div> */}
              <div>
                <h3 className="font-medium mb-2">About the instructor</h3>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                    <AvatarFallback>{course.instructor ? course.instructor.charAt(0).toUpperCase() : "D"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{course.instructor || "Default Instructor"}</div>
                    {/* <div className="text-sm text-gray-500">Expert Instructor</div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-4/12">
            {modules.length > 0 ? (
              <LessonList 
                courseId={courseId}
                modules={processedModules}
                currentLessonId={lessonId}
                isLocked={!effectiveIsLoggedIn}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">Curriculum</h3>
                <p className="text-gray-500">This course doesn't have any content yet.</p>
                <p className="text-gray-500 mt-2">Check back soon for updates!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 
