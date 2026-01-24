import { Injectable } from "@nestjs/common";
import { SubjectService } from "../subject/subject.service";
@Injectable()
export class PublicService {
    constructor(
        private readonly subjectService: SubjectService,
    ) { }
    async getSubjects() {
        return this.subjectService.getSubjects({ name: '' });
    }
}