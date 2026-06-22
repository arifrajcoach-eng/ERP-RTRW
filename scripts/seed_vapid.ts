import * as webpush from 'web-push';
console.log("webpush module keys:", Object.keys(webpush));
// If default exists, maybe that's the one
if ((webpush as any).default) {
  console.log("webpush.default keys:", Object.keys((webpush as any).default));
}
