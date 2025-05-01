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

interface CourseCreationData {
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  instructorAvatar?: string;
  price?: string;
  rating?: string;
  categoryId: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
}

interface ModuleCreationData {
  title: string;
  courseId: number;
  order: number;
}

interface LessonCreationData {
  title: string;
  moduleId: number;
  courseId: number;
  order: number;
  videoUrl?: string;
  duration?: string;
  content?: string;
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
  },

  // CREATOR DASHBOARD METHODS
  async getInstructorCourses(instructorName: string) {
    // For demo, we'll return all courses as if they belong to the logged-in instructor
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  },

  async createCourse(courseData: CourseCreationData) {
    // Create a new course
    const [newCourse] = await db
      .insert(courses)
      .values({
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        instructor: courseData.instructor,
        instructorAvatar: courseData.instructorAvatar,
        price: courseData.price,
        rating: courseData.rating,
        categoryId: courseData.categoryId,
        featured: courseData.featured || false,
        bestseller: courseData.bestseller || false,
        isNew: courseData.isNew || true,
        totalLessons: 0,
        createdAt: new Date(),
      })
      .returning();
      
    return newCourse;
  },

  async updateCourse(courseId: number, courseData: Partial<CourseCreationData>) {
    // Update an existing course
    const [updatedCourse] = await db
      .update(courses)
      .set({
        ...courseData,
        // Don't update createdAt
      })
      .where(eq(courses.id, courseId))
      .returning();
      
    return updatedCourse;
  },

  async createModule(moduleData: ModuleCreationData) {
    // Create a new module
    const [newModule] = await db
      .insert(modules)
      .values({
        title: moduleData.title,
        courseId: moduleData.courseId,
        order: moduleData.order,
        createdAt: new Date(),
      })
      .returning();
      
    return newModule;
  },

  async updateModule(moduleId: number, moduleData: Partial<ModuleCreationData>) {
    // Update an existing module
    const [updatedModule] = await db
      .update(modules)
      .set({
        ...moduleData,
        // Don't update createdAt
      })
      .where(eq(modules.id, moduleId))
      .returning();
      
    return updatedModule;
  },

  async deleteModule(moduleId: number) {
    // First get lessons to delete
    const lessonsToDelete = await db.query.lessons.findMany({
      where: eq(lessons.moduleId, moduleId)
    });
    
    // Delete lessons in this module
    for (const lesson of lessonsToDelete) {
      await db.delete(lessons).where(eq(lessons.id, lesson.id));
    }
    
    // Then delete the module
    await db.delete(modules).where(eq(modules.id, moduleId));
    
    return { success: true };
  },

  async createLesson(lessonData: LessonCreationData) {
    // Create a new lesson
    const [newLesson] = await db
      .insert(lessons)
      .values({
        title: lessonData.title,
        moduleId: lessonData.moduleId,
        courseId: lessonData.courseId,
        order: lessonData.order,
        videoUrl: lessonData.videoUrl,
        duration: lessonData.duration,
        content: lessonData.content,
        completed: false,
        createdAt: new Date(),
      })
      .returning();
      
    // Update course totalLessons
    await db
      .update(courses)
      .set({
        totalLessons: sql`${courses.totalLessons} + 1`
      })
      .where(eq(courses.id, lessonData.courseId));
      
    return newLesson;
  },

  async updateLesson(lessonId: number, lessonData: Partial<LessonCreationData>) {
    // Update an existing lesson
    const [updatedLesson] = await db
      .update(lessons)
      .set({
        ...lessonData,
        // Don't update createdAt
      })
      .where(eq(lessons.id, lessonId))
      .returning();
      
    return updatedLesson;
  },

  async deleteLesson(lessonId: number, courseId: number) {
    // Delete the lesson
    await db.delete(lessons).where(eq(lessons.id, lessonId));
    
    // Update course totalLessons
    await db
      .update(courses)
      .set({
        totalLessons: sql`${courses.totalLessons} - 1`
      })
      .where(eq(courses.id, courseId));
    
    return { success: true };
  }
};
