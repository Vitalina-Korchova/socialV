import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({
  message = "An error occurred while loading data",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 p-8 text-center">
      <AlertCircle className="h-12 w-12 text-primary" />
      <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
        {message}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Please try again later
      </p>
    </div>
  );
}
