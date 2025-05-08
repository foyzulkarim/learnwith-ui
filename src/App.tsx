import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/HomePage";
import CoursesPage from "@/pages/CoursesPage";
import CoursePlayerPage from "@/pages/CoursePlayerPage";
import ProfilePage from "@/pages/ProfilePage";
import FAQPage from "@/pages/FAQPage";
import CreatorDashboardPage from "@/pages/CreatorDashboardPage";
import CourseStudentsPage from "@/pages/CourseStudentsPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
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
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
