export default function Spinner() {
  return (
    <div className="flex items-center justify-center p-8 animate-fade-in">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-slate-700" />
        <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-primary absolute inset-0 animate-spin" />
        <div className="absolute inset-0 w-10 h-10 rounded-full bg-primary/10 blur-md" />
      </div>
    </div>
  );
}