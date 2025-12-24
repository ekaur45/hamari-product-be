import { Pagination } from 'src/modules/shared/models/api-response.model';
import AssignmentSubmission from 'src/database/entities/assignment-submission.entity';

export default class SubmissionListDto {
  submissions: AssignmentSubmission[];
  total: number;
  pagination: Pagination;
}

