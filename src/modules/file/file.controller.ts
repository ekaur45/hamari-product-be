import { Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../shared/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiResponseModel } from "../shared/models/api-response.model";
import { FileService } from "./file.service";
import { diskStorage } from "multer";

@ApiTags('File')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
                cb(null, `${randomName}-${file.originalname}`);
            },
        }),
        limits: {
            fileSize: 1024 * 1024 * 100, // 5MB
        },
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @ApiResponse({
        status: 200,
        description: 'File uploaded successfully',
        type: ApiResponseModel<{ url: string }>,
    })
    async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<ApiResponseModel< { url: string }>> {
        
        const url = `/uploads/${file.filename}`;
        return ApiResponseModel.success({ url }, 'File uploaded successfully');
    }
}