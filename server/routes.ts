import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

  // AUTH ROUTES
  app.get(`${apiPrefix}/auth/check`, async (req, res) => {
    try {
      // For demo purposes, always return authenticated
      return res.json(true);
    } catch (error) {
      console.error("Error checking auth:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // CATEGORIES ROUTES
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      return res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // COURSES ROUTES
  app.get(`${apiPrefix}/courses`, async (req, res) => {
    try {
      const { search, categoryId, limit } = req.query;
      const courses = await storage.getCourses({
        search: search as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });
      return res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/courses/in-progress`, async (req, res) => {
    try {
      const { limit } = req.query;
      const courses = await storage.getInProgressCourses({
        limit: limit ? parseInt(limit as string) : undefined
      });
      return res.json(courses);
    } catch (error) {
      console.error("Error fetching in-progress courses:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/courses/has-in-progress`, async (req, res) => {
    try {
      const hasInProgress = await storage.hasInProgressCourses();
      return res.json(hasInProgress);
    } catch (error) {
      console.error("Error checking in-progress courses:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/courses/:id`, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourseById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      return res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/courses/:id/modules`, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const modules = await storage.getCourseModules(courseId);
      return res.json(modules);
    } catch (error) {
      console.error("Error fetching course modules:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/courses/:id/lessons`, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessons = await storage.getCourseLessons(courseId);
      return res.json(lessons);
    } catch (error) {
      console.error("Error fetching course lessons:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // LESSONS ROUTES
  app.get(`${apiPrefix}/lessons/:id`, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLessonById(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      return res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/lessons/:id/quiz`, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const quiz = await storage.getLessonQuiz(lessonId);
      return res.json(quiz);
    } catch (error) {
      console.error("Error fetching lesson quiz:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/lessons/:id/quiz/check`, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const { answers } = req.body;
      
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ message: "Invalid answers format" });
      }
      
      const results = await storage.checkQuizAnswers(lessonId, answers);
      return res.json(results);
    } catch (error) {
      console.error("Error checking quiz answers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/lessons/:id/note`, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      // Assuming user id 1 for demo
      const userId = 1;
      
      const note = await storage.getLessonNote(lessonId, userId);
      return res.json(note);
    } catch (error) {
      console.error("Error fetching lesson note:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/lessons/:id/note`, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      // Assuming user id 1 for demo
      const userId = 1;
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Note content is required" });
      }
      
      const note = await storage.saveNote(lessonId, userId, content);
      return res.json(note);
    } catch (error) {
      console.error("Error saving note:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // USER ROUTES
  app.get(`${apiPrefix}/users/profile`, async (req, res) => {
    try {
      // Assuming user id 1 for demo
      const userId = 1;
      const user = await storage.getUserProfile(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // COURSE STUDENTS
  app.get(`${apiPrefix}/courses/:id/students`, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Generate mock student data for the specified course
      const students = [
        {
          id: 1,
          name: "John Smith",
          email: "john.smith@example.com",
          progress: 85,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
        {
          id: 2,
          name: "Emily Johnson",
          email: "emily.j@example.com",
          progress: 62,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
        {
          id: 3,
          name: "Michael Brown",
          email: "mike.brown@example.com",
          progress: 45,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6 hours ago
        },
        {
          id: 4,
          name: "Sarah Davis",
          email: "sarah.d@example.com",
          progress: 92,
          lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          id: 5,
          name: "Alex Wilson",
          email: "alex.w@example.com",
          progress: 15,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
        },
        {
          id: 6,
          name: "Jessica Taylor",
          email: "jessica.t@example.com",
          progress: 75,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12 hours ago
        },
        {
          id: 7,
          name: "David Martinez",
          email: "david.m@example.com",
          progress: 33,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() // 18 hours ago
        }
      ];
      
      return res.json(students);
    } catch (error) {
      console.error("Error fetching course students:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // CREATOR DASHBOARD ROUTES
  
  // Get instructor courses
  app.get(`${apiPrefix}/creator/courses`, async (req, res) => {
    try {
      // For demo purposes, assume all courses belong to current user
      const instructorName = "Alex Morgan"; // This would come from auth in a real app
      const courses = await storage.getInstructorCourses(instructorName);
      return res.json(courses);
    } catch (error) {
      console.error("Error fetching instructor courses:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new course
  app.post(`${apiPrefix}/creator/courses`, async (req, res) => {
    try {
      const {
        title,
        description,
        thumbnail,
        price,
        categoryId,
        featured,
        bestseller,
        isNew
      } = req.body;
      
      // Validate required fields
      if (!title || !description || !thumbnail || !categoryId) {
        return res.status(400).json({ message: "Missing required course information" });
      }
      
      // Create course with mock instructor data for demo
      const newCourse = await storage.createCourse({
        title,
        description,
        thumbnail,
        instructor: "Alex Morgan",
        instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        price,
        categoryId: parseInt(categoryId as string),
        featured,
        bestseller,
        isNew
      });
      
      return res.status(201).json(newCourse);
    } catch (error) {
      console.error("Error creating course:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update an existing course
  app.put(`${apiPrefix}/creator/courses/:id`, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Check if course exists
      const existingCourse = await storage.getCourseById(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Update the course
      const updatedCourse = await storage.updateCourse(courseId, req.body);
      return res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update course status (publish/unpublish/archive)
  app.put(`${apiPrefix}/creator/courses/:id/status`, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Check if course exists
      const existingCourse = await storage.getCourseById(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Validate status
      if (!status || !['draft', 'published', 'archived'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updateData: any = { status };
      
      // If publishing, set publishedAt date
      if (status === 'published' && (!existingCourse.publishedAt || existingCourse.status !== 'published')) {
        updateData.publishedAt = new Date();
      }
      
      // Update the course status
      const updatedCourse = await storage.updateCourse(courseId, updateData);
      return res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new module
  app.post(`${apiPrefix}/creator/modules`, async (req, res) => {
    try {
      const { title, courseId, order } = req.body;
      
      // Validate required fields
      if (!title || !courseId || order === undefined) {
        return res.status(400).json({ message: "Missing required module information" });
      }
      
      // Create the module
      const newModule = await storage.createModule({
        title,
        courseId: parseInt(courseId as string),
        order: parseInt(order as string)
      });
      
      return res.status(201).json(newModule);
    } catch (error) {
      console.error("Error creating module:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update an existing module
  app.put(`${apiPrefix}/creator/modules/:id`, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      const { title, order } = req.body;
      
      // Update the module
      const updatedModule = await storage.updateModule(moduleId, {
        title,
        order: order !== undefined ? parseInt(order as string) : undefined
      });
      
      return res.json(updatedModule);
    } catch (error) {
      console.error("Error updating module:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a module
  app.delete(`${apiPrefix}/creator/modules/:id`, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      
      // Delete the module and its lessons
      await storage.deleteModule(moduleId);
      
      return res.json({ success: true, message: "Module deleted successfully" });
    } catch (error) {
      console.error("Error deleting module:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new lesson
  app.post(`${apiPrefix}/creator/lessons`, async (req, res) => {
    try {
      const { title, moduleId, courseId, order, videoUrl, duration, content } = req.body;
      
      // Validate required fields
      if (!title || !moduleId || !courseId || order === undefined) {
        return res.status(400).json({ message: "Missing required lesson information" });
      }
      
      // Create the lesson
      const newLesson = await storage.createLesson({
        title,
        moduleId: parseInt(moduleId as string),
        courseId: parseInt(courseId as string),
        order: parseInt(order as string),
        videoUrl,
        duration,
        content
      });
      
      return res.status(201).json(newLesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update an existing lesson
  app.put(`${apiPrefix}/creator/lessons/:id`, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const { title, order, videoUrl, duration, content } = req.body;
      
      // Update the lesson
      const updatedLesson = await storage.updateLesson(lessonId, {
        title,
        order: order !== undefined ? parseInt(order as string) : undefined,
        videoUrl,
        duration,
        content
      });
      
      return res.json(updatedLesson);
    } catch (error) {
      console.error("Error updating lesson:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a lesson
  app.delete(`${apiPrefix}/creator/lessons/:id`, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const { courseId } = req.query;
      
      if (!courseId) {
        return res.status(400).json({ message: "Missing required courseId parameter" });
      }
      
      // Delete the lesson
      await storage.deleteLesson(lessonId, parseInt(courseId as string));
      
      return res.json({ success: true, message: "Lesson deleted successfully" });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
