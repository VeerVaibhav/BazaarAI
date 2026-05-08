export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-dark-muted p-3 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col h-full animate-pulse">
      <div className="aspect-square mb-2 rounded-lg bg-gray-100 dark:bg-dark-border" />
      <div className="flex-1 space-y-2">
        <div className="h-2 w-1/3 bg-gray-100 dark:bg-dark-border rounded" />
        <div className="h-3 w-full bg-gray-100 dark:bg-dark-border rounded" />
        <div className="h-2 w-1/2 bg-gray-100 dark:bg-dark-border rounded" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-4 w-1/3 bg-gray-100 dark:bg-dark-border rounded" />
        <div className="h-8 w-8 bg-gray-100 dark:bg-dark-border rounded-lg" />
      </div>
    </div>
  );
}
