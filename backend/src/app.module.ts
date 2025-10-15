import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/user.module';
import { ConversationModule } from './modules/conversation.module';
import { MessageModule } from './modules/message.module';
import { AttachedMessageModule } from './modules/attached.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url : process.env.DATABASE_URL,
      // host: process.env.POSTGRES_HOST,
      // port: parseInt(process.env.POSTGRES_PORT ?? '5432'),
      // username: process.env.POSTGRES_USER,
      // password: process.env.POSTGRES_PASSWORD,
      // database: process.env.POSTGRES_DB,
      synchronize: false,
      autoLoadEntities: true,
      ssl: false,
      logging: false,
    }),
    AuthModule,
    ConversationModule,
    UsersModule,
    MessageModule,
    AttachedMessageModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
  }
}
