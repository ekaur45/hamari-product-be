import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Log } from "src/database/entities/log.entity";
import { Repository } from "typeorm";

@Injectable()
export class AdminActionLoggerInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, user, body, params, query } = req;

    return next.handle().pipe(
      tap(() => {
        // Fire-and-forget logging; errors here should not break the request flow.
        const entry = this.logRepository.create({
          level: 'info',
          message: `${method} ${originalUrl}`,
          context: 'admin-action',
          metadata: {
            userId: user?.id,
            role: user?.role,
            params,
            query,
            // avoid storing full body for sensitive endpoints; keep small snapshot
            body: body ? Object.keys(body) : undefined,
          },
        });
        this.logRepository.save(entry).catch(() => {});
      }),
    );
  }
}

