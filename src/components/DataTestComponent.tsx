import { mockCourses } from '../lib/mockData';

/**
 * A simple test component that directly renders mock data
 * to verify it's available in the build
 */
export function DataTestComponent() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Courses (Direct Import)</h2>
      <div className="text-sm text-gray-500 mb-4">
        Showing {mockCourses.length} courses from mockData
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCourses.map(course => (
          <div key={course.id} className="border rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold">{course.title}</h3>
            <p className="text-gray-600 mt-2">{course.description}</p>
            <div className="mt-3 flex items-center">
              <span className="text-sm text-gray-500">Instructor: {course.instructor}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
