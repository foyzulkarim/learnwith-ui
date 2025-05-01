import { db } from "@db";
import { eq, and, like, desc, sql } from "drizzle-orm";
import {
  users,
  categories,
  courses,
  modules,
  lessons,
  quizQuestions,
  userProgress,
  notes
} from "@shared/schema";

interface CourseFilter {
  search?: string;
  categoryId?: number;
  limit?: number;
}

interface ProgressFilter {
  limit?: number;
}

export const storage = {
  // CATEGORIES
  async getCategories() {
    return await db.query.categories.findMany({
      orderBy: categories.name
    });
  },

  // COURSES
  async getCourses(filter: CourseFilter = {}) {
    let query = db.select().from(courses);

    // Apply filters
    if (filter.search) {
      query = query.where(like(courses.title, `%${filter.search}%`));
    }

    if (filter.categoryId) {
      query = query.where(eq(courses.categoryId, filter.categoryId));
    }

    // Apply limit
    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    // Order by newest
    query = query.orderBy(desc(courses.createdAt));

    return await query;
  },

  async getCourseById(id: number) {
    return await db.query.courses.findFirst({
      where: eq(courses.id, id)
    });
  },

  async getInProgressCourses(filter: ProgressFilter = {}) {
    // For demo, return regular courses as "in progress"
    // In a real app, this would query the userProgress table
    let query = db.select().from(courses);
    
    // Apply limit
    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    
    query = query.orderBy(desc(courses.createdAt));
    
    return await query;
  },

  async hasInProgressCourses() {
    // For demo, always return true
    return true;
  },

  async getCourseModules(courseId: number) {
    return await db.query.modules.findMany({
      where: eq(modules.courseId, courseId),
      orderBy: modules.order
    });
  },

  async getCourseLessons(courseId: number) {
    return await db.query.lessons.findMany({
      where: eq(lessons.courseId, courseId),
      orderBy: [lessons.order]
    });
  },

  // LESSONS
  async getLessonById(id: number) {
    return await db.query.lessons.findFirst({
      where: eq(lessons.id, id)
    });
  },

  async getLessonQuiz(lessonId: number) {
    return await db.query.quizQuestions.findMany({
      where: eq(quizQuestions.lessonId, lessonId)
    });
  },

  async checkQuizAnswers(lessonId: number, answers: Record<number, string>) {
    const questions = await db.query.quizQuestions.findMany({
      where: eq(quizQuestions.lessonId, lessonId)
    });

    const results = questions.map(question => {
      const submittedAnswer = answers[question.id];
      const isCorrect = submittedAnswer === question.correctAnswer;
      
      return {
        questionId: question.id,
        isCorrect,
        correctAnswer: question.correctAnswer
      };
    });

    return {
      allCorrect: results.every(r => r.isCorrect),
      results
    };
  },

  // NOTES
  async getLessonNote(lessonId: number, userId: number) {
    return await db.query.notes.findFirst({
      where: and(
        eq(notes.lessonId, lessonId),
        eq(notes.userId, userId)
      )
    });
  },

  async saveNote(lessonId: number, userId: number, content: string) {
    // Check if note already exists
    const existingNote = await db.query.notes.findFirst({
      where: and(
        eq(notes.lessonId, lessonId),
        eq(notes.userId, userId)
      )
    });

    if (existingNote) {
      // Update existing note
      const [updated] = await db
        .update(notes)
        .set({
          content,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(notes.lessonId, lessonId),
            eq(notes.userId, userId)
          )
        )
        .returning();
      
      return updated;
    } else {
      // Create new note
      const [newNote] = await db
        .insert(notes)
        .values({
          userId,
          lessonId,
          content,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return newNote;
    }
  },

  // USERS
  async getUserProfile(id: number) {
    return await db.query.users.findFirst({
      where: eq(users.id, id)
    });
  }
};
