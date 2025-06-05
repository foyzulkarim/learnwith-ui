import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`);
        setCourse(courseResponse.data);
        
        // Fetch curriculum
        const curriculumResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}/curriculum`);
        setCurriculum(curriculumResponse.data);
        
        // Check if user is enrolled
        try {
          const enrollmentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/enrollments/courses/${courseId}`);
          setEnrollment(enrollmentResponse.data);
        } catch (enrollError) {
          // If 404 or other error, user is not enrolled - this is expected for new users
          console.log('User not enrolled in this course');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load course data');
        setLoading(false);
        console.error('Error fetching course data:', err);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Find the first lesson in the curriculum
  const getFirstLesson = () => {
    if (!curriculum || !curriculum.modules || curriculum.modules.length === 0) return null;
    
    const firstModule = curriculum.modules[0];
    if (!firstModule.lessons || firstModule.lessons.length === 0) return null;
    
    return firstModule.lessons[0];
  };

  // Find the lesson to resume (last watched)
  const getResumeLesson = () => {
    if (!enrollment || !enrollment.lastWatchedLessonId) return getFirstLesson();
    
    // Find the lesson with the lastWatchedLessonId
    for (const module of curriculum.modules) {
      for (const lesson of module.lessons) {
        if (lesson._id === enrollment.lastWatchedLessonId) {
          return lesson;
        }
      }
    }
    
    // If not found, return the first lesson
    return getFirstLesson();
  };

  // Check if a lesson is completed
  const isLessonCompleted = (lessonId) => {
    if (!enrollment || !enrollment.lessons) return false;
    
    return enrollment.lessons[lessonId] && 
           enrollment.lessons[lessonId].status === 'completed';
  };

  if (loading) return <div className="p-8 text-center">Loading course details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!course || !curriculum) return <div className="p-8 text-center">Course not found</div>;

  const firstLesson = getFirstLesson();
  const resumeLesson = enrollment ? getResumeLesson() : null;
  const isEnrolled = !!enrollment;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Info - Left Column */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg mb-6">{course.description}</p>
          
          {/* CTA Button */}
          {firstLesson && (
            <Link 
              to={`/lesson/${isEnrolled ? resumeLesson._id : firstLesson._id}`}
              className="btn-primary mb-8"
            >
              {isEnrolled 
                ? `Resume ${resumeLesson.title}` 
                : 'Start First Lesson'}
            </Link>
          )}
          
          {/* Course Details */}
          <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">About this Course</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Instructor</p>
                <p className="font-medium">{course.instructor || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{course.duration || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Level</p>
                <p className="font-medium">{course.level || 'All levels'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {course.updatedAt 
                    ? new Date(course.updatedAt).toLocaleDateString() 
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Course Content Preview */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">What you'll learn</h2>
            <ul className="list-disc pl-5 space-y-2">
              {course.learningObjectives?.map((objective, index) => (
                <li key={index}>{objective}</li>
              )) || <li>Course learning objectives not specified</li>}
            </ul>
          </div>
        </div>
        
        {/* Curriculum - Right Column */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Course Curriculum</h2>
            {isEnrolled && (
              <div className="text-sm">
                <span className="font-medium">{enrollment.progress}%</span> complete
              </div>
            )}
          </div>
          
          {isEnrolled && (
            <div className="progress-bar mb-6">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${enrollment.progress}%` }}
              ></div>
            </div>
          )}
          
          {curriculum.modules.map((module) => (
            <div key={module._id} className="mb-6">
              <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
              <div className="border rounded-lg overflow-hidden">
                {module.lessons.map((lesson) => {
                  const isCompleted = isEnrolled && isLessonCompleted(lesson._id);
                  const isCurrentLesson = isEnrolled && resumeLesson && resumeLesson._id === lesson._id;
                  
                  return (
                    <Link 
                      key={lesson._id}
                      to={`/lesson/${lesson._id}`}
                      className={`lesson-item border-b last:border-b-0 ${
                        isCurrentLesson ? 'lesson-item-active' : ''
                      } ${isCompleted ? 'lesson-item-completed' : ''}`}
                    >
                      <div className="flex items-center">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300 mr-3"></div>
                        )}
                        <span>{lesson.title}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {lesson.duration}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
