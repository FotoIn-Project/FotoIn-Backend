// receipt.service.ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReceiptService {
  async generateInvoice(): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];

    // Collect data into buffers
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Set PDF metadata
    doc.info.Title = 'Payment Receipt';
    doc.info.Author = 'Your Company Name';

    // Add content to the PDF
    doc.fontSize(20).text('Payment Receipt', { align: 'center' });

    // Separator line
    doc.moveDown(1);
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Invoice Details
    doc.moveDown();
    doc.fontSize(12);
    doc.text('Nomor Invoice:', { continued: true }).text('INV-20240724-001', { align: 'right' });
    doc.text('Tanggal:', { continued: true }).text('24 Juli 2024 | 14:30 WIB', { align: 'right' });
    doc.text('Nama Pelanggan:', { continued: true }).text('Yoli Martika', { align: 'right' });
    doc.text('Alamat Email:', { continued: true }).text('yolimartika10@gmail.com', { align: 'right' });

    // Separator line
    doc.moveDown(1);
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Purchase Details
    doc.moveDown();
    doc.fontSize(14).text('Detail Pembelian');

    doc.moveDown();
    doc.fontSize(12);
    doc.text('Nama Produk/Layanan:', { continued: true }).text('Paket Graduation', { align: 'right' });
    doc.text('Harga Satuan:', { continued: true }).text('Rp 100.000', { align: 'right' });
    doc.text('Jumlah:', { continued: true }).text('1', { align: 'right' });
    doc.text('Subtotal:', { continued: true }).text('Rp 100.000', { align: 'right' });
    doc.text('Biaya tambahan:', { continued: true }).text('biaya admin Rp 4.000', { align: 'right' });

    // Separator line
    doc.moveDown(1);
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Total
    doc.moveDown();
    doc.fontSize(14).text('Total:', { continued: true }).text('Rp 104.000', { align: 'right' });

    // Separator line
    doc.moveDown(1);
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Payment and Transaction Details
    doc.moveDown();
    doc.fontSize(12);
    doc.text('Metode Pembayaran:', { continued: true }).text('Transfer Bank', { align: 'right' });
    doc.text('Nomor Transaksi:', { continued: true }).text('1234567890', { align: 'right' });
    doc.text('Status:', { continued: true }).text('Berhasil', { align: 'center' });

    // Finalize the PDF and end the stream
    doc.end();

    // Wait for the 'end' event before returning the buffer
    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
  }
}


