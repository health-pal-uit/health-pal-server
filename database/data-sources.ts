import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { DataSource, DataSourceOptions } from "typeorm";

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule.forRoot()],
    inject: [ConfigService], // injecttttttttt configservice
    useFactory: async (configService : ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: +configService.get("DB_PORT", 5432),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'], // change later
        autoLoadEntities: true,
        migrations: [__dirname + '/../migrations/**/*{.ts,.js}'], // change later
        synchronize: true,
    }),
    
}
    // for cli

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '135792468',
    database: process.env.DB_DATABASE || 'health-pal-db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
}

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;