import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Nationality from "src/database/entities/nationality.entity";

@Injectable()
export class NationalityService {
    constructor(
        @InjectRepository(Nationality)
        private readonly nationalityRepository: Repository<Nationality>,
    ) {}

    async getNationalities(): Promise<Nationality[]> {
        return this.nationalityRepository.find({ order: { name: 'ASC' } });
    }
}