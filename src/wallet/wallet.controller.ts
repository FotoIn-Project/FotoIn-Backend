import { Controller, Post, Body, Get, Param, Patch, Query, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletTransactionDto, TransactionStatus } from './dto/create-wallet.dto';
import { UpdateTransactionStatusDto } from './dto/update-wallet.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('transaction')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async createTransaction(@Body() createWalletTransactionDto: CreateWalletTransactionDto, @Req() req) {
    const currentUser = req.user;
    const transaction = await this.walletService.createTransaction(createWalletTransactionDto, currentUser.id);
    return {
      statusCode: 201,
      message: 'Transaction created successfully',
      result: transaction,
    };
  }

  @Patch('transaction/status')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async updateTransactionStatus(@Body() updateTransactionStatusDto: UpdateTransactionStatusDto) {
    const result = await this.walletService.updateTransactionStatus(updateTransactionStatusDto);
    return {
      statusCode: 200,
      message: 'Transaction status updated successfully',
      result: result,
    };
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@Req() req) {
    const currentUser = req.user;
    const balance = await this.walletService.getBalance(currentUser.id);
    return {
      statusCode: 200,
      message: 'Balance retrieved successfully',
      saldo: balance,
    };
  }

  @Get('history/withdraw')
  @UseGuards(JwtAuthGuard)
  async getWithdrawHistory(@Req() req) {
    const currentUser = req.user
    const result = await this.walletService.getWithdrawHistory(currentUser.id);
    return {
      statusCode: 200,
      message: 'Withdraw history retrieved successfully',
      result: result,
    };
  }

  @Get('history/income')
  @UseGuards(JwtAuthGuard)
  async getIncomeHistory(@Req() req) {
    const currentUser = req.user
    const result = await this.walletService.getIncomeHistory(currentUser.id);
    return {
      statusCode: 200,
      message: 'Income history retrieved successfully',
      result: result,
    };
  }

  @Get('withdraw/inprogress')
  @UseGuards(JwtAuthGuard)
  async getWithdrawInProgress(@Query('status') status: TransactionStatus) {
    const inProgressWithdrawals = await this.walletService.getWithdrawByStatus(status);
    return {
      statusCode: 200,
      message: 'Withdrawals in progress retrieved successfully',
      result: inProgressWithdrawals,
    };
  }
}
