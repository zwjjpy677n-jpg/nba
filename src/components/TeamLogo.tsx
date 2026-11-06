export default function TeamLogo({ src, size = 28 }: { src: string | null; size?: number }) {
  if (!src) return <span className="logo-ph" style={{ width: size, height: size }} />;
  return <img className="logo" src={src} alt="" width={size} height={size} loading="lazy" crossOrigin="anonymous" />;
}
