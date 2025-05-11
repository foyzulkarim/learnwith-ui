import { useEffect } from "react";
import HeroSection from "../components/HeroSection";
import ProgressSection from "../components/ProgressSection";
import CourseGrid from "../../course/components/CourseGrid";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { DataTestComponent } from "../components/DataTestComponent";

export default function HomePage() {
  // Check if user is authenticated
  const { data: isAuthenticated } = useQuery<boolean>({
    queryKey: ["/api/auth/check"],
  });

  // Prefetch categories for better UX
  useEffect(() => {
    // Prefetch categories to have them ready for the CourseGrid component
    void queryClient.prefetchQuery({
      queryKey: ["/api/categories"],
    });
  }, []);

  return (
    <>
      <HeroSection />
      
      {isAuthenticated && <ProgressSection />}
      
      {/* Direct data test component */}
      <section className="py-10 bg-gray-50" id="direct-data-test">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Direct Mock Data Test</h2>
          <DataTestComponent />
        </div>
      </section>
      
      <section className="py-10" id="explorer">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <CourseGrid
            title="Course Library"
            limit={8}
          />
        </div>
      </section>
    </>
  );
}
