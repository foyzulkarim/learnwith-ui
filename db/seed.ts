import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Seed categories
    const categories = [
      { name: "Web Development", description: "Learn to build websites and web applications" },
      { name: "Data Science", description: "Master data analysis and machine learning techniques" },
      { name: "Business", description: "Develop essential business and entrepreneurship skills" },
      { name: "Design", description: "Learn graphic, UX, and UI design principles" },
      { name: "Programming", description: "Software programming and development fundamentals" },
      { name: "IT & Security", description: "Information technology and cybersecurity" },
      { name: "Marketing", description: "Digital marketing, social media, and SEO" }
    ];

    for (const category of categories) {
      const existingCategory = await db.query.categories.findFirst({
        where: eq(schema.categories.name, category.name)
      });

      if (!existingCategory) {
        await db.insert(schema.categories).values(category);
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }

    // Get seeded categories for reference
    const seededCategories = await db.query.categories.findMany();
    const categoryMap = seededCategories.reduce((map, category) => {
      map[category.name] = category.id;
      return map;
    }, {} as Record<string, number>);

    // Seed courses
    const courses = [
      {
        title: "Web Development Fundamentals",
        description: "Learn the core concepts of HTML, CSS, and JavaScript for building modern websites.",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        instructor: "David Mitchell",
        instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        price: "49.99",
        rating: "4.8",
        categoryId: categoryMap["Web Development"],
        totalLessons: 12,
        featured: true,
        totalDuration: "4 hours"
      },
      {
        title: "Data Science Essentials",
        description: "Master data analysis, visualization, and machine learning fundamentals.",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        instructor: "Sophia Williams",
        instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        price: "59.99",
        rating: "4.7",
        categoryId: categoryMap["Data Science"],
        totalLessons: 10,
        featured: false,
        totalDuration: "6 hours"
      },
      {
        title: "Digital Marketing Mastery",
        description: "Comprehensive guide to digital marketing strategies and implementation.",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        instructor: "Michael Johnson",
        instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        price: "44.99",
        rating: "4.5",
        categoryId: categoryMap["Marketing"],
        totalLessons: 15,
        featured: true,
        totalDuration: "8 hours"
      },
      {
        title: "JavaScript Mastery: The Complete Guide",
        description: "Become a JavaScript expert with this comprehensive course covering all aspects of modern JavaScript.",
        thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        instructor: "Robert Anderson",
        instructorAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        price: "49.99",
        rating: "4.8",
        categoryId: categoryMap["Web Development"],
        totalLessons: 20,
        bestseller: true,
        totalDuration: "12 hours"
      },
      {
        title: "Python Programming for Beginners",
        description: "Start your programming journey with Python, one of the most popular and versatile programming languages.",
        thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        instructor: "Emma Watson",
        instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        price: "39.99",
        rating: "4.6",
        categoryId: categoryMap["Programming"],
        totalLessons: 15,
        featured: false,
        totalDuration: "8 hours"
      },
      {
        title: "Modern React with Redux",
        description: "Learn to build powerful interactive web applications with React and Redux.",
        thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        instructor: "James Brown",
        instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        price: "59.99",
        rating: "4.9",
        categoryId: categoryMap["Web Development"],
        totalLessons: 18,
        isNew: true,
        totalDuration: "10 hours"
      },
      {
        title: "UX Design Fundamentals",
        description: "Master the principles of user experience design to create intuitive and engaging products.",
        thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        instructor: "Sarah Parker",
        instructorAvatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        price: "44.99",
        rating: "4.7",
        categoryId: categoryMap["Design"],
        totalLessons: 14,
        featured: false,
        totalDuration: "7 hours"
      },
      {
        title: "Introduction to Machine Learning",
        description: "Dive into the world of machine learning algorithms and applications.",
        thumbnail: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        instructor: "Andrew Clark",
        instructorAvatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        price: "69.99",
        rating: "4.8",
        categoryId: categoryMap["Data Science"],
        totalLessons: 16,
        featured: true,
        totalDuration: "9 hours"
      }
    ];

    for (const course of courses) {
      const existingCourse = await db.query.courses.findFirst({
        where: eq(schema.courses.title, course.title)
      });

      if (!existingCourse) {
        await db.insert(schema.courses).values(course);
        console.log(`Created course: ${course.title}`);
      } else {
        console.log(`Course already exists: ${course.title}`);
      }
    }

    // Get seeded courses for reference
    const seededCourses = await db.query.courses.findMany();
    const courseMap = seededCourses.reduce((map, course) => {
      map[course.title] = course.id;
      return map;
    }, {} as Record<string, number>);

    // Seed modules for Web Development Fundamentals
    const webDevModules = [
      { title: "Module 1: Introduction to Web Development", courseId: courseMap["Web Development Fundamentals"], order: 1 },
      { title: "Module 2: CSS Styling", courseId: courseMap["Web Development Fundamentals"], order: 2 },
      { title: "Module 3: JavaScript Basics", courseId: courseMap["Web Development Fundamentals"], order: 3 },
      { title: "Module 4: Responsive Web Design", courseId: courseMap["Web Development Fundamentals"], order: 4 }
    ];

    for (const module of webDevModules) {
      const existingModule = await db.query.modules.findFirst({
        where: eq(schema.modules.title, module.title)
      });

      if (!existingModule) {
        await db.insert(schema.modules).values(module);
        console.log(`Created module: ${module.title}`);
      } else {
        console.log(`Module already exists: ${module.title}`);
      }
    }

    // Get seeded modules for reference
    const seededModules = await db.query.modules.findMany();
    const moduleMap = seededModules.reduce((map, module) => {
      map[module.title] = module.id;
      return map;
    }, {} as Record<string, number>);

    // Seed lessons for Web Development Fundamentals Module 1
    const module1Lessons = [
      { 
        title: "HTML Fundamentals", 
        moduleId: moduleMap["Module 1: Introduction to Web Development"], 
        courseId: courseMap["Web Development Fundamentals"],
        order: 1,
        videoUrl: "https://example.com/videos/html-fundamentals.mp4",
        duration: "28:44",
        completed: true,
        content: "In this lesson, you'll learn the core HTML concepts that form the foundation of every web page. We'll cover document structure, elements, attributes, and how to create your first HTML document."
      },
      { 
        title: "Getting Started with Web Servers", 
        moduleId: moduleMap["Module 1: Introduction to Web Development"], 
        courseId: courseMap["Web Development Fundamentals"],
        order: 2,
        videoUrl: "https://example.com/videos/web-servers.mp4",
        duration: "22:15",
        completed: true,
        content: "Learn how web servers work and how to set up a basic development environment for your web projects."
      },
      { 
        title: "Understanding HTTP Protocol", 
        moduleId: moduleMap["Module 1: Introduction to Web Development"], 
        courseId: courseMap["Web Development Fundamentals"],
        order: 3,
        videoUrl: "https://example.com/videos/http-protocol.mp4",
        duration: "18:30",
        completed: true,
        content: "Explore the HTTP protocol and understand how browsers communicate with servers."
      },
      { 
        title: "Web Development Tools", 
        moduleId: moduleMap["Module 1: Introduction to Web Development"], 
        courseId: courseMap["Web Development Fundamentals"],
        order: 4,
        videoUrl: "https://example.com/videos/dev-tools.mp4",
        duration: "25:10",
        completed: false,
        content: "Discover essential tools and extensions that will make your web development workflow more efficient."
      }
    ];

    for (const lesson of module1Lessons) {
      const existingLesson = await db.query.lessons.findFirst({
        where: and(
          eq(schema.lessons.title, lesson.title),
          eq(schema.lessons.moduleId, lesson.moduleId)
        )
      });

      if (!existingLesson) {
        await db.insert(schema.lessons).values(lesson);
        console.log(`Created lesson: ${lesson.title}`);
      } else {
        console.log(`Lesson already exists: ${lesson.title}`);
      }
    }

    // Get seeded lessons for reference
    const seededLessons = await db.query.lessons.findMany();
    const lessonMap = seededLessons.reduce((map, lesson) => {
      map[lesson.title] = lesson.id;
      return map;
    }, {} as Record<string, number>);

    // Seed quiz questions for HTML Fundamentals lesson
    const htmlQuizQuestions = [
      {
        lessonId: lessonMap["HTML Fundamentals"],
        question: "Which tag is used to define the main content of an HTML document?",
        options: JSON.stringify(["<main>", "<content>", "<body>", "<article>"]),
        correctAnswer: "<body>"
      },
      {
        lessonId: lessonMap["HTML Fundamentals"],
        question: "What does HTML stand for?",
        options: JSON.stringify([
          "Hyper Text Markup Language", 
          "High Tech Modern Language", 
          "Hyperlinks and Text Markup Language", 
          "Home Tool Markup Language"
        ]),
        correctAnswer: "Hyper Text Markup Language"
      }
    ];

    for (const question of htmlQuizQuestions) {
      const existingQuestion = await db.query.quizQuestions.findFirst({
        where: and(
          eq(schema.quizQuestions.lessonId, question.lessonId),
          eq(schema.quizQuestions.question, question.question)
        )
      });

      if (!existingQuestion) {
        await db.insert(schema.quizQuestions).values(question);
        console.log(`Created quiz question: ${question.question}`);
      } else {
        console.log(`Quiz question already exists: ${question.question}`);
      }
    }

    // Seed user for demo (if not exists)
    const demoUser = {
      username: "demo_user",
      password: "password123", // This would be hashed in a real application
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      bio: "Passionate about learning and technology."
    };

    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.username, demoUser.username)
    });

    if (!existingUser) {
      await db.insert(schema.users).values(demoUser);
      console.log(`Created demo user: ${demoUser.username}`);
    } else {
      console.log(`Demo user already exists: ${demoUser.username}`);
    }

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
