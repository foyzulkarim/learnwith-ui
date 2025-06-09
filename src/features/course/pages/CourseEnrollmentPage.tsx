
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Clock, Star, Users, CheckCircle, Globe, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useAuth } from "../../auth/context/AuthContext";
import { fetcher } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Course {
  _id?: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructor: string;
  instructorAvatar?: string;
  categoryId: number;
  category?: string;
  bestseller?: boolean;
  featured?: boolean;
  isNew?: boolean;
  totalLessons: number;
  totalDuration?: string;
  lastUpdated?: string;
  language?: string;
  price?: string;
  rating?: string;
  studentCount?: number;
  difficulty?: string;
  requirements?: string[];
  whatYouWillLearn?: string[];
  targetAudience?: string[];
  isEnrolled?: boolean;
}

interface EnrollmentData {
  courseId: string;
  userId?: string;
}

interface EnrollmentResponse {
  enrolled: boolean;
  enrolledAt: string;
  lastAccessedAt: string;
  lastWatchedLessonId: string | null;
  completedLessons: number;
  progress: number;
  course: {
    _id: string;
    title: string;
    thumbnailUrl: string;
    totalLessons: number;
  };
}

export default function CourseEnrollmentPage() {
  const params = useParams();
  const courseId = params.courseId || "";
  const [, setLocation] = useLocation();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { isLoggedIn, isLocalDev } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const effectiveIsLoggedIn = isLoggedIn || isLocalDev;

  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    queryFn: () => fetcher<Course>(`/api/courses/${courseId}`),
    enabled: !!courseId,
  });

  const enrollMutation = useMutation({
    mutationFn: async (): Promise<EnrollmentResponse> => {
      return fetcher<EnrollmentResponse>(`/api/enrollments/courses/${courseId}`, {
        method: 'POST',
        body: JSON.stringify({}), // Empty object to satisfy content-type requirement
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Enrollment Successful!",
        description: `You have been enrolled in ${data.course?.title || 'the course'}. Redirecting to course page...`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/enrollments/courses/${courseId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/courses"] });
      
      // Redirect to course detail page after a short delay
      setTimeout(() => {
        setLocation(`/course/${courseId}`);
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : "An error occurred during enrollment",
        variant: "destructive",
      });
      setIsEnrolling(false);
    },
  });

  const handleEnrollment = async () => {
    if (!effectiveIsLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to enroll in this course",
        variant: "destructive",
      });
      return;
    }

    setIsEnrolling(true);
    enrollMutation.mutate();
  };

  if (isLoadingCourse) {
    return (
      <div className="py-10 bg-gray-50 min-h-screen">
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
      <div className="py-16 bg-white text-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-gray-600 mb-6">The course you're looking for could not be found.</p>
        <Link href="/courses">
          <Button className="bg-primary hover:bg-primary/90">Browse All Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/courses" className="text-primary hover:text-secondary inline-flex items-center mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {course.bestseller && (
                    <Badge className="bg-yellow-500 text-black">BESTSELLER</Badge>
                  )}
                  {course.featured && (
                    <Badge className="bg-purple-500">FEATURED</Badge>
                  )}
                  {course.isNew && (
                    <Badge className="bg-green-500">NEW</Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-gray-600 text-lg mb-4">{course.description}</p>
                
                {/* Rating and Stats */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {course.rating && (
                    <div className="flex items-center">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium mr-1">{course.rating}</span>
                      <span className="text-gray-500">({course.studentCount || 0} students)</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.studentCount?.toLocaleString() || "0"} enrolled</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-4 w-4 mr-1" />
                    <span>{course.language || "Bengali"}</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                    <AvatarFallback>{course.instructor?.charAt(0).toUpperCase() || "I"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-500">Created by</p>
                    <p className="font-medium text-primary">{course.instructor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Preview */}
            <Card>
              <CardContent className="p-0">
                <div className="relative pb-[56.25%] bg-gray-100 overflow-hidden">
                  <img 
                    src={course.thumbnailUrl || "https://via.placeholder.com/800x450?text=Course+Preview"} 
                    alt={course.title} 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-xl font-bold mb-2">Course Preview</h3>
                      <p>Get a glimpse of what you'll learn</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  What you'll learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(course.whatYouWillLearn || [
                    `Master the fundamentals of ${course.title}`,
                    "Apply practical skills in real-world scenarios",
                    "Build confidence through hands-on projects",
                    "Understand industry best practices"
                  ]).map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(course.requirements || [
                    "Basic computer literacy",
                    "Access to a computer with internet connection",
                    "Willingness to learn and practice"
                  ]).map((requirement, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
              <CardHeader>
                <CardTitle>Who this course is for</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(course.targetAudience || [
                    "Beginners looking to get started",
                    "Professionals wanting to expand their skills",
                    "Students seeking practical knowledge"
                  ]).map((audience, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {audience}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {course.price ? (
                    <div>
                      <span className="text-3xl font-bold">${course.price}</span>
                      <p className="text-gray-500 mt-1">One-time payment</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-green-600">FREE</span>
                      <p className="text-gray-500 mt-1">No cost to enroll</p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleEnrollment}
                  disabled={isEnrolling || course.isEnrolled}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 mb-4"
                  size="lg"
                >
                  {isEnrolling ? (
                    "Enrolling..."
                  ) : course.isEnrolled ? (
                    "Already Enrolled"
                  ) : (
                    "Enroll Now"
                  )}
                </Button>

                {!effectiveIsLoggedIn && (
                  <p className="text-sm text-gray-500 text-center mb-4">
                    <Link href="/login" className="text-primary hover:underline">
                      Log in
                    </Link> to enroll in this course
                  </p>
                )}

                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500">30-day money-back guarantee</p>
                </div>

                <Separator className="my-4" />

                {/* Course Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Lessons
                    </span>
                    <span className="font-medium">{course.totalLessons}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Duration
                    </span>
                    <span className="font-medium">{course.totalDuration || "6 hours"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <Award className="h-4 w-4 mr-2" />
                      Level
                    </span>
                    <span className="font-medium">{course.difficulty || "Beginner"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      Language
                    </span>
                    <span className="font-medium">{course.language || "Bengali"}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Full lifetime access
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Access on mobile and desktop
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Certificate of completion
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    AI Assistant support
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
