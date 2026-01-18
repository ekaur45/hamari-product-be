import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Public')
@Controller('public/api')
export class PublicController {
    @Get('ping')
    ping() {
        return 'pong';
    }
}