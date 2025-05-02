import { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';

/**
 * Example component showing how to use the useData hook
 * 
 * This component demonstrates fetching and displaying data using the direct data hook
 * instead of relying on API mocking or direct API calls.
 */
export function DataExample() {
  const { getCourses } = useData();
  const [courses, setCourses] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        setCourses(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [getCourses]);
  
  if (loading) {
    return <div>Loading courses...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Courses (using Direct Data)</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
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
