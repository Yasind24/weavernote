import React from 'react';
import { Sidebar } from './Sidebar';
import { NoteList } from './NoteList';
import { Footer } from './Footer';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 h-screen bg-white border-r border-gray-200 transition-all duration-300`}>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children || <NoteList />}
        </div>
        <div className={`hidden sm:block fixed bottom-0 right-0 transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'} bg-white border-t`}>
          <Footer showCredit={false} size="compact" />
        </div>
      </div>
    </div>
  );
}
