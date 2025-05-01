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

  const httpServer = createServer(app);
  return httpServer;
}
