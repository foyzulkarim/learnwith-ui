import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/HomePage";
import CoursesPage from "@/pages/CoursesPage";
import CoursePlayerPage from "@/pages/CoursePlayerPage";
import ProfilePage from "@/pages/ProfilePage";
import FAQPage from "@/pages/FAQPage";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/courses" component={CoursesPage} />
          <Route path="/course/:courseId/lesson/:lessonId" component={CoursePlayerPage} />
          <Route path="/course/:courseId" component={CoursePlayerPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/faq" component={FAQPage} />
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
