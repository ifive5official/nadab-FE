import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

// 플랫폼에 맞는 방식으로 발급된 PDF 다운로드 주소를 엽니다.
export async function openPdfDownload(
  downloadUrl: string,
  fileName?: string,
) {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: downloadUrl });
    return;
  }

  const link = document.createElement("a");
  link.href = downloadUrl;
  if (fileName) link.download = fileName;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
