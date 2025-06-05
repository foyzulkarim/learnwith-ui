import { useQuery } from "@tanstack/react-query";
import MyCourses from "@/features/course/components/MyCourses";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetcher } from "@/lib/api";

export default function MyCoursesSection() {
  const { isLoggedIn } = useAuth();

  // Check if the user has any enrolled courses
  const { data: hasEnrolledCourses, isLoading } = useQuery<boolean>({
    queryKey: ["/api/enrollments/has-courses"],
    queryFn: async () => {
      const response = await fetcher<any[]>("/api/enrollments/courses?limit=1");
      return response.length > 0;
    },
    enabled: isLoggedIn,
  });

  // If user is not logged in, don't show anything
  if (!isLoggedIn) {
    return null;
  }

  return (
    <section className="py-10" id="my-courses">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-10">
          <h2 className="text-2xl font-bold mb-6">My Courses</h2>
          {hasEnrolledCourses ? (
            <p className="text-gray-600 mb-8">Continue your learning journey with these enrolled courses</p>
          ) : (
            <p className="text-gray-600 mb-8">You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.</p>
          )}
          <MyCourses />
        </div>
      </div>
    </section>
  );
}
