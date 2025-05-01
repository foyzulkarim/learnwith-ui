import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (already provided in the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories for courses
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail").notNull(),
  instructor: text("instructor").notNull(),
  instructorAvatar: text("instructor_avatar"),
  price: text("price"),
  rating: text("rating"),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  totalLessons: integer("total_lessons").default(0),
  featured: boolean("featured").default(false),
  bestseller: boolean("bestseller").default(false),
  isNew: boolean("is_new").default(false),
  totalDuration: text("total_duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Modules within courses
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lessons within modules
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  order: integer("order").notNull(),
  videoUrl: text("video_url"),
  duration: text("duration"),
  completed: boolean("completed").default(false),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quiz questions for lessons
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  completedLessons: integer("completed_lessons").default(0),
  lastLessonId: integer("last_lesson_id").references(() => lessons.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// User notes for lessons
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations definitions
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  notes: many(notes),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ many, one }) => ({
  modules: many(modules),
  lessons: many(lessons),
  category: one(categories, { fields: [courses.categoryId], references: [categories.id] }),
  progress: many(userProgress),
}));

export const modulesRelations = relations(modules, ({ many, one }) => ({
  lessons: many(lessons),
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
}));

export const lessonsRelations = relations(lessons, ({ many, one }) => ({
  module: one(modules, { fields: [lessons.moduleId], references: [modules.id] }),
  course: one(courses, { fields: [lessons.courseId], references: [courses.id] }),
  quizQuestions: many(quizQuestions),
  notes: many(notes),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  lesson: one(lessons, { fields: [quizQuestions.lessonId], references: [lessons.id] }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
  course: one(courses, { fields: [userProgress.courseId], references: [courses.id] }),
  lastLesson: one(lessons, { fields: [userProgress.lastLessonId], references: [lessons.id] }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, { fields: [notes.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [notes.lessonId], references: [lessons.id] }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
});

export const insertCategorySchema = createInsertSchema(categories, {
  name: (schema) => schema.min(2, "Category name must be at least 2 characters"),
});

export const insertCourseSchema = createInsertSchema(courses, {
  title: (schema) => schema.min(3, "Course title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

export const insertModuleSchema = createInsertSchema(modules);
export const insertLessonSchema = createInsertSchema(lessons);
export const insertQuizQuestionSchema = createInsertSchema(quizQuestions);
export const insertUserProgressSchema = createInsertSchema(userProgress);
export const insertNoteSchema = createInsertSchema(notes, {
  content: (schema) => schema.min(1, "Note cannot be empty"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
