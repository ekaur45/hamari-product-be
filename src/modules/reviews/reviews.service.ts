import { BadRequestException, Injectable } from "@nestjs/common";
import AddReviewDto from "./dto/add-review.dto";
import User from "src/database/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import Review from "src/database/entities/review.entity";
import { Repository } from "typeorm";
import TeacherBooking from "src/database/entities/teacher-booking.entity";

@Injectable({
})
export default class ReviewsService{
    constructor(
        @InjectRepository(Review)
        private readonly review:Repository<Review>,
        @InjectRepository(TeacherBooking)
        private readonly teacherBooking:Repository<TeacherBooking>
    ){

    }

    async addReview(body:AddReviewDto,user:User){
        const bookingDetails = await this.teacherBooking.findOne({where:{id:body.teacherBookingId},relations:['teacher']});
        if(!bookingDetails){
            throw new BadRequestException("Booking does not exist for review.");
        }

        const review = await this.review.findOne({where:{reviewerId:user.id,teacherBookingId:body.teacherBookingId}});
        if(review){
            throw new BadRequestException("You have already added review for this booking.");
        }
        const addReviewData:Partial<Review> = {
            reviewerId:user.id,
            revieweeId:bookingDetails.teacher.userId,
            punctuality:body.punctuality,
            engagement:body.engagement,
            knowledge:body.knowledge,
            communication:body.communication,
            overallExperience:body.overallExperience,
            rating:body.rating,
            comment:body.comment,
            teacherBookingId:body.teacherBookingId
        };
        return await this.review.save(addReviewData);
    }
}