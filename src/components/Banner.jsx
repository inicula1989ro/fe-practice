export default function Banner({ banner }) {
  if (!banner) return null;
  return <div className={`banner ${banner.type}`}>{banner.message}</div>;
}
