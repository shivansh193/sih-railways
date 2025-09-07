'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(var(--foreground), 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(var(--foreground), 1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="flex h-screen relative z-10">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {/* Content wrapper with improved spacing and backdrop */}
            <div className="relative min-h-full">
              {/* Subtle background overlay for content area */}
              <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background/80 backdrop-blur-sm pointer-events-none" />
              
              {/* Main content */}
              <div className="relative z-10 container-fluid section-padding animate-fade-in">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}