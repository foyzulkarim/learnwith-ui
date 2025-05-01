import { useState, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Settings,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCreationForm from "@/components/CourseCreationForm";

// Define the course type
interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  instructorAvatar?: string;
  categoryId: number;
  price?: string;
  rating?: string;
  published?: boolean;
  studentCount?: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
}

// Component to display course grid with fetched data
function CoursesGrid() {
  // Fetch courses from the API
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
            <Skeleton className="w-full md:w-48 h-32 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-16 w-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load courses. Please try again later.</div>;
  }

  if (!courses || courses?.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
        <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
        <Link href="/creator-dashboard/create-course">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Course
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses?.map((course: Course) => (
        <div key={course.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
          <img 
            src={course.thumbnail || "https://placehold.co/400x300?text=Course+Thumbnail"} 
            alt={`${course.title} thumbnail`} 
            className="w-full md:w-48 h-32 object-cover rounded-md"
          />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg font-bold">{course.title}</h3>
              <div className="flex items-center gap-2 text-sm">
                {course.published ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Published</span>
                ) : (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Draft</span>
                )}
                {course.studentCount && (
                  <span className="text-gray-500">{course.studentCount} students</span>
                )}
              </div>
            </div>
            <p className="text-gray-600 mt-2">{course.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button 
                onClick={() => {
                  // Set active tab to "create" and navigate with the course ID as a parameter
                  setActiveTab("create");
                  window.history.pushState(null, "", `/creator-dashboard/create-course?id=${course.id}`);
                }}
                className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Edit
              </button>
              <Link href={`/creator-dashboard/courses/${course.id}/curriculum`}>
                <button className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                  Curriculum
                </button>
              </Link>
              <Link href={`/course-player/${course.id}`}>
                <button className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                  Preview
                </button>
              </Link>
              {course.published ? (
                <button className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50">
                  Unpublish
                </button>
              ) : (
                <button className="text-sm px-3 py-1 border border-green-300 text-green-600 rounded-md hover:bg-green-50">
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CreatorDashboardPage() {
  const [location] = useLocation();
  // Use the path to determine which tab is active
  const path = location.split('/creator-dashboard')[1] || '';
  const [activeTab, setActiveTab] = useState(
    path === "/courses" ? "courses" : 
    path === "/create-course" ? "create" : 
    path === "/settings" ? "settings" : "dashboard"
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Navigate to the appropriate path
    let newPath = "/creator-dashboard";
    if (value === "courses") newPath += "/courses";
    else if (value === "create") newPath += "/create-course";
    else if (value === "settings") newPath += "/settings";
    window.history.pushState(null, "", newPath);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Creator Tools</CardTitle>
                <CardDescription>
                  Create and manage your courses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  orientation="vertical"
                  className="h-full"
                >
                  <TabsList className="flex flex-col items-start rounded-none border-r w-full h-full space-y-1 bg-transparent p-0">
                    <TabsTrigger 
                      value="dashboard" 
                      className="flex items-center justify-start gap-2 w-full rounded-none border-l-2 border-transparent px-4 py-2 text-base data-[state=active]:border-l-2 data-[state=active]:border-primary"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger 
                      value="courses"
                      className="flex items-center justify-start gap-2 w-full rounded-none border-l-2 border-transparent px-4 py-2 text-base data-[state=active]:border-l-2 data-[state=active]:border-primary"
                    >
                      <BookOpen className="h-5 w-5" />
                      My Courses
                    </TabsTrigger>
                    <TabsTrigger 
                      value="create"
                      className="flex items-center justify-start gap-2 w-full rounded-none border-l-2 border-transparent px-4 py-2 text-base data-[state=active]:border-l-2 data-[state=active]:border-primary"
                    >
                      <PlusCircle className="h-5 w-5" />
                      Create New Course
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings"
                      className="flex items-center justify-start gap-2 w-full rounded-none border-l-2 border-transparent px-4 py-2 text-base data-[state=active]:border-l-2 data-[state=active]:border-primary"
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <Tabs 
              value={activeTab} 
              onValueChange={handleTabChange} 
              className="w-full"
            >
              <TabsContent value="dashboard" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>
                      View your course statistics and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold mb-2">Total Courses</h3>
                        <p className="text-3xl font-bold">5</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold mb-2">Total Students</h3>
                        <p className="text-3xl font-bold">128</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                        <p className="text-3xl font-bold">$1,280</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">New enrollment in "Advanced JavaScript"</p>
                          <p className="text-sm text-gray-500">2 hours ago</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">New review (4.5★) for "React Fundamentals"</p>
                          <p className="text-sm text-gray-500">5 hours ago</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Course "Vue.js for Beginners" published</p>
                          <p className="text-sm text-gray-500">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="mt-0">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>My Courses</CardTitle>
                      <CardDescription>
                        Manage your existing courses
                      </CardDescription>
                    </div>
                    <Link href="/creator-dashboard/create-course">
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Course
                      </button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <CoursesGrid />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="create" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Course</CardTitle>
                    <CardDescription>
                      Fill in the details to create your new course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CourseCreationForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Creator Settings</CardTitle>
                    <CardDescription>
                      Manage your creator profile and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Profile Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="display_name" className="text-sm font-medium">Display Name</label>
                            <input
                              id="display_name"
                              type="text"
                              defaultValue="Alex Morgan"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                              id="email"
                              type="email"
                              defaultValue="alex.morgan@example.com"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                            <textarea
                              id="bio"
                              rows={4}
                              defaultValue="Web developer and educator with 10+ years of experience in JavaScript, React, and modern web technologies."
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Payment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="payment_method" className="text-sm font-medium">Payment Method</label>
                            <select
                              id="payment_method"
                              className="w-full px-3 py-2 border rounded-md"
                              defaultValue="paypal"
                            >
                              <option value="paypal">PayPal</option>
                              <option value="bank">Bank Transfer</option>
                              <option value="stripe">Stripe</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="account_email" className="text-sm font-medium">Account Email</label>
                            <input
                              id="account_email"
                              type="email"
                              defaultValue="payments.alex@example.com"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Notification Preferences</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              id="notify_enrollments"
                              type="checkbox"
                              defaultChecked
                            />
                            <label htmlFor="notify_enrollments" className="text-sm">Email me when someone enrolls in my course</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              id="notify_reviews"
                              type="checkbox"
                              defaultChecked
                            />
                            <label htmlFor="notify_reviews" className="text-sm">Email me when I receive a new review</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              id="notify_messages"
                              type="checkbox"
                              defaultChecked
                            />
                            <label htmlFor="notify_messages" className="text-sm">Email me when I receive a new message</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              id="notify_marketing"
                              type="checkbox"
                            />
                            <label htmlFor="notify_marketing" className="text-sm">Send me marketing and promotional emails</label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Save Settings
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}