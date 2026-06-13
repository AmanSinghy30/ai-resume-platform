type CardProps = {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`glass rounded-2xl p-5 shadow-sm dark:shadow-glass card-hover ${className}`}>
      {children}
    </div>
  );
}