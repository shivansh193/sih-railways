'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getKpis, getSimulationState } from '../lib/api';
import { KPI, Train } from '../types/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, Clock, TrainFront, AlertTriangle, Activity } from 'lucide-react';

const getStatusVariant = (status: Train['status']) => {
    switch (status) {
        case 'On-Time': return 'default';
        case 'Delayed': return 'secondary';
        case 'Critical': return 'destructive';
        default: return 'outline';
    }
};

function DelayedTrainsChart({ trains }: { trains: Train[] }) {
    const chartData = useMemo(() => {
        return trains
            .filter(train => train.delay_minutes > 0)
            .sort((a, b) => b.delay_minutes - a.delay_minutes)
            .slice(0, 5)
            .map(train => ({ 
                name: train.id, 
                delay: train.delay_minutes
            }));
    }, [trains]);

    if (chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-muted-foreground font-medium">
                    All trains running on time! 🎉
                </p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
                <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip 
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                    }}
                />
                <Bar 
                    dataKey="delay" 
                    fill="hsl(var(--warning))"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}

const kpiIcons = {
    on_time_percentage: CheckCircle,
    average_delay: Clock,
    active_trains: TrainFront,
};

export default function DashboardPage() {
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [trains, setTrains] = useState<Train[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setError(null);
                const [kpiData, simData] = await Promise.all([getKpis(), getSimulationState()]);
                setKpis(kpiData.kpis);
                setTrains(simData.trains);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                setError("Failed to connect to the simulation server. Please ensure the backend is running and refresh.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground font-medium">
                        Connecting to Rail Network...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h2 className="text-2xl font-bold text-destructive mb-2">Connection Failed</h2>
                <p className="text-muted-foreground max-w-md">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            Network Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Real-time monitoring of your railway network performance
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-muted-foreground">Live</span>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {kpis.map((kpi) => {
                        const Icon = kpiIcons[kpi.id] || AlertTriangle;
                        
                        return (
                            <Card 
                                key={kpi.id} 
                                className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-xl"></div>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        {kpi.title}
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold mb-1">
                                        {kpi.value}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {kpi.change}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Train Status Table */}
                    <Card className="lg:col-span-4 overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2">
                        <CardHeader className="bg-gradient-to-r from-slate-50/80 to-transparent dark:from-slate-800/80">
                            <CardTitle className="flex items-center space-x-2">
                                <TrainFront className="h-5 w-5" />
                                <span>Live Train Status</span>
                            </CardTitle>
                            <CardDescription>
                                Real-time monitoring of all active trains in the network
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-96 overflow-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                                        <TableRow>
                                            <TableHead className="font-semibold">Train ID</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Current Station</TableHead>
                                            <TableHead className="text-right font-semibold">Delay (min)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trains.length > 0 ? (
                                            trains.map((train) => (
                                                <TableRow 
                                                    key={train.id} 
                                                    className="hover:bg-muted/50 transition-colors"
                                                >
                                                    <TableCell className="font-mono font-medium">
                                                        {train.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusVariant(train.status)}>
                                                            {train.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {train.current_station}
                                                    </TableCell>
                                                    <TableCell className={`text-right font-semibold ${
                                                        train.delay_minutes > 0 
                                                            ? "text-orange-600 dark:text-orange-400" 
                                                            : "text-green-600 dark:text-green-400"
                                                    }`}>
                                                        {train.delay_minutes > 0 ? `+${train.delay_minutes}` : '0'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-32 text-center">
                                                    <div className="flex flex-col items-center space-y-3">
                                                        <TrainFront className="h-12 w-12 text-muted-foreground/30" />
                                                        <p className="text-muted-foreground">No active trains found</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delayed Trains Chart */}
                    <Card className="lg:col-span-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Clock className="h-5 w-5" />
                                <span>Top Delayed Trains</span>
                            </CardTitle>
                            <CardDescription>
                                Trains with the highest current delays
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <DelayedTrainsChart trains={trains} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}