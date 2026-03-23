import { describe, expect, it, vi } from 'vite-plus/test';

import { createStartupProfiler } from '../startup-profiler';

describe('bootstrap/startup-profiler', () => {
  it('应记录阶段耗时并输出完成汇总', async () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
    const now = vi
      .fn<() => number>()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(7)
      .mockReturnValueOnce(11)
      .mockReturnValueOnce(13);
    const profiler = createStartupProfiler({
      logger,
      now
    });

    const result = await profiler.runStage('assemble-routes', () => 'ok', {
      routeCount: 6
    });
    await profiler.runStage('setup-router-guards', () => undefined);
    const summary = profiler.complete({
      baseUrl: '/admin'
    });

    expect(result).toBe('ok');
    expect(summary.status).toBe('success');
    expect(summary.totalDurationMs).toBe(13);
    expect(summary.stages).toEqual([
      {
        name: 'assemble-routes',
        durationMs: 3,
        details: {
          routeCount: 6
        }
      },
      {
        name: 'setup-router-guards',
        durationMs: 4
      }
    ]);
    expect(summary.details).toEqual({
      baseUrl: '/admin'
    });
    expect(logger.info).toHaveBeenCalledWith('启动完成', summary);
  });

  it('应输出失败汇总并保留错误信息', () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
    const now = vi.fn<() => number>().mockReturnValueOnce(0).mockReturnValueOnce(9);
    const profiler = createStartupProfiler({
      logger,
      now
    });
    const error = new Error('boom');

    const summary = profiler.fail(error, {
      stage: 'create-router'
    });

    expect(summary).toEqual({
      status: 'error',
      totalDurationMs: 9,
      stages: [],
      details: {
        stage: 'create-router'
      },
      error: {
        message: 'boom',
        name: 'Error'
      }
    });
    expect(logger.error).toHaveBeenCalledWith('启动失败', summary, error);
  });
});
