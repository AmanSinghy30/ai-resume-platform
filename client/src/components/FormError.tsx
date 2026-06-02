interface FormErrorProps {
  message?: string;
}

const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <p className="text-red-500 text-sm mt-1">
      {message}
    </p>
  );
};

export default FormError;