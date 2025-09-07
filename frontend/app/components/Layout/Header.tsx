'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUser, Menu, LayoutDashboard, BrainCircuit, Network, Lightbulb, Bell, Search } from 'lucide-react';

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from '../theme-toggle';

const primaryNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/predictions', label: 'Predictions', icon: BrainCircuit },
    { href: '/impact', label: 'Impact', icon: Network },
    { href: '/recommendations', label: 'Recommendations', icon: Lightbulb },
];

export default function Header() {
    const pathname = usePathname();

    const NavLinks = () => (
        <>
            {primaryNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`relative px-4 py-2 rounded-lg transition-all duration-300 font-medium group ${
                            isActive 
                                ? 'text-primary bg-primary/10 shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                        <span className="relative z-10 flex items-center space-x-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </span>
                        {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20" />
                        )}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                    </Link>
                )
            })}
        </>
    );

    return (
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-xl px-4 lg:px-6 shadow-sm">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background pointer-events-none" />
            
            {/* Mobile Navigation */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="shrink-0 md:hidden relative z-10 border-border/50 hover:bg-muted/50 hover:border-border transition-all duration-200"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col backdrop-blur-xl bg-background/95">
                    <nav className="grid gap-3 text-lg font-medium mt-4">
                        <Link 
                            href="/dashboard" 
                            className="flex items-center gap-3 text-lg font-bold mb-6 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
                        >
                             <BrainCircuit className="h-6 w-6 text-primary" />
                             <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Rail-Forecast
                             </span>
                        </Link>
                        {primaryNavItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link 
                                    key={item.href} 
                                    href={item.href} 
                                    className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-primary/10 text-primary border border-primary/20' 
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Logo - Mobile */}
            <Link href="/dashboard" className="flex items-center gap-2 font-bold md:hidden relative z-10">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Rail-Forecast
                </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 relative z-10">
                {/* Logo - Desktop */}
                <Link href="/dashboard" className="flex items-center gap-2 font-bold mr-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Rail-Forecast
                    </span>
                </Link>
                <NavLinks />
            </nav>

            {/* Right side actions */}
            <div className="flex w-full items-center gap-3 md:ml-auto md:flex-row-reverse relative z-10">
                {/* Search */}
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-border/50 hover:bg-muted/50 hover:border-border transition-all duration-200"
                >
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                </Button>

                {/* Notifications */}
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="relative border-border/50 hover:bg-muted/50 hover:border-border transition-all duration-200"
                >
                    <Bell className="h-4 w-4" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background animate-pulse" />
                    <span className="sr-only">Notifications</span>
                </Button>

                <ThemeToggle />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-full border-2 border-border/50 hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                                <CircleUser className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        align="end" 
                        className="w-56 bg-background/95 backdrop-blur-xl border-border/50 shadow-xl"
                    >
                        <DropdownMenuLabel className="font-semibold text-foreground">
                            My Account
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CircleUser className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-muted/50 transition-colors cursor-pointer">
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-muted/50 transition-colors cursor-pointer">
                            Support
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem className="hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}