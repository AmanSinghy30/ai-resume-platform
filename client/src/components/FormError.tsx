import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
}

const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
      <AlertCircle size={12} className="flex-shrink-0" />
      {message}
    </p>
  );
};

export default FormError;