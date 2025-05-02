import { useCallback } from 'react';
import { dataProvider } from '../lib/dataProvider';

/**
 * Hook to access application data consistently
 * 
 * This hook provides methods to access data either via API or directly
 * from the data sources, depending on the configuration.
 */
export function useData() {
  // Categories
  const getCategories = useCallback(async () => {
    return await dataProvider.getCategories();
  }, []);
  
  // Courses
  const getCourses = useCallback(async (params?: { 
    limit?: number; 
    search?: string; 
    categoryId?: number 
  }) => {
    return await dataProvider.getCourses(params);
  }, []);
  
  const getInProgressCourses = useCallback(async (params?: { limit?: number }) => {
    return await dataProvider.getInProgressCourses(params);
  }, []);
  
  const hasInProgressCourses = useCallback(async () => {
    return await dataProvider.hasInProgressCourses();
  }, []);
  
  const getCourseById = useCallback(async (id: number) => {
    return await dataProvider.getCourseById(id);
  }, []);
  
  const getCourseModules = useCallback(async (courseId: number) => {
    return await dataProvider.getCourseModules(courseId);
  }, []);
  
  const getCourseLessons = useCallback(async (courseId: number) => {
    return await dataProvider.getCourseLessons(courseId);
  }, []);
  
  const getCourseStudents = useCallback(async (courseId: number) => {
    return await dataProvider.getCourseStudents(courseId);
  }, []);
  
  // Modules
  const getModuleById = useCallback(async (id: number) => {
    return await dataProvider.getModuleById(id);
  }, []);
  
  // Lessons
  const getLessonById = useCallback(async (id: number) => {
    return await dataProvider.getLessonById(id);
  }, []);
  
  const getQuizQuestions = useCallback(async (lessonId: number) => {
    return await dataProvider.getQuizQuestions(lessonId);
  }, []);
  
  const getNotes = useCallback(async (lessonId: number) => {
    return await dataProvider.getNotes(lessonId);
  }, []);
  
  // Auth
  const checkAuth = useCallback(async () => {
    return await dataProvider.checkAuth();
  }, []);
  
  // CRUD operations
  const createCourse = useCallback(async (courseData: any) => {
    return await dataProvider.createCourse(courseData);
  }, []);
  
  const updateCourse = useCallback(async (id: number, data: any) => {
    return await dataProvider.updateCourse(id, data);
  }, []);
  
  const deleteCourse = useCallback(async (id: number) => {
    return await dataProvider.deleteCourse(id);
  }, []);
  
  const createModule = useCallback(async (moduleData: any) => {
    return await dataProvider.createModule(moduleData);
  }, []);
  
  const updateModule = useCallback(async (id: number, data: any) => {
    return await dataProvider.updateModule(id, data);
  }, []);
  
  const deleteModule = useCallback(async (id: number) => {
    return await dataProvider.deleteModule(id);
  }, []);
  
  const createLesson = useCallback(async (lessonData: any) => {
    return await dataProvider.createLesson(lessonData);
  }, []);
  
  const updateLesson = useCallback(async (id: number, data: any) => {
    return await dataProvider.updateLesson(id, data);
  }, []);
  
  const deleteLesson = useCallback(async (id: number) => {
    return await dataProvider.deleteLesson(id);
  }, []);
  
  return {
    // Categories
    getCategories,
    
    // Courses
    getCourses,
    getInProgressCourses,
    hasInProgressCourses,
    getCourseById,
    getCourseModules,
    getCourseLessons,
    getCourseStudents,
    
    // Modules
    getModuleById,
    
    // Lessons
    getLessonById,
    getQuizQuestions,
    getNotes,
    
    // Auth
    checkAuth,
    
    // CRUD operations
    createCourse,
    updateCourse,
    deleteCourse,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson
  };
} 
