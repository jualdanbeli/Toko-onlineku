import { Browser } from "@capacitor/browser";

export async function openMidtransPayment(snapUrl: string): Promise<void> {
  const isSandbox = /^https:\/\/app\.sandbox\.midtrans\.com\//.test(snapUrl);
  const isProduction = /^https:\/\/app\.midtrans\.com\//.test(snapUrl);

  if (!isSandbox && !isProduction) {
    throw new Error("URL pembayaran Midtrans tidak valid");
  }

  await Browser.open({
    url: snapUrl,
  });
}
