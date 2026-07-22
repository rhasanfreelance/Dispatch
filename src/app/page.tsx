import Feed from "@/components/Feed";

export default function HomePage() {
  return (
    <div>
      <div className="px-4 py-4">
        <h1 className="font-display text-xl font-semibold text-ink">Home</h1>
      </div>
      <Feed />
    </div>
  );
}
