interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loading({ text = "Đang tải...", size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
      <span className="text-gray-600">{text}</span>
    </div>
  );
}

