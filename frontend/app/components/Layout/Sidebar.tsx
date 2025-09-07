'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, PlayCircle, AreaChart, Monitor, Settings, HelpCircle, Zap } from 'lucide-react';

const secondaryNavItems = [
    { href: '/scenarios', label: 'Scenarios', icon: PlayCircle, description: 'Run simulations' },
    { href: '/analytics', label: 'Analytics', icon: AreaChart, description: 'Deep insights' },
    { href: '/monitor', label: 'Monitor', icon: Monitor, description: 'Live tracking' },
];

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-gradient-to-b from-muted/30 via-muted/20 to-background/80 backdrop-blur-xl md:block w-64 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex h-full max-h-screen flex-col gap-2 relative z-10">
                {/* Header */}
                <div className="flex h-16 items-center border-b border-border/50 px-6">
                    <Link 
                        href="/dashboard" 
                        className="flex items-center gap-3 font-bold group transition-all duration-200 hover:scale-105"
                    >
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:shadow-lg transition-all duration-200">
                            <BrainCircuit className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Rail-Forecast
                            </span>
                            <span className="text-xs text-muted-foreground -mt-1">
                                AI-Powered Railway Intelligence
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 px-4 py-6">
                    <div className="space-y-2">
                        <div className="px-3 py-2">
                            <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                                <Zap className="mr-2 h-3 w-3" />
                                Quick Actions
                            </h3>
                        </div>
                        <nav className="grid gap-2">
                            {secondaryNavItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                                            isActive 
                                                ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/20 shadow-sm' 
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        {/* Active indicator */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                                        )}
                                        
                                        {/* Icon */}
                                        <div className={`p-2 rounded-lg transition-all duration-200 ${
                                            isActive 
                                                ? 'bg-primary/20 text-primary' 
                                                : 'bg-muted/50 group-hover:bg-muted'
                                        }`}>
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">
                                                {item.label}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.description}
                                            </div>
                                        </div>

                                        {/* Hover effect */}
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Stats Card */}
                    <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/20">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-foreground">Network Health</h4>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            98.2%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            System operational
                        </p>
                        <div className="mt-2 w-full bg-muted/50 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full w-[98%]"></div>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="border-t border-border/50 p-4 space-y-2">
                    {bottomNavItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 text-sm ${
                                    isActive 
                                        ? 'bg-muted text-foreground' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                    
                    {/* Version info */}
                    <div className="pt-2 border-t border-border/30">
                        <div className="text-xs text-muted-foreground text-center">
                            Version 2.1.0
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}