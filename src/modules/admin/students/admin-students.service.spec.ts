import { Test, TestingModule } from '@nestjs/testing';
import { AdminStudentsService } from './admin-students.service';

describe('StudentsService', () => {
  let service: AdminStudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminStudentsService],
    }).compile();

    service = module.get<AdminStudentsService>(AdminStudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
