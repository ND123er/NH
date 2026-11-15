import { QRCodeSVG } from "qrcode.react";

export default function AuthQRCode({ otpauthUri }) {
  const qrValue = otpauthUri;

  if (typeof qrValue !== "string" || !qrValue.trim()) {
    return null;
  }

  return (
    <QRCodeSVG
      value={qrValue}
      size={200}
      level="M"
    />
  );
}