import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load page components for better code splitting
const HomePage = lazy(() => import("@/pages/HomePage"));
const CoursesPage = lazy(() => import("@/pages/CoursesPage"));
const CoursePlayerPage = lazy(() => import("@/pages/CoursePlayerPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const CreatorDashboardPage = lazy(() => import("@/pages/CreatorDashboardPage"));
const CourseStudentsPage = lazy(() => import("@/pages/CourseStudentsPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for suspense
const Loading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<Loading />}>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/courses" component={CoursesPage} />
            
            {/* Protected routes that require authentication */}
            <ProtectedRoute path="/course/:courseId/lesson/:lessonId">
              <CoursePlayerPage />
            </ProtectedRoute>
            
            <ProtectedRoute path="/course/:courseId">
              <CoursePlayerPage />
            </ProtectedRoute>
            
            <ProtectedRoute path="/courses/:courseId/students">
              <CourseStudentsPage />
            </ProtectedRoute>
            
            <ProtectedRoute path="/profile">
              <ProfilePage />
            </ProtectedRoute>
            
            <ProtectedRoute path="/creator-dashboard">
              <CreatorDashboardPage />
            </ProtectedRoute>
            
            <ProtectedRoute path="/creator-dashboard/:tab">
              <CreatorDashboardPage />
            </ProtectedRoute>
            
            <Route path="/faq" component={FAQPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
