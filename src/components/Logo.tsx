
interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  minimized?: boolean;
}

export function Logo({ className = '', size = 'medium', minimized = false }: LogoProps) {
  const sizes = {
    small: 'h-5',
    medium: 'h-7',
    large: 'h-10'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <img 
          src="/logo.png" 
          alt="Weavernote Logo" 
          className={`${sizes[size]} w-auto`}
        />
      </div>
      {!minimized && (
        <span className={`font-bold ${sizes[size]} text-gray-900 tracking-tight`}>
          Weavernote
        </span>
      )}
    </div>
  );
}