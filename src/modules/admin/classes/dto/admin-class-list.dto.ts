import ClassEntity from "src/database/entities/classes.entity";
import { Pagination } from "src/modules/shared/models/api-response.model";

export default class AdminClassListDto {
    classes: ClassEntity[];
    totalClasses: number;
    pagination: Pagination;
}

