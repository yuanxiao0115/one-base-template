import { createAppLogger } from '@/shared/logger';

type StartupProfilerDetails = Record<string, unknown>;

type StartupProfilerLogger = Pick<ReturnType<typeof createAppLogger>, 'debug' | 'error' | 'info'>;

type StageDetailsResolver<TResult> =
  | StartupProfilerDetails
  | ((result: TResult) => StartupProfilerDetails | undefined)
  | undefined;

export interface StartupProfilerStageRecord {
  name: string;
  durationMs: number;
  details?: StartupProfilerDetails;
}

export interface StartupProfilerSummary {
  status: 'error' | 'success';
  totalDurationMs: number;
  stages: StartupProfilerStageRecord[];
  details?: StartupProfilerDetails;
  error?: {
    message: string;
    name: string;
  };
}

export interface CreateStartupProfilerOptions {
  logger?: StartupProfilerLogger;
  now?: () => number;
}

function hasDetails(
  details: StartupProfilerDetails | undefined
): details is StartupProfilerDetails {
  return !!details && Object.keys(details).length > 0;
}

function resolveErrorSummary(error: unknown): StartupProfilerSummary['error'] {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name
    };
  }
  return {
    message: String(error),
    name: 'Error'
  };
}

export function createStartupProfiler(options: CreateStartupProfilerOptions = {}) {
  const logger = options.logger ?? createAppLogger('bootstrap/startup');
  const now = options.now ?? (() => performance.now());
  const startedAt = now();
  const stages: StartupProfilerStageRecord[] = [];

  async function runStage<TResult>(
    name: string,
    task: () => Promise<TResult> | TResult,
    details?: StageDetailsResolver<TResult>
  ): Promise<TResult> {
    const stageStartedAt = now();
    try {
      const result = await task();
      const resolvedDetails = typeof details === 'function' ? details(result) : details;
      const stage: StartupProfilerStageRecord = {
        name,
        durationMs: now() - stageStartedAt
      };

      if (hasDetails(resolvedDetails)) {
        stage.details = resolvedDetails;
      }

      stages.push(stage);
      logger.debug('启动阶段完成', stage);
      return result;
    } catch (error) {
      logger.error(
        '启动阶段失败',
        {
          name,
          durationMs: now() - stageStartedAt
        },
        error
      );
      throw error;
    }
  }

  function buildSummary(
    status: StartupProfilerSummary['status'],
    details?: StartupProfilerDetails,
    error?: unknown
  ): StartupProfilerSummary {
    const summary: StartupProfilerSummary = {
      status,
      totalDurationMs: now() - startedAt,
      stages: [...stages]
    };

    if (hasDetails(details)) {
      summary.details = details;
    }

    if (status === 'error' && error !== undefined) {
      summary.error = resolveErrorSummary(error);
    }

    return summary;
  }

  function complete(details?: StartupProfilerDetails): StartupProfilerSummary {
    const summary = buildSummary('success', details);
    logger.info('启动完成', summary);
    return summary;
  }

  function fail(error: unknown, details?: StartupProfilerDetails): StartupProfilerSummary {
    const summary = buildSummary('error', details, error);
    logger.error('启动失败', summary, error);
    return summary;
  }

  return {
    runStage,
    complete,
    fail
  };
}
