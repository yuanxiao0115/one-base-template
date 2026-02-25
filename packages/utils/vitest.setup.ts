import { vi } from 'vitest';

// 统一时区，减少日期工具在不同环境下的波动。
process.env.TZ = 'Asia/Shanghai';

// 统一测试时钟，避免依赖当前系统时间导致的偶发失败。
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-05T12:00:00.000Z'));
