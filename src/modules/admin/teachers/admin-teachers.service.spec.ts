import { Test, TestingModule } from '@nestjs/testing';
import { AdminTeachersService } from './admin-teachers.service';

describe('AdminTeachersService', () => {
  let service: AdminTeachersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminTeachersService],
    }).compile();

    service = module.get<AdminTeachersService>(AdminTeachersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
