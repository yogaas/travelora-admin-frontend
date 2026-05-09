import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-bg flex font-sans">
      <Sidebar />
      <div className="flex-1 lg:ml-[260px] flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
