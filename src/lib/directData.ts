import {
  mockCategories,
  mockCourses,
  mockModules,
  mockLessons,
  mockQuizQuestions,
  mockNotes,
  mockInProgressCourses,
  mockAuthStatus,
  Course,
  Module,
  Lesson
} from './mockData';

// Direct data access functions that mimic the API structure but directly return the data
// instead of using fetch or mocked responses

export const getCategories = () => {
  return mockCategories;
};

export const getCourses = (params?: { 
  limit?: number; 
  search?: string; 
  categoryId?: number 
}) => {
  let filteredCourses = [...mockCourses];
  
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredCourses = filteredCourses.filter(course => 
      course.title.toLowerCase().includes(searchLower) || 
      course.description.toLowerCase().includes(searchLower)
    );
  }
  
  if (params?.categoryId !== undefined) {
    filteredCourses = filteredCourses.filter(course => course.categoryId === params.categoryId);
  }
  
  if (params?.limit !== undefined) {
    filteredCourses = filteredCourses.slice(0, params.limit);
  }
  
  return filteredCourses;
};

export const getInProgressCourses = (params?: { limit?: number }) => {
  let filteredCourses = [...mockInProgressCourses];
  
  if (params?.limit !== undefined) {
    filteredCourses = filteredCourses.slice(0, params.limit);
  }
  
  return filteredCourses;
};

export const hasInProgressCourses = () => {
  return mockInProgressCourses.length > 0;
};

export const getCourseById = (id: number) => {
  const course = mockCourses.find(c => c.id === id);
  return course || null;
};

export const getCourseModules = (courseId: number) => {
  return mockModules.filter(m => m.courseId === courseId);
};

export const getCourseLessons = (courseId: number) => {
  return mockLessons.filter(l => l.courseId === courseId);
};

export const getCourseStudents = (courseId: number) => {
  // Mock student data for the course
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Student ${i + 1}`,
    email: `student${i + 1}@example.com`,
    progress: Math.floor(Math.random() * 100),
    lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

export const getModuleById = (id: number) => {
  const module = mockModules.find(m => m.id === id);
  return module || null;
};

export const getLessonById = (id: number) => {
  const lesson = mockLessons.find(l => l.id === id);
  return lesson || null;
};

export const getQuizQuestions = (lessonId: number) => {
  return mockQuizQuestions.filter(q => q.lessonId === lessonId);
};

export const getNotes = (lessonId: number) => {
  return mockNotes.filter(n => n.lessonId === lessonId);
};

export const checkAuth = () => {
  return mockAuthStatus;
};

// CRUD operations for courses, modules, and lessons

export const createCourse = (courseData: Omit<Course, 'id'>) => {
  const newId = Math.max(...mockCourses.map(c => c.id)) + 1;
  const newCourse: Course = {
    ...courseData as any,
    id: newId,
    createdAt: new Date().toISOString(),
    status: 'draft',
    studentCount: 0,
    completionRate: 0
  };
  
  mockCourses.push(newCourse);
  return { id: newCourse.id };
};

export const updateCourse = (id: number, data: Partial<Course>) => {
  const courseIndex = mockCourses.findIndex(c => c.id === id);
  
  if (courseIndex >= 0) {
    mockCourses[courseIndex] = {
      ...mockCourses[courseIndex],
      ...data
    };
    
    return mockCourses[courseIndex];
  }
  
  return null;
};

export const deleteCourse = (id: number) => {
  const courseIndex = mockCourses.findIndex(c => c.id === id);
  
  if (courseIndex >= 0) {
    mockCourses.splice(courseIndex, 1);
    return true;
  }
  
  return false;
};

export const createModule = (moduleData: Omit<Module, 'id'>) => {
  const newId = Math.max(...mockModules.map(m => m.id)) + 1;
  const newModule: Module = {
    ...moduleData as any,
    id: newId,
    createdAt: new Date().toISOString()
  };
  
  mockModules.push(newModule);
  return { id: newModule.id };
};

export const updateModule = (id: number, data: Partial<Module>) => {
  const moduleIndex = mockModules.findIndex(m => m.id === id);
  
  if (moduleIndex >= 0) {
    mockModules[moduleIndex] = {
      ...mockModules[moduleIndex],
      ...data
    };
    
    return mockModules[moduleIndex];
  }
  
  return null;
};

export const deleteModule = (id: number) => {
  const moduleIndex = mockModules.findIndex(m => m.id === id);
  
  if (moduleIndex >= 0) {
    mockModules.splice(moduleIndex, 1);
    return true;
  }
  
  return false;
};

export const createLesson = (lessonData: Omit<Lesson, 'id'>) => {
  const newId = Math.max(...mockLessons.map(l => l.id)) + 1;
  const newLesson: Lesson = {
    ...lessonData as any,
    id: newId,
    createdAt: new Date().toISOString()
  };
  
  mockLessons.push(newLesson);
  return { id: newLesson.id };
};

export const updateLesson = (id: number, data: Partial<Lesson>) => {
  const lessonIndex = mockLessons.findIndex(l => l.id === id);
  
  if (lessonIndex >= 0) {
    mockLessons[lessonIndex] = {
      ...mockLessons[lessonIndex],
      ...data
    };
    
    return mockLessons[lessonIndex];
  }
  
  return null;
};

export const deleteLesson = (id: number) => {
  const lessonIndex = mockLessons.findIndex(l => l.id === id);
  
  if (lessonIndex >= 0) {
    mockLessons.splice(lessonIndex, 1);
    return true;
  }
  
  return false;
}; 
