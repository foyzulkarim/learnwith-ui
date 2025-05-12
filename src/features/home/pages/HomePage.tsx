import { useEffect } from "react";
import HeroSection from "../components/HeroSection";
import ProgressSection from "../components/ProgressSection";
import CourseGrid from "../../course/components/CourseGrid";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { fetcher } from "@/lib/api";

// Define the User type based on backend response
interface User {
  id: string;
  email: string;
  name: string | null;
  googleId: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  // Check if user is authenticated by fetching user profile
  const { data: user, isSuccess } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: () => fetcher<User>("/api/auth/me"),
    retry: false,
  });
  const isAuthenticated = isSuccess && !!user && !!user.id;

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
