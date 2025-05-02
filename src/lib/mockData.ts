// Mock data definitions for the LearnFlow application
// This file defines mock data that can be used for UI development without requiring the backend

// Type definitions
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  instructorAvatar?: string;
  price?: string;
  rating?: string;
  categoryId: number;
  difficulty: string;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  totalLessons?: number;
  completedLessons?: number;
  progress?: number;
  category?: Category;
  status?: string;
  publishedAt?: string;
  studentCount?: number;
  completionRate?: number;
}

export interface Module {
  id: number;
  title: string;
  courseId: number;
  order: number;
  createdAt?: string;
}

export interface Lesson {
  id: number;
  title: string;
  moduleId: number;
  courseId: number;
  order: number;
  videoUrl?: string;
  duration?: string;
  completed?: boolean;
  content?: string;
  createdAt?: string;
}

export interface QuizQuestion {
  id: number;
  lessonId: number;
  question: string;
  options: string[];
  correctOption: string;
}

export interface Note {
  id: number;
  lessonId: number;
  userId: number;
  content: string;
  createdAt: string;
}

// Mock categories
export const mockCategories: Category[] = [
  { id: 1, name: 'Web Development', slug: 'web-development', iconName: 'Code' },
  { id: 2, name: 'Data Science', slug: 'data-science', iconName: 'BarChart' },
  { id: 3, name: 'Mobile Development', slug: 'mobile-development', iconName: 'Smartphone' },
  { id: 4, name: 'Design', slug: 'design', iconName: 'Palette' },
  { id: 5, name: 'Business', slug: 'business', iconName: 'Briefcase' },
  { id: 6, name: 'Marketing', slug: 'marketing', iconName: 'TrendingUp' }
];

// Mock courses
export const mockCourses: Course[] = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Learn the core concepts of JavaScript programming language',
    thumbnail: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
    instructor: 'Alex Morgan',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    price: '$49.99',
    rating: '4.7',
    categoryId: 1,
    difficulty: 'Beginner',
    featured: true,
    bestseller: true,
    isNew: false,
    totalLessons: 12,
    completedLessons: 3,
    progress: 25,
    studentCount: 1245,
    completionRate: 87,
    status: 'published',
    publishedAt: '2023-03-15T00:00:00.000Z'
  },
  {
    id: 2,
    title: 'React for Beginners',
    description: 'Start building modern web applications with React',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
    instructor: 'Mia Chen',
    instructorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    price: '$59.99',
    rating: '4.9',
    categoryId: 1,
    difficulty: 'Intermediate',
    featured: true,
    bestseller: true,
    isNew: false,
    totalLessons: 15,
    completedLessons: 0,
    progress: 0,
    studentCount: 987,
    completionRate: 92,
    status: 'published',
    publishedAt: '2023-05-20T00:00:00.000Z'
  },
  {
    id: 3,
    title: 'Python for Data Science',
    description: 'Master Python for data analysis and machine learning',
    thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    instructor: 'David Kim',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    price: '$49.99',
    rating: '4.8',
    categoryId: 2,
    difficulty: 'Intermediate',
    featured: false,
    bestseller: true,
    isNew: false,
    totalLessons: 20,
    completedLessons: 8,
    progress: 40,
    studentCount: 1534,
    completionRate: 78,
    status: 'published',
    publishedAt: '2023-01-10T00:00:00.000Z'
  },
  {
    id: 4,
    title: 'Flutter App Development',
    description: 'Build cross-platform mobile apps with Flutter',
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    instructor: 'Samantha Lee',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    price: '$69.99',
    rating: '4.6',
    categoryId: 3,
    difficulty: 'Advanced',
    featured: false,
    bestseller: false,
    isNew: true,
    totalLessons: 18,
    completedLessons: 0,
    progress: 0,
    studentCount: 756,
    completionRate: 85,
    status: 'published',
    publishedAt: '2023-07-05T00:00:00.000Z'
  },
  {
    id: 5,
    title: 'UI/UX Design Principles',
    description: 'Learn the fundamentals of creating great user experiences',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    instructor: 'Jessica Brown',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    price: '$39.99',
    rating: '4.5',
    categoryId: 4,
    difficulty: 'Beginner',
    featured: true,
    bestseller: false,
    isNew: false,
    totalLessons: 10,
    completedLessons: 5,
    progress: 50,
    studentCount: 1032,
    completionRate: 91,
    status: 'published',
    publishedAt: '2023-02-18T00:00:00.000Z'
  }
];

// Mock modules
export const mockModules: Module[] = [
  { id: 1, title: 'Introduction to JavaScript', courseId: 1, order: 1 },
  { id: 2, title: 'Variables and Data Types', courseId: 1, order: 2 },
  { id: 3, title: 'Functions and Scope', courseId: 1, order: 3 },
  { id: 4, title: 'Getting Started with React', courseId: 2, order: 1 },
  { id: 5, title: 'Components and Props', courseId: 2, order: 2 },
  { id: 6, title: 'State and Lifecycle', courseId: 2, order: 3 },
  { id: 7, title: 'Python Basics', courseId: 3, order: 1 },
  { id: 8, title: 'Data Manipulation with Pandas', courseId: 3, order: 2 },
  { id: 9, title: 'Data Visualization', courseId: 3, order: 3 }
];

// Mock lessons
export const mockLessons: Lesson[] = [
  { id: 1, title: 'What is JavaScript?', moduleId: 1, courseId: 1, order: 1, videoUrl: 'https://example.com/video1.mp4', duration: '10:15', completed: true, content: 'JavaScript is a programming language that powers the dynamic behavior on most websites.' },
  { id: 2, title: 'Setting Up Your Development Environment', moduleId: 1, courseId: 1, order: 2, videoUrl: 'https://example.com/video2.mp4', duration: '8:30', completed: true, content: 'Learn how to set up VS Code for JavaScript development.' },
  { id: 3, title: 'Your First JavaScript Program', moduleId: 1, courseId: 1, order: 3, videoUrl: 'https://example.com/video3.mp4', duration: '12:45', completed: true, content: 'Write and run your first JavaScript program - Hello World!' },
  { id: 4, title: 'Variables and Constants', moduleId: 2, courseId: 1, order: 1, videoUrl: 'https://example.com/video4.mp4', duration: '15:20', completed: false, content: 'Learn about var, let, and const keywords.' },
  { id: 5, title: 'Numbers and Strings', moduleId: 2, courseId: 1, order: 2, videoUrl: 'https://example.com/video5.mp4', duration: '14:10', completed: false, content: 'Understand JavaScript primitive types.' },
  { id: 6, title: 'Introduction to React', moduleId: 4, courseId: 2, order: 1, videoUrl: 'https://example.com/video6.mp4', duration: '18:30', completed: false, content: 'Learn what React is and why it was created.' },
  { id: 7, title: 'Setting Up a React Project', moduleId: 4, courseId: 2, order: 2, videoUrl: 'https://example.com/video7.mp4', duration: '20:15', completed: false, content: 'Create your first React application using Create React App.' },
  { id: 8, title: 'Python Introduction', moduleId: 7, courseId: 3, order: 1, videoUrl: 'https://example.com/video8.mp4', duration: '15:45', completed: true, content: 'Learn what makes Python a great language for data science.' },
  { id: 9, title: 'Variables and Data Types in Python', moduleId: 7, courseId: 3, order: 2, videoUrl: 'https://example.com/video9.mp4', duration: '17:20', completed: true, content: 'Master Python variables, numbers, strings, and lists.' }
];

// Mock quiz questions
export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    lessonId: 1,
    question: 'Which of the following is not a JavaScript data type?',
    options: ['String', 'Number', 'Boolean', 'Float'],
    correctOption: 'Float'
  },
  {
    id: 2,
    lessonId: 1,
    question: 'What will console.log(2 + "2") output?',
    options: ['4', '22', 'Error', 'undefined'],
    correctOption: '22'
  },
  {
    id: 3,
    lessonId: 6,
    question: 'What is JSX?',
    options: [
      'A JavaScript library',
      'A syntax extension for JavaScript that looks similar to HTML',
      'A browser API',
      'A testing framework'
    ],
    correctOption: 'A syntax extension for JavaScript that looks similar to HTML'
  },
  {
    id: 4,
    lessonId: 8,
    question: 'Which of the following is not a Python collection type?',
    options: ['List', 'Tuple', 'Dictionary', 'Array'],
    correctOption: 'Array'
  }
];

// Mock notes
export const mockNotes: Note[] = [
  {
    id: 1,
    lessonId: 1,
    userId: 1,
    content: 'JavaScript was created in 10 days by Brendan Eich while he was working at Netscape.',
    createdAt: '2023-05-12T14:30:00.000Z'
  },
  {
    id: 2,
    lessonId: 8,
    userId: 1,
    content: 'Python was created by Guido van Rossum and first released in 1991.',
    createdAt: '2023-06-18T09:45:00.000Z'
  }
];

// Courses that are marked as "in progress" for the current user
export const mockInProgressCourses: Course[] = [
  mockCourses[0],
  mockCourses[2],
  mockCourses[4]
].map(course => ({
  ...course,
  progress: Math.floor(Math.random() * 100)
}));

// Auth status - for demo purposes always return authenticated
export const mockAuthStatus = true; 
