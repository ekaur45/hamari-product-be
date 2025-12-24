import AssignmentSubmission from 'src/database/entities/assignment-submission.entity';
import Assignment from 'src/database/entities/assignment.entity';
import { Student } from 'src/database/entities/student.entity';

export default class StudentPerformanceDto {
  student: Student;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  totalScore: number;
  maxPossibleScore: number;
  assignments: {
    assignment: Assignment;
    submission: AssignmentSubmission | null;
    score: number | null;
    maxScore: number;
    percentage: number | null;
  }[];
  performanceByType: {
    type: string;
    averageScore: number;
    totalAssignments: number;
    completedAssignments: number;
  }[];
}

