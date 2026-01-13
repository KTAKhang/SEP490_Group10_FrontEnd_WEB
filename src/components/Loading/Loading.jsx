import { Loader2 } from "lucide-react";

const Loading = ({ message = "Đang tải...", fullScreen = false, size = "default" }) => {
  const sizeClasses = {
    small: "h-6 w-6",
    default: "h-8 w-8",
    large: "h-12 w-12",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
        {message && (
          <p className="text-sm text-gray-600 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Loading;
