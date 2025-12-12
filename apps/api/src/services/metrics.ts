import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MetricData {
  command: string;
  url?: string;
  sessionId?: string;
  interpretation?: any;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export async function logMetric(data: MetricData): Promise<void> {
  try {
    await prisma.metric.create({
      data: {
        command: data.command,
        url: data.url,
        interpretation: data.interpretation ? JSON.stringify(data.interpretation) : null,
        success: data.success,
        error: data.error,
        timestamp: data.timestamp,
      },
    });
  } catch (error) {
    console.error('Failed to log metric:', error);
  }
}

export async function getMetricsSummary(): Promise<any> {
  try {
    const totalCommands = await prisma.metric.count();
    const successfulCommands = await prisma.metric.count({
      where: { success: true },
    });

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentCommands = await prisma.metric.count({
      where: {
        timestamp: {
          gte: last7Days,
        },
      },
    });

    // Get most used websites
    const topWebsites = await prisma.metric.groupBy({
      by: ['url'],
      _count: true,
      where: {
        url: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          url: 'desc',
        },
      },
      take: 10,
    });

    return {
      totalCommands,
      successfulCommands,
      successRate: totalCommands > 0 ? (successfulCommands / totalCommands) * 100 : 0,
      recentCommands,
      topWebsites: topWebsites.map((w: any) => ({
        url: w.url,
        count: w._count,
      })),
    };
  } catch (error) {
    console.error('Failed to get metrics summary:', error);
    return {
      totalCommands: 0,
      successfulCommands: 0,
      successRate: 0,
      recentCommands: 0,
      topWebsites: [],
    };
  }
}

export async function getCommandHistory(limit: number = 100): Promise<any[]> {
  try {
    const metrics = await prisma.metric.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return metrics.map((m: any) => ({
      id: m.id,
      command: m.command,
      url: m.url,
      success: m.success,
      error: m.error,
      timestamp: m.timestamp,
    }));
  } catch (error) {
    console.error('Failed to get command history:', error);
    return [];
  }
}
