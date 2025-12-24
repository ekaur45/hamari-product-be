import { Pagination } from 'src/modules/shared/models/api-response.model';
import Assignment from 'src/database/entities/assignment.entity';

export default class AssignmentListDto {
  assignments: Assignment[];
  total: number;
  pagination: Pagination;
}

