export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8A3CFF]" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}
