import * as React from 'react';
import { Camera, CameraOff, CheckCircle2, XCircle, Keyboard, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { scanPromotionCoupon } from '@/features/restaurants/services';
import { formatPromotionDiscount } from '@/utils';

type ScanResult =
  | { ok: true; voucherCode: string; promotionTitle: string; discountType: 'percent' | 'cash' | null; discountPercent: string | number | null; userName: string | null; userEmail: string | null; usedAt: string }
  | { ok: false; message: string };

declare global {
  interface Window {
    BarcodeDetector: typeof BarcodeDetector;
  }
}

declare class BarcodeDetector {
  constructor(options?: { formats: string[] });
  detect(image: ImageBitmapSource): Promise<Array<{ rawValue: string }>>;
}

const SCAN_INTERVAL_MS = 800;

export default function RestaurantPromotionScannerPage() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const detectorRef = React.useRef<BarcodeDetector | null>(null);
  const scanIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [result, setResult] = React.useState<ScanResult | null>(null);
  const [manualToken, setManualToken] = React.useState('');
  const [manualMode, setManualMode] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [hasApiSupport, setHasApiSupport] = React.useState(true);

  React.useEffect(() => {
    if (!('BarcodeDetector' in window)) {
      setHasApiSupport(false);
      setManualMode(true);
    }
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (!detectorRef.current) {
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
      }

      setCameraActive(true);
      setScanning(true);

      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current || !detectorRef.current) return;
        const video = videoRef.current;
        if (video.readyState < 2) return;

        try {
          const barcodes = await detectorRef.current.detect(video);
          if (barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            await processQrData(raw);
          }
        } catch {
          // Detection frame errors are expected.
        }
      }, SCAN_INTERVAL_MS);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access denied.';
      setCameraError(msg);
    }
  };

  const processQrData = async (raw: string) => {
    if (processing) return;
    stopCamera();
    setProcessing(true);
    setResult(null);

    try {
      let voucherCode = raw.trim();
      try {
        const parsed = JSON.parse(raw);
        if (parsed.voucherCode) voucherCode = parsed.voucherCode;
        if (parsed.claimToken) voucherCode = parsed.claimToken;
      } catch {
        // Raw string is already the scanned value.
      }

      const data = await scanPromotionCoupon(voucherCode);
      setResult({
        ok: true,
        voucherCode: data.claim.voucher_code,
        promotionTitle: data.claim.promotion_title,
        discountType: data.claim.discount_type,
        discountPercent: data.claim.discount_percent,
        userName: data.claim.user?.name ?? null,
        userEmail: data.claim.user?.email ?? null,
        usedAt: data.claim.used_at,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or already used voucher.';
      setResult({ ok: false, message });
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    await processQrData(manualToken.trim());
    setManualToken('');
  };

  const reset = () => {
    setResult(null);
    setManualToken('');
    if (!manualMode && hasApiSupport) {
      startCamera();
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6EA15C]">Restaurant Portal</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Voucher Scanner</h1>
        <p className="text-neutral-500 font-medium">Scan a customer's voucher QR code or enter the voucher code manually.</p>
      </div>

      {hasApiSupport && (
        <div className="flex gap-2">
          <Button
            variant={!manualMode ? 'default' : 'outline'}
            onClick={() => { setManualMode(false); setResult(null); }}
            className="rounded-xl font-bold gap-2"
          >
            <Camera className="w-4 h-4" /> Camera Scan
          </Button>
          <Button
            variant={manualMode ? 'default' : 'outline'}
            onClick={() => { setManualMode(true); stopCamera(); setResult(null); }}
            className="rounded-xl font-bold gap-2"
          >
            <Keyboard className="w-4 h-4" /> Manual Entry
          </Button>
        </div>
      )}

      {result && (
        <Card className={`rounded-[32px] border-none shadow-xl ${result.ok ? 'bg-green-50' : 'bg-red-50'}`}>
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-4">
              {result.ok ? (
                <CheckCircle2 className="w-12 h-12 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-12 h-12 text-red-400 shrink-0" />
              )}
              <div>
                <p className={`text-2xl font-black tracking-tight ${result.ok ? 'text-green-700' : 'text-red-600'}`}>
                  {result.ok ? 'Voucher Used!' : 'Redemption Failed'}
                </p>
                {result.ok ? (
                  <p className="text-green-600 font-medium">{result.promotionTitle}</p>
                ) : (
                  <p className="text-red-500 font-medium">{'message' in result ? result.message : 'Redemption failed.'}</p>
                )}
              </div>
            </div>

            {result.ok && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 col-span-2">
                  <p className="text-xs font-black uppercase tracking-wide text-neutral-400">Voucher Code</p>
                  <p className="mt-2 font-mono text-lg font-black text-neutral-900 break-all">{result.voucherCode}</p>
                </div>
                {result.discountPercent && (
                  <div className="bg-white rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-[#6EA15C]">
                      {formatPromotionDiscount(result.discountType, result.discountPercent, { includeOff: false })}
                    </p>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Discount</p>
                  </div>
                )}
                {result.userName && (
                  <div className="bg-white rounded-2xl p-4">
                    <p className="font-black text-neutral-800">{result.userName}</p>
                    <p className="text-xs text-neutral-400 truncate">{result.userEmail}</p>
                  </div>
                )}
              </div>
            )}

            <Button onClick={reset} className="w-full h-12 bg-neutral-900 hover:bg-[#6EA15C] text-white rounded-2xl font-black uppercase gap-2">
              <RefreshCw className="w-4 h-4" /> Scan Another
            </Button>
          </CardContent>
        </Card>
      )}

      {processing && (
        <Card className="rounded-[32px] border-none shadow-xl bg-white">
          <CardContent className="p-12 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#6EA15C] border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-neutral-700 uppercase tracking-wide">Verifying voucher...</p>
          </CardContent>
        </Card>
      )}

      {!manualMode && !result && !processing && (
        <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="relative bg-neutral-900 aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white rounded-2xl opacity-60">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#6EA15C] rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#6EA15C] rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#6EA15C] rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#6EA15C] rounded-br-lg" />
                  </div>
                </div>
              )}

              {!cameraActive && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                  <Camera className="w-16 h-16 opacity-40" />
                  <p className="font-bold text-white/60">Camera is off</p>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white px-8">
                  <CameraOff className="w-12 h-12 text-red-400" />
                  <p className="text-sm text-red-300 text-center font-medium">{cameraError}</p>
                </div>
              )}

              {scanning && (
                <Badge className="absolute top-4 left-4 bg-[#6EA15C] text-white border-none animate-pulse">
                  Scanning...
                </Badge>
              )}
            </div>

            <div className="p-6 flex gap-3">
              {!cameraActive ? (
                <Button
                  onClick={startCamera}
                  className="flex-1 h-12 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-2xl font-black uppercase gap-2"
                >
                  <Camera className="w-4 h-4" /> Start Camera
                </Button>
              ) : (
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl font-black uppercase gap-2"
                >
                  <CameraOff className="w-4 h-4" /> Stop Camera
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(manualMode || !hasApiSupport) && !result && !processing && (
        <Card className="rounded-[32px] border-none shadow-xl bg-white">
          <CardContent className="p-8 space-y-4">
            <p className="text-sm font-bold text-neutral-500">
              {hasApiSupport
                ? 'Enter the voucher code manually (paste from clipboard or type).'
                : 'Your browser does not support the camera scanner. Enter the voucher code manually.'}
            </p>
            <form onSubmit={handleManualSubmit} className="flex gap-3">
              <Input
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste voucher code here..."
                className="flex-1 h-12 rounded-2xl font-mono text-sm"
              />
              <Button
                type="submit"
                disabled={!manualToken.trim()}
                className="h-12 px-6 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-2xl font-black uppercase"
              >
                Redeem
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
