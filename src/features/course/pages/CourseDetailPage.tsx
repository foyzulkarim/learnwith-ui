import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Clock, MessageSquare, Star, Globe, Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import LessonList from "../components/LessonList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useAuth } from "../../auth/context/AuthContext";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = parseInt(params.courseId || "0", 10);
  const [lessonId, setLessonId] = useState<number | undefined>(undefined);
  const { isLoggedIn } = useAuth();

  const { data: course, isLoading: isLoadingCourse } = useQuery<any>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  const { data: lessons } = useQuery<any[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });

  if (isLoadingCourse) {
    return <div className="py-10 bg-white">Loading...</div>;
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
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/courses" className="text-primary hover:text-secondary inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
          </Link>
        </div>
        <div className="bg-gray-900 text-white p-8 rounded-t-lg mb-0">
          <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
          <p className="text-xl mb-4">{course.description || "Master key concepts and techniques with this comprehensive course"}</p>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {course.bestseller && (
              <Badge className="bg-yellow-500 text-black border-yellow-400 font-semibold">BESTSELLER</Badge>
            )}
            {course.featured && (
              <Badge className="bg-purple-500 text-white border-purple-400">FEATURED</Badge>
            )}
            {course.isNew && (
              <Badge className="bg-green-500 text-white border-green-400">NEW</Badge>
            )}
            <div className="flex items-center text-yellow-400 ml-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 opacity-60" />
              <span className="ml-2 text-white">(1,245 ratings)</span>
            </div>
            <span className="text-gray-300 ml-2">75,141 students</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-300">Created by</span>
            <Link href="#instructor" className="text-primary ml-2 hover:underline">{course.instructor}</Link>
          </div>
          <div className="flex flex-wrap items-center text-sm text-gray-300 mt-3">
            <div className="flex items-center mr-4">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last updated May 2025</span>
            </div>
            <div className="flex items-center mr-4">
              <Globe className="h-4 w-4 mr-1" />
              <span>English</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>English, Spanish, Arabic captions</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-8/12 lg:pr-8">
            <div className="relative pb-[56.25%] bg-gray-100 rounded-lg mb-6 overflow-hidden">
              <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <h3 className="text-xl font-bold mb-2">Start Learning</h3>
                  <p className="mb-4">Select a lesson from the curriculum to begin</p>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => {
                    if (lessons && lessons.length > 0) {
                      window.location.href = `/course/${courseId}/lesson/${lessons[0].id}`;
                    }
                  }}>
                    Start First Lesson
                  </Button>
                </div>
              </div>
            </div>
            {/* Course overview content */}
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
                    <span>{course.totalDuration || "6 hours"} of content</span>
                  </div>
                  <div className="flex items-center">
                    <span>Certificate on completion</span>
                  </div>
                  <div className="flex items-center">
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
          </div>
          <div className="lg:w-4/12">
            <LessonList courseId={courseId} currentLessonId={lessonId} isLocked={!isLoggedIn} />
          </div>
        </div>
      </div>
    </section>
  );
} 
