import { Module } from "@nestjs/common";
import ReviewsController from "./reviews.controller";
import ReviewsService from "./reviews.service";
import SharedModule from "../shared/shared.module";

@Module({
    imports:[SharedModule],
    controllers:[ReviewsController],
    providers:[ReviewsService]
})
export default class ReviewsModule{

}