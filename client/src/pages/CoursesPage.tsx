import { useEffect } from "react";
import { useLocation } from "wouter";
import CourseGrid from "@/components/CourseGrid";
import { queryClient } from "@/lib/queryClient";

export default function CoursesPage() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.split('?')[1] || '');
  const filter = queryParams.get('filter');
  
  // Prefetch categories for better UX
  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: ["/api/categories"],
    });
  }, []);

  return (
    <div className="py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {filter === 'in-progress' ? 'My Courses' : 'Browse All Courses'}
          </h1>
          <p className="text-gray-600">
            {filter === 'in-progress' 
              ? 'View and continue your enrolled courses'
              : 'Discover and explore our extensive library of courses'}
          </p>
        </div>
        
        <CourseGrid
          title={filter === 'in-progress' ? 'Courses In Progress' : 'All Courses'}
          inProgress={filter === 'in-progress'}
        />
      </div>
    </div>
  );
}
