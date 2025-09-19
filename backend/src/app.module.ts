import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/user.module';
import { ConversationModule } from './modules/conversation.module';
import { MessageModule } from './modules/message.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
      autoLoadEntities: true,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false,
      } : false,
      logging: false,
    }),
    AuthModule,
    ConversationModule,
    UsersModule,
    MessageModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
  }
}
