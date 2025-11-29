import Transport from 'winston-transport';
import { Repository } from 'typeorm';
import { Log } from '../../../database/entities/log.entity';

export class DatabaseTransport extends Transport {
    private logRepository: Repository<Log>;
    private logQueue: any[] = [];
    private batchSize = 10;
    private flushInterval = 5000; // 5 seconds
    private timer: NodeJS.Timeout;

    constructor(opts: any) {
        super(opts);
        this.logRepository = opts.logRepository;

        // Start periodic flush
        this.timer = setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    log(info: any, callback: () => void) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        // Add to queue
        this.logQueue.push({
            level: info.level,
            message: info.message,
            context: info.context || null,
            trace: info.trace || info.stack || null,
            metadata: {
                ...info,
                level: undefined,
                message: undefined,
                context: undefined,
                trace: undefined,
                stack: undefined,
            },
        });

        // Flush if batch size reached
        if (this.logQueue.length >= this.batchSize) {
            this.flush();
        }

        callback();
    }

    async flush() {
        if (this.logQueue.length === 0) {
            return;
        }

        const logsToInsert = [...this.logQueue];
        this.logQueue = [];

        try {
            await this.logRepository.insert(logsToInsert);
        } catch (error) {
            // Prevent logging errors from crashing the app
            console.error('Failed to insert logs into database:', error);
        }
    }

    close() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.flush();
    }
}
