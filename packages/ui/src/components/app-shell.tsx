"use client";

interface AppShellProps {
  sidebar: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, header, children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {sidebar}
      <div className="flex flex-1 flex-col overflow-hidden">
        {header}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
