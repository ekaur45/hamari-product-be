import { Module } from '@nestjs/common';
import SharedModule from 'src/modules/shared/shared.module';
import { AdminClassesController } from './classes.controller';
import { AdminClassesService } from './classes.service';

@Module({
    imports: [SharedModule],
    controllers: [AdminClassesController],
    providers: [AdminClassesService],
    exports: [AdminClassesService],
})
export class AdminClassesModule {}

