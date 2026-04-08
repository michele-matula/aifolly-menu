import QRCode from 'qrcode';

export type QROptions = {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
};

/** Returns a PNG as data URL (data:image/png;base64,...) */
export async function generateQRPng(
  url: string,
  options: QROptions = {},
): Promise<string> {
  const { size = 1024, margin = 2, errorCorrectionLevel = 'M' } = options;
  return QRCode.toDataURL(url, {
    width: size,
    margin,
    errorCorrectionLevel,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

/** Returns a complete SVG string (<svg ...>...</svg>) */
export async function generateQRSvg(
  url: string,
  options: QROptions = {},
): Promise<string> {
  const { margin = 2, errorCorrectionLevel = 'M' } = options;
  return QRCode.toString(url, {
    type: 'svg',
    margin,
    errorCorrectionLevel,
    color: { dark: '#000000', light: '#ffffff' },
  });
}
