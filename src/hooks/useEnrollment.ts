import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface EnrollmentStatus {
  isEnrolled: boolean;
  progress?: number;
  lastWatchedLessonId?: string;
  completedLessons?: number;
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

export function useEnrollment(courseId: string) {
  const { isLoggedIn, isLocalDev } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const effectiveIsLoggedIn = isLoggedIn || isLocalDev;

  // Check enrollment status
  const { data: enrollmentStatus, isLoading } = useQuery<EnrollmentStatus>({
    queryKey: [`/api/enrollments/courses/${courseId}`],
    queryFn: async () => {
      try {
        const response = await fetcher<any>(`/api/enrollments/courses/${courseId}`);
        return {
          isEnrolled: response.enrolled || false,
          progress: response.progress || 0,
          lastWatchedLessonId: response.lastWatchedLessonId,
          completedLessons: response.completedLessons || 0,
        };
      } catch (error) {
        // If user is not enrolled or there's an error, return not enrolled
        return {
          isEnrolled: false,
          progress: 0,
          completedLessons: 0,
        };
      }
    },
    enabled: !!courseId && effectiveIsLoggedIn,
  });

  // Enroll mutation
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
        description: `You have been enrolled in ${data.course.title} successfully.`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/enrollments/courses/${courseId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/courses"] });
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : "An error occurred during enrollment",
        variant: "destructive",
      });
    },
  });

  const enroll = () => {
    if (!effectiveIsLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to enroll in this course",
        variant: "destructive",
      });
      return;
    }
    enrollMutation.mutate();
  };

  return {
    isEnrolled: enrollmentStatus?.isEnrolled || false,
    progress: enrollmentStatus?.progress || 0,
    lastWatchedLessonId: enrollmentStatus?.lastWatchedLessonId,
    completedLessons: enrollmentStatus?.completedLessons || 0,
    isLoading,
    isEnrolling: enrollMutation.isPending,
    enroll,
    isLoggedIn: effectiveIsLoggedIn,
  };
} 
