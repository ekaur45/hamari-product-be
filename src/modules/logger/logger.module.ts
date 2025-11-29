import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from './logger.service';
import { Log } from '../../database/entities/log.entity';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([Log])],
    providers: [LoggerService],
    exports: [LoggerService],
})
export class LoggerModule { }
