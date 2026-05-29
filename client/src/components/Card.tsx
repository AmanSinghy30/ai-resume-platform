type CardProps = {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-md ${className}`}>
      {children}
    </div>
  );
}