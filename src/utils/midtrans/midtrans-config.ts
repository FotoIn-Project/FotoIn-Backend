// midtrans.config.ts
import * as midtransClient from 'midtrans-client';

export const coreApi = new midtransClient.CoreApi({
  isProduction: false, // Ubah ke true jika sudah produksi
  serverKey: 'SB-Mid-server-XyWkXtPVXPvc8loAzxRm09jV',
  clientKey: 'SB-Mid-client-wmzenE_OaF8tN4bV',
});
