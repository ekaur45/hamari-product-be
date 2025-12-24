import Assignment from 'src/database/entities/assignment.entity';
import { Pagination } from '../../shared/models/api-response.model';

export default class StudentAssignmentListDto {
  assignments: Assignment[];
  total: number;
  pagination: Pagination;
}

