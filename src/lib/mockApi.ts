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

// Helper function to create a mock response
function createMockResponse<T>(data: T, status = 200): Response {
  const body = JSON.stringify(data);
  const init = {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  return new Response(body, init);
}

// Type to track the last mock IDs to use for creating new records
interface LastIds {
  course: number;
  module: number;
  lesson: number;
  quiz: number;
  note: number;
}

// Keep track of the last IDs used for creating new records
const lastIds: LastIds = {
  course: Math.max(...mockCourses.map(c => c.id)),
  module: Math.max(...mockModules.map(m => m.id)),
  lesson: Math.max(...mockLessons.map(l => l.id)),
  quiz: Math.max(...mockQuizQuestions.map(q => q.id)),
  note: Math.max(...mockNotes.map(n => n.id))
};

// Parse URL to extract path parts and query parameters
function parseUrl(url: string) {
  // Split URL into path and query parts
  const [path, queryString] = url.split('?');
  const queryParams = new URLSearchParams(queryString || '');
  
  // Extract path components (without API prefix)
  const pathParts = path.replace(/^\/api\/?/, '').split('/');
  
  return { pathParts, queryParams };
}

// Function to handle GET requests
async function handleGetRequest(url: string): Promise<Response> {
  const { pathParts, queryParams } = parseUrl(url);
  
  // Common query params
  const limit = queryParams.get('limit') ? parseInt(queryParams.get('limit') as string) : undefined;
  const search = queryParams.get('search') || undefined;
  const categoryId = queryParams.get('categoryId') ? parseInt(queryParams.get('categoryId') as string) : undefined;
  
  // Route handling based on path
  switch (pathParts[0]) {
    case 'auth':
      if (pathParts[1] === 'check') {
        return createMockResponse(mockAuthStatus);
      }
      break;
    
    case 'categories':
      return createMockResponse(mockCategories);
    
    case 'courses':
      if (pathParts.length === 1) {
        // Handle /courses endpoint with optional filtering
        let filteredCourses = [...mockCourses];
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredCourses = filteredCourses.filter(course => 
            course.title.toLowerCase().includes(searchLower) || 
            course.description.toLowerCase().includes(searchLower)
          );
        }
        
        if (categoryId !== undefined) {
          filteredCourses = filteredCourses.filter(course => course.categoryId === categoryId);
        }
        
        if (limit !== undefined) {
          filteredCourses = filteredCourses.slice(0, limit);
        }
        
        return createMockResponse(filteredCourses);
      } 
      else if (pathParts[1] === 'in-progress') {
        // Return courses in progress
        let filteredCourses = [...mockInProgressCourses];
        
        if (limit !== undefined) {
          filteredCourses = filteredCourses.slice(0, limit);
        }
        
        return createMockResponse(filteredCourses);
      }
      else if (pathParts[1] === 'has-in-progress') {
        // Check if there are courses in progress
        return createMockResponse(mockInProgressCourses.length > 0);
      }
      else if (pathParts.length === 2) {
        // Get course by ID: /courses/:id
        const courseId = parseInt(pathParts[1]);
        const course = mockCourses.find(c => c.id === courseId);
        
        if (course) {
          return createMockResponse(course);
        }
        return createMockResponse({ message: "Course not found" }, 404);
      }
      else if (pathParts.length === 3) {
        // Get course modules or lessons: /courses/:id/modules or /courses/:id/lessons
        const courseId = parseInt(pathParts[1]);
        
        if (pathParts[2] === 'modules') {
          const modules = mockModules.filter(m => m.courseId === courseId);
          return createMockResponse(modules);
        }
        else if (pathParts[2] === 'lessons') {
          const lessons = mockLessons.filter(l => l.courseId === courseId);
          return createMockResponse(lessons);
        }
        else if (pathParts[2] === 'students') {
          // Mock student data for the course
          const studentCount = mockCourses.find(c => c.id === courseId)?.studentCount || 0;
          
          // Match exactly the Student interface from CourseStudentsPage.tsx:
          // interface Student {
          //   id: number;
          //   name: string;
          //   email: string;
          //   progress: number;
          //   lastActive: string;
          // }
          const mockStudents = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `Student ${i + 1}`,
            email: `student${i + 1}@example.com`,
            progress: Math.floor(Math.random() * 100),
            lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          }));
          
          // Return just the array of students instead of an object with students property
          return createMockResponse(mockStudents);
        }
      }
      break;
    
    case 'modules':
      if (pathParts.length === 2) {
        // Get module by ID: /modules/:id
        const moduleId = parseInt(pathParts[1]);
        const module = mockModules.find(m => m.id === moduleId);
        
        if (module) {
          return createMockResponse(module);
        }
        return createMockResponse({ message: "Module not found" }, 404);
      }
      break;
    
    case 'lessons':
      if (pathParts.length === 2) {
        // Get lesson by ID: /lessons/:id
        const lessonId = parseInt(pathParts[1]);
        const lesson = mockLessons.find(l => l.id === lessonId);
        
        if (lesson) {
          return createMockResponse(lesson);
        }
        return createMockResponse({ message: "Lesson not found" }, 404);
      }
      else if (pathParts.length === 3) {
        const lessonId = parseInt(pathParts[1]);
        
        if (pathParts[2] === 'quiz') {
          // Get quiz questions for lesson: /lessons/:id/quiz
          const questions = mockQuizQuestions.filter(q => q.lessonId === lessonId);
          return createMockResponse(questions);
        }
        else if (pathParts[2] === 'note') {
          // Get note for lesson: /lessons/:id/note
          const note = mockNotes.find(n => n.lessonId === lessonId);
          return createMockResponse(note || null);
        }
      }
      break;
    
    case 'creator':
      if (pathParts[1] === 'courses') {
        // For demo purposes, return all courses as if they belong to the current instructor
        const instructorName = "Alex Morgan"; // This would come from auth in a real app
        const instructorCourses = mockCourses.filter(course => course.instructor === instructorName);
        return createMockResponse(instructorCourses);
      }
      break;
  }
  
  // If no matching route was found
  return createMockResponse({ message: "Not found" }, 404);
}

// Function to handle POST requests
async function handlePostRequest(url: string, data: unknown): Promise<Response> {
  const { pathParts } = parseUrl(url);
  
  switch (pathParts[0]) {
    case 'courses':
      if (pathParts.length === 1) {
        // Create a new course
        const courseData = data as Omit<Course, 'id'>;
        const newCourse: Course = {
          ...courseData as any,
          id: ++lastIds.course,
          createdAt: new Date().toISOString(),
          status: 'draft',
          studentCount: 0,
          completionRate: 0
        };
        
        mockCourses.push(newCourse);
        return createMockResponse({ id: newCourse.id }, 201);
      }
      break;
    
    case 'modules':
      if (pathParts.length === 1) {
        // Create a new module
        const moduleData = data as Omit<Module, 'id'>;
        const newModule: Module = {
          ...moduleData as any,
          id: ++lastIds.module,
          createdAt: new Date().toISOString()
        };
        
        mockModules.push(newModule);
        return createMockResponse({ id: newModule.id }, 201);
      }
      break;
    
    case 'lessons':
      if (pathParts.length === 1) {
        // Create a new lesson
        const lessonData = data as Omit<Lesson, 'id'>;
        const newLesson: Lesson = {
          ...lessonData as any,
          id: ++lastIds.lesson,
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        mockLessons.push(newLesson);
        return createMockResponse({ id: newLesson.id }, 201);
      }
      else if (pathParts.length === 3 && pathParts[2] === 'note') {
        // Create or update a note for a lesson
        const lessonId = parseInt(pathParts[1]);
        const { content } = data as { content: string };
        
        // Check if note already exists
        const existingNoteIndex = mockNotes.findIndex(n => n.lessonId === lessonId);
        
        if (existingNoteIndex >= 0) {
          // Update existing note
          mockNotes[existingNoteIndex].content = content;
          return createMockResponse(mockNotes[existingNoteIndex]);
        } else {
          // Create new note
          const newNote = {
            id: ++lastIds.note,
            lessonId,
            userId: 1, // Assume user ID 1 for demo
            content,
            createdAt: new Date().toISOString()
          };
          
          mockNotes.push(newNote);
          return createMockResponse(newNote, 201);
        }
      }
      else if (pathParts.length === 3 && pathParts[2] === 'quiz/check') {
        // Check quiz answers
        const lessonId = parseInt(pathParts[1]);
        const { answers } = data as { answers: Record<number, string> };
        
        // Get quiz questions for this lesson
        const questions = mockQuizQuestions.filter(q => q.lessonId === lessonId);
        
        // Check each answer
        const results = Object.entries(answers).map(([questionIdStr, answer]) => {
          const questionId = parseInt(questionIdStr);
          const question = questions.find(q => q.id === questionId);
          const isCorrect = question?.correctOption === answer;
          
          return {
            questionId,
            isCorrect,
            correctAnswer: question?.correctOption || ''
          };
        });
        
        // Calculate overall score
        const score = results.filter(r => r.isCorrect).length / results.length;
        
        return createMockResponse({
          results,
          score,
          passed: score >= 0.7 // Pass if 70% or more correct
        });
      }
      break;
  }
  
  // If no matching route was found
  return createMockResponse({ message: "Not found" }, 404);
}

// Function to handle PATCH requests
async function handlePatchRequest(url: string, data: unknown): Promise<Response> {
  const { pathParts } = parseUrl(url);
  
  switch (pathParts[0]) {
    case 'courses':
      if (pathParts.length === 2) {
        // Update a course
        const courseId = parseInt(pathParts[1]);
        const courseIndex = mockCourses.findIndex(c => c.id === courseId);
        
        if (courseIndex >= 0) {
          mockCourses[courseIndex] = {
            ...mockCourses[courseIndex],
            ...data as Partial<Course>
          };
          
          return createMockResponse(mockCourses[courseIndex]);
        }
        
        return createMockResponse({ message: "Course not found" }, 404);
      }
      break;
    
    case 'modules':
      if (pathParts.length === 2) {
        // Update a module
        const moduleId = parseInt(pathParts[1]);
        const moduleIndex = mockModules.findIndex(m => m.id === moduleId);
        
        if (moduleIndex >= 0) {
          mockModules[moduleIndex] = {
            ...mockModules[moduleIndex],
            ...data as Partial<Module>
          };
          
          return createMockResponse(mockModules[moduleIndex]);
        }
        
        return createMockResponse({ message: "Module not found" }, 404);
      }
      break;
    
    case 'lessons':
      if (pathParts.length === 2) {
        // Update a lesson
        const lessonId = parseInt(pathParts[1]);
        const lessonIndex = mockLessons.findIndex(l => l.id === lessonId);
        
        if (lessonIndex >= 0) {
          mockLessons[lessonIndex] = {
            ...mockLessons[lessonIndex],
            ...data as Partial<Lesson>
          };
          
          return createMockResponse(mockLessons[lessonIndex]);
        }
        
        return createMockResponse({ message: "Lesson not found" }, 404);
      }
      break;
  }
  
  // If no matching route was found
  return createMockResponse({ message: "Not found" }, 404);
}

// Function to handle DELETE requests
async function handleDeleteRequest(url: string): Promise<Response> {
  const { pathParts } = parseUrl(url);
  
  switch (pathParts[0]) {
    case 'courses':
      if (pathParts.length === 2) {
        // Delete a course
        const courseId = parseInt(pathParts[1]);
        const courseIndex = mockCourses.findIndex(c => c.id === courseId);
        
        if (courseIndex >= 0) {
          mockCourses.splice(courseIndex, 1);
          return createMockResponse({ success: true });
        }
        
        return createMockResponse({ message: "Course not found" }, 404);
      }
      break;
    
    case 'modules':
      if (pathParts.length === 2) {
        // Delete a module
        const moduleId = parseInt(pathParts[1]);
        const moduleIndex = mockModules.findIndex(m => m.id === moduleId);
        
        if (moduleIndex >= 0) {
          mockModules.splice(moduleIndex, 1);
          return createMockResponse({ success: true });
        }
        
        return createMockResponse({ message: "Module not found" }, 404);
      }
      break;
    
    case 'lessons':
      if (pathParts.length === 2) {
        // Delete a lesson
        const lessonId = parseInt(pathParts[1]);
        const lessonIndex = mockLessons.findIndex(l => l.id === lessonId);
        
        if (lessonIndex >= 0) {
          mockLessons.splice(lessonIndex, 1);
          return createMockResponse({ success: true });
        }
        
        return createMockResponse({ message: "Lesson not found" }, 404);
      }
      break;
  }
  
  // If no matching route was found
  return createMockResponse({ message: "Not found" }, 404);
}

// Main handler for all mock API requests
export async function mockApiRequest(
  url: string,
  data?: unknown,
  options?: {
    method?: string;
    headers?: Record<string, string>;
  }
): Promise<Response> {
  // Only intercept API requests
  if (!url.startsWith('/api')) {
    // For non-API requests, pass through to the real fetch
    return fetch(url, {
      method: options?.method || 'GET',
      headers: options?.headers,
      body: data ? (typeof data === 'string' ? data : JSON.stringify(data)) : undefined
    });
  }
  
  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const method = options?.method || 'GET';
  
  // Route to the appropriate handler based on the HTTP method
  switch (method) {
    case 'GET':
      return handleGetRequest(url);
    case 'POST':
      return handlePostRequest(url, data);
    case 'PATCH':
    case 'PUT':
      return handlePatchRequest(url, data);
    case 'DELETE':
      return handleDeleteRequest(url);
    default:
      return createMockResponse({ message: `Method ${method} not supported` }, 405);
  }
}

// Function to install the mock API by overriding the global fetch function
export function installMockApi() {
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Override fetch with our mock implementation
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    if (url.startsWith('/api')) {
      return mockApiRequest(
        url,
        init?.body,
        {
          method: init?.method,
          headers: init?.headers as Record<string, string>
        }
      );
    }
    
    // For non-API requests, pass through to the original fetch
    return originalFetch(input, init);
  };
  
  console.log('🔄 Mock API installed - API requests will be intercepted');
  
  // Return a function to uninstall the mock
  return () => {
    window.fetch = originalFetch;
    console.log('🔄 Mock API uninstalled - API requests will go to the real server');
  };
} 
