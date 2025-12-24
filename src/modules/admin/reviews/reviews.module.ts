import { Module } from "@nestjs/common";
import SharedModule from "src/modules/shared/shared.module";
import { AdminReviewsController } from "./reviews.controller";
import { AdminReviewsService } from "./admin-reviews.service";

@Module({
    imports: [SharedModule],
    controllers: [AdminReviewsController],
    providers: [AdminReviewsService],
    exports: [AdminReviewsService],
})
export class AdminReviewsModule {}

