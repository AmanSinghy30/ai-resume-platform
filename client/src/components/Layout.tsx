import Sidebar from './Sidebar';

type LayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default function Layout({ title, children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 md:px-6 py-4 flex items-center gap-4 flex-shrink-0">
          {/* Spacer for mobile hamburger */}
          <div className="w-10 md:hidden flex-shrink-0" />
          <h1 className="text-white font-semibold text-lg">{title}</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

      </div>
    </div>
  );
}