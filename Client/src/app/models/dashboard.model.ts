export interface DashboardStats {
    totalUsers?: number;
    totalCourses?: number;
    totalStudents?: number;
    totalTeachers?: number;
    activeUsers?: number;
    recentRegistrations?: number;
    enrolledCourses?: number;
    completedCourses?: number;
    averageGrade?: number;
    upcomingAssignments?: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    duration: string;
    enrolled: number;
    rating: number;
    image?: string;
    status: 'active' | 'draft' | 'completed';
}

export interface Assignment {
    id: string;
    title: string;
    course: string;
    dueDate: Date;
    status: 'pending' | 'submitted' | 'graded';
    grade?: number;
}

export interface UserActivity {
    id: string;
    user: string;
    action: string;
    timestamp: Date;
    details?: string;
}
