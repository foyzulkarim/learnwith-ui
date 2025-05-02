import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-primary to-secondary py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 md:pr-10 mb-8 md:mb-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Continue your learning journey
            </h1>
            <p className="text-lg text-white/90 mb-6">
              Access your courses, track your progress, and achieve your educational goals with our comprehensive learning platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="#my-courses">
                <Button className="bg-white text-primary font-medium rounded-lg px-6 py-3 text-center shadow hover:bg-gray-50 transition-colors w-full sm:w-auto">
                  My Courses
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="bg-transparent text-white border border-white font-medium rounded-lg px-6 py-3 text-center hover:bg-white/10 transition-colors w-full sm:w-auto">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Students learning online" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
