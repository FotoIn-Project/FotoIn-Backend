// receipt.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReceiptService } from './receipt.service';

@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get()
  async getInvoice(@Res() res: Response) {
    try {
      const pdfBuffer = await this.receiptService.generateInvoice();
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=invoice.pdf',
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (error) {
      res.status(500).send('Error generating PDF');
    }
  }
}
