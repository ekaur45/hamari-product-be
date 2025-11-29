import { ConfigService } from '@nestjs/config';

export interface LoggerConfig {
    logDir: string;
    maxFiles: string;
    datePattern: string;
    level: string;
}

export const getLoggerConfig = (configService: ConfigService): LoggerConfig => {
    const nodeEnv = configService.get('NODE_ENV', 'local');

    return {
        logDir: 'logs',
        maxFiles: '14d', // Keep logs for 14 days
        datePattern: 'YYYY-MM-DD',
        level: nodeEnv === 'production' ? 'info' : 'debug',
    };
};
