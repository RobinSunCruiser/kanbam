/**
 * Loading state for board page
 * Displays skeleton UI while board data is being fetched
 */
export default function BoardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, colIndex) => (
            <div
              key={colIndex}
              className="bg-white dark:bg-gray-800 rounded-lg p-4"
            >
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />

              <div className="space-y-3">
                {[...Array(3)].map((_, cardIndex) => (
                  <div
                    key={cardIndex}
                    className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 animate-pulse"
                  >
                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
