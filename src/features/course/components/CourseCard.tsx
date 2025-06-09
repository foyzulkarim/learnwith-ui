import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { memo } from "react";
import { useEnrollment } from "@/hooks/useEnrollment";

type CourseCardProps = {
  _id: string;
  title: string;
  thumbnailUrl: string;
  instructor: string;
  instructorAvatar?: string;
  category: string;
  price?: string;
  rating?: string;
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  remainingTime?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isInProgress?: boolean;
};

const CourseCard = memo(function CourseCard({
  _id,
  title,
  thumbnailUrl,
  instructor,
  instructorAvatar,
  category,
  price,
  rating,
  progress = 0,
  completedLessons,
  totalLessons,
  remainingTime,
  isFeatured = false,
  isNew = false,
  isBestseller = false,
  isInProgress = false,
}: CourseCardProps) {
  const { 
    isEnrolled, 
    progress: enrollmentProgress, 
    lastWatchedLessonId,
    completedLessons: enrollmentCompletedLessons,
    isEnrolling, 
    enroll, 
    isLoggedIn 
  } = useEnrollment(_id);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Use enrollment data if available, otherwise use props
  const actualProgress = isEnrolled ? enrollmentProgress : progress;
  const actualCompletedLessons = isEnrolled ? enrollmentCompletedLessons : completedLessons;
  const actualIsInProgress = isEnrolled && actualProgress > 0;

  // Determine the course URL
  const courseUrl = isEnrolled && lastWatchedLessonId 
    ? `/course/${_id}/lesson/${lastWatchedLessonId}`
    : `/course/${_id}`;

  return (
    <Card className="course-card h-full flex flex-col">
      <div className="relative">
        <img src={thumbnailUrl} alt={title} className="course-card-image" />
        {actualIsInProgress && actualCompletedLessons && totalLessons && (
          <div className="absolute top-3 right-3 bg-white py-1 px-2 rounded-md text-sm font-medium">
            {actualCompletedLessons}/{totalLessons} Lessons
          </div>
        )}
        {isBestseller && !actualIsInProgress && (
          <Badge className="absolute top-3 right-3 bg-secondary">BESTSELLER</Badge>
        )}
        {isNew && !actualIsInProgress && !isBestseller && (
          <Badge className="absolute top-3 right-3 bg-accent">NEW</Badge>
        )}
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        <h3 className="course-card-title font-bold text-lg mb-2">{title}</h3>
        
        <div className="instructor-info flex items-center mb-3">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={instructorAvatar} alt={instructor} />
            <AvatarFallback className="text-xs">
              {getInitials(instructor)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-700">{instructor}</p>
            <p className="text-xs text-gray-500">{category}</p>
          </div>
        </div>

        <div className="course-stats flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            {rating && (
              <>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{rating}</span>
              </>
            )}
          </div>
          {totalLessons && (
            <span>{totalLessons} lessons</span>
          )}
        </div>

        {actualIsInProgress && (
          <div className="progress-section mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(actualProgress)}%</span>
            </div>
            <Progress value={actualProgress} className="h-2" />
            {remainingTime && (
              <p className="text-xs text-gray-500 mt-1">{remainingTime} remaining</p>
            )}
          </div>
        )}

        <div className="mt-auto">
          {actualIsInProgress ? (
            <div className="text-sm text-gray-600 mb-2">
              {actualCompletedLessons}/{totalLessons} lessons completed
            </div>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        {isEnrolled ? (
          <Link href={courseUrl} className="block text-center w-full">
            <Button className="w-full bg-primary hover:bg-primary/90">
              {actualProgress > 0 ? "Resume Course" : "Start Course"}
            </Button>
          </Link>
        ) : (
          <div className="flex justify-between items-center w-full">
            {price && <span className="text-primary font-bold">${price}</span>}
            <div className="flex-1 ml-4">
              {isLoggedIn ? (
                <Button 
                  onClick={enroll}
                  disabled={isEnrolling}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  {isEnrolling ? "Enrolling..." : "Enroll"}
                </Button>
              ) : (
                <Link href="/login" className="block w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
                    Login to Enroll
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
});

export default CourseCard;
