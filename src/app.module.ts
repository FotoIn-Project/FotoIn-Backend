import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { ProfileUserModule } from './profile-user/profile-user.module';
import { AuthModule } from './auth/auth.module';
import { DataSource } from 'typeorm';
import { EmailService } from './utils/email/email.service';
import { CatalogModule } from './catalog/catalog.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigService } from '@nestjs/config/dist';
import { PortfolioModule } from './portofolio/portofolio.module';
import { NotificationModule } from './notification/notification.module';
import { CartModule } from './cart/cart.module';
import { ChatModule } from './chat/chat.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BookingModule } from './booking/booking.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username : "fotoin",
      password : "Lampasi0208!",
      database : "fotoin",
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
  }),
    CatalogModule,
    UsersModule,
    ProfileUserModule,
    AuthModule,
    CatalogModule,
    PortfolioModule,
    NotificationModule,
    CartModule,
    ChatModule,
    TransactionsModule,
    BookingModule,
    StoreModule,
  ],
  controllers: [],
  providers: [EmailService, ConfigService],
})

export class AppModule {
  constructor(private dataSource: DataSource) {}
}

