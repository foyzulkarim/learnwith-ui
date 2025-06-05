import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen } from "lucide-react";
import { fetcher } from "@/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";

interface CourseLesson {
  lessonId: string;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  watchDuration: number;
  notes?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  bookmarked?: boolean;
}

// Updated interface to match the API response format
interface EnrolledCourse {
  _id: string;
  title: string;
  thumbnailUrl: string;
  instructor: string;
  totalLessons: number;
  enrolledAt: string;
  lastAccessedAt: string;
  lastWatchedLessonId?: string | null;
  completedLessons: number;
  progress: number;
  lessons?: Record<string, CourseLesson>;
  notes?: string;
  rating?: number;
  feedback?: string;
}

export default function MyCourses() {
  const { isLoggedIn } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);

  // Fetch enrolled courses only if the user is logged in
  const { data: userCourses, isLoading } = useQuery({
    queryKey: ["/api/enrollments/courses"],
    queryFn: () => fetcher<EnrolledCourse[]>("/api/enrollments/courses"),
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (userCourses) {
      setEnrolledCourses(userCourses);
    }
  }, [userCourses]);

  if (!isLoggedIn) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Sign in to see your courses</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Track your progress and continue learning where you left off
        </p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-40 bg-gray-200 animate-pulse"></div>
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mt-4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg p-8 bg-gray-50">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium">No Enrolled Courses</h3>
        <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">
          You haven't enrolled in any courses yet. Browse our catalog to discover courses that match your interests and learning goals.
        </p>
        <Link href="/courses">
          <Button size="lg">Browse Course Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {enrolledCourses.map((course) => {
        // Check if this is a valid course with the necessary data
        if (!course._id) return null;

        // Determine whether to link to the course detail or resume learning
        let courseUrl = `/course/${course._id}`;
        
        // If there's a last watched lesson, try to construct the proper URL
        if (course.lastWatchedLessonId) {
          // We need to find the moduleId for this lesson
          // For now, we'll just link to the course detail page which will handle the redirection
          courseUrl = `/course/${course._id}`;
        }

        // Format the last accessed date
        const lastAccessed = new Date(course.lastAccessedAt);
        const lastAccessedFormatted = `${lastAccessed.toLocaleDateString()}`;

        return (
          <Card key={course._id} className="overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              <img 
                src={course.thumbnailUrl || "https://via.placeholder.com/400x225?text=Course"} 
                alt={course.title} 
                className="w-full h-full object-cover" 
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
              
              {/* Progress information */}
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {course.completedLessons}/{course.totalLessons} lessons
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {lastAccessedFormatted}
                </span>
              </div>
              
              {/* Progress bar */}
              <Progress value={course.progress} className="h-2 mb-4" />
              
              <Link href={courseUrl}>
                <Button className="w-full">
                  {course.progress > 0 ? "Continue Learning" : "Start Learning"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
