import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, ObjectLiteral, Repository } from 'typeorm';
import { AdminReportQueryDto } from './dto/admin-report-query.dto';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { PremiumPackage } from 'src/premium_packages/entities/premium_package.entity';

type TimeSeriesPoint = { bucket: string; value: number };
type Segment = 'day' | 'week' | 'month';

@Injectable()
export class AdminReportsService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
    @InjectRepository(DailyLog) private readonly dailyLogsRepo: Repository<DailyLog>,
    @InjectRepository(Ingredient) private readonly ingredientsRepo: Repository<Ingredient>,
    @InjectRepository(Meal) private readonly mealsRepo: Repository<Meal>,
    @InjectRepository(Challenge) private readonly challengesRepo: Repository<Challenge>,
    @InjectRepository(PremiumPackage)
    private readonly premiumPackagesRepo: Repository<PremiumPackage>,
  ) {}

  async getReport(query: AdminReportQueryDto) {
    const metric = query.metric ?? 'overview';
    const segment: Segment = (query.segment as Segment) ?? 'day';
    const { start, end } = this.resolveRange(query);

    const metricsRequested =
      metric === 'overview'
        ? ['users', 'posts', 'daily_logs', 'challenges', 'premium_packages']
        : [metric];

    const [totals, seriesEntries] = await Promise.all([
      this.getTotals(),
      Promise.all(
        metricsRequested.map((m) =>
          this.buildTimeSeries(m, start, end, segment).then((value) => ({ metric: m, value })),
        ),
      ),
    ]);

    const timeseries = seriesEntries.reduce<Record<string, TimeSeriesPoint[]>>((acc, curr) => {
      acc[curr.metric] = curr.value;
      return acc;
    }, {});

    return {
      range: { start: start.toISOString(), end: end.toISOString(), segment },
      metrics: metricsRequested,
      totals,
      timeseries,
    };
  }

  private resolveRange(query: AdminReportQueryDto) {
    const end = query.end_date ? new Date(query.end_date) : new Date();
    const start =
      query.start_date != null
        ? new Date(query.start_date)
        : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO8601 strings.');
    }
    if (start > end) {
      throw new BadRequestException('start_date must be before end_date.');
    }
    // normalize to UTC boundaries for consistent grouping
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    return { start, end };
  }

  private async getTotals() {
    const [users, posts, dailyLogs, ingredients, meals, challenges, premiumPackages] =
      await Promise.all([
        this.usersRepo.count(),
        this.postsRepo.count({ where: { deleted_at: IsNull() } }),
        this.dailyLogsRepo.count(),
        this.ingredientsRepo.count({ where: { deleted_at: IsNull() } }),
        this.mealsRepo.count({ where: { deleted_at: IsNull() } }),
        this.challengesRepo.count({ where: { deleted_at: IsNull() } }),
        this.premiumPackagesRepo.count({ where: { deleted_at: IsNull() } }),
      ]);

    return {
      users,
      posts,
      daily_logs: dailyLogs,
      ingredients,
      meals,
      challenges,
      premium_packages: premiumPackages,
    };
  }

  private async buildTimeSeries(
    metric: string,
    start: Date,
    end: Date,
    segment: Segment,
  ): Promise<TimeSeriesPoint[]> {
    switch (metric) {
      case 'users':
        return this.groupByDate(this.usersRepo, 'created_at', start, end, segment, 'u');
      case 'posts':
        return this.groupByDate(
          this.postsRepo,
          'created_at',
          start,
          end,
          segment,
          'p',
          `${'p'}.deleted_at IS NULL`,
        );
      case 'daily_logs':
        // daily_logs uses a "date" column (date type)
        return this.groupByDate(this.dailyLogsRepo, 'date', start, end, segment, 'd');
      case 'challenges':
        return this.groupByDate(
          this.challengesRepo,
          'created_at',
          start,
          end,
          segment,
          'c',
          `${'c'}.deleted_at IS NULL`,
        );
      case 'premium_packages':
        return this.groupByDate(
          this.premiumPackagesRepo,
          'updated_at',
          start,
          end,
          segment,
          'pp',
          `${'pp'}.deleted_at IS NULL`,
        );
      case 'ingredients':
        return this.groupByDate(
          this.ingredientsRepo,
          'created_at',
          start,
          end,
          segment,
          'i',
          `${'i'}.deleted_at IS NULL`,
        );
      case 'meals':
        return this.groupByDate(
          this.mealsRepo,
          'created_at',
          start,
          end,
          segment,
          'm',
          `${'m'}.deleted_at IS NULL`,
        );
      default:
        throw new BadRequestException(`Unsupported metric "${metric}".`);
    }
  }

  private async groupByDate<T extends ObjectLiteral>(
    repo: Repository<T>,
    dateColumn: string,
    start: Date,
    end: Date,
    segment: Segment,
    alias: string,
    extraWhere?: string,
  ): Promise<TimeSeriesPoint[]> {
    const dateExpr = `${alias}.${dateColumn}`;
    const bucketExpr = `date_trunc(:segment, ${dateExpr}::timestamptz)`;

    const qb = repo
      .createQueryBuilder(alias)
      .select(bucketExpr, 'bucket')
      .addSelect('COUNT(*)::int', 'value')
      .where(`${dateExpr} BETWEEN :start AND :end`, { start, end })
      .setParameter('segment', segment);

    if (extraWhere) {
      qb.andWhere(extraWhere);
    }

    const rows: { bucket: Date; value: string | number }[] = await qb
      .groupBy(bucketExpr)
      .orderBy(bucketExpr, 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      bucket: new Date(row.bucket).toISOString(),
      value: typeof row.value === 'string' ? parseInt(row.value, 10) : Number(row.value),
    }));
  }
}
