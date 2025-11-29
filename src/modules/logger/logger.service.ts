import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { createLogger, Logger as WinstonLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../../database/entities/log.entity';
import { DatabaseTransport } from './transports/database-transport';
import { getLoggerConfig } from './logger.config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
    private logger: WinstonLogger;
    private context?: string;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Log)
        private logRepository: Repository<Log>,
    ) {
        this.initializeLogger();
    }

    private initializeLogger() {
        const config = getLoggerConfig(this.configService);

        const logFormat = format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            format.splat(),
            format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
                let log = `${timestamp} [${level.toUpperCase()}]`;
                if (context) {
                    log += ` [${context}]`;
                }
                log += `: ${message}`;
                if (stack) {
                    log += `\n${stack}`;
                }
                if (Object.keys(meta).length > 0) {
                    log += `\n${JSON.stringify(meta, null, 2)}`;
                }
                return log;
            }),
        );

        // File transport with daily rotation
        const fileTransport = new DailyRotateFile({
            dirname: config.logDir,
            filename: 'application-%DATE%.log',
            datePattern: config.datePattern,
            maxFiles: config.maxFiles,
            format: logFormat,
            level: config.level,
        });

        // Error file transport
        const errorFileTransport = new DailyRotateFile({
            dirname: config.logDir,
            filename: 'error-%DATE%.log',
            datePattern: config.datePattern,
            maxFiles: config.maxFiles,
            format: logFormat,
            level: 'error',
        });

        // Console transport for development
        const consoleTransport = new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.printf(({ timestamp, level, message, context, stack }) => {
                    let log = `${timestamp} ${level}`;
                    if (context) {
                        log += ` [${context}]`;
                    }
                    log += `: ${message}`;
                    if (stack) {
                        log += `\n${stack}`;
                    }
                    return log;
                }),
            ),
        });

        // Database transport
        const databaseTransport = new DatabaseTransport({
            logRepository: this.logRepository,
        });

        this.logger = createLogger({
            level: config.level,
            transports: [
                fileTransport,
                errorFileTransport,
                consoleTransport,
                databaseTransport,
            ],
        });
    }

    setContext(context: string) {
        this.context = context;
    }

    log(message: any, context?: string) {
        this.logger.info(message, { context: context || this.context });
    }

    error(message: any, trace?: string, context?: string) {
        this.logger.error(message, {
            context: context || this.context,
            trace,
        });
    }

    warn(message: any, context?: string) {
        this.logger.warn(message, { context: context || this.context });
    }

    debug(message: any, context?: string) {
        this.logger.debug(message, { context: context || this.context });
    }

    verbose(message: any, context?: string) {
        this.logger.verbose(message, { context: context || this.context });
    }

    // Additional helper methods
    info(message: any, context?: string) {
        this.log(message, context);
    }

    logWithMetadata(level: string, message: string, metadata: any, context?: string) {
        this.logger.log(level, message, {
            context: context || this.context,
            ...metadata,
        });
    }
}
