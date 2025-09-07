'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { analyzeImpact } from '../lib/api';
import { ImpactAnalysis } from '../types/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function ImpactContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [analysis, setAnalysis] = useState<ImpactAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const trainId = searchParams.get('trainId');
        const delay = searchParams.get('delay');

        if (trainId && delay) {
            const performAnalysis = async () => {
                setLoading(true);
                try {
                    const result = await analyzeImpact(trainId, parseInt(delay, 10));
                    setAnalysis(result);
                } catch (error) {
                    toast.error('Impact Analysis Failed', { description: error instanceof Error ? error.message : 'Unknown error' });
                } finally {
                    setLoading(false);
                }
            };
            performAnalysis();
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    const handleGetRecommendations = () => {
        if (!analysis) return;
        sessionStorage.setItem('impactAnalysis', JSON.stringify(analysis));
        router.push('/recommendations');
    };

    if (loading) return <div>Analyzing impact...</div>;
    if (!analysis) return <div>Missing train data. Please start from the predictions page.</div>;

    return (
         <div className="space-y-6">
            <h1 className="text-3xl font-bold">Network Impact Analysis</h1>
            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>Primary Train</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{analysis.primary_train}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Affected Trains</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{analysis.affected_train_count}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Total Network Delay</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{analysis.total_delay_minutes} min</p></CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Cascade Effect Details</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Affected Train ID</TableHead>
                                <TableHead>Additional Delay (min)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analysis.affected_trains.map(train => (
                                <TableRow key={train.train_id}>
                                    <TableCell>{train.train_id}</TableCell>
                                    <TableCell className="text-warning font-semibold">{train.additional_delay}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Button onClick={handleGetRecommendations} size="lg" className="w-full">Get Recommendations</Button>
        </div>
    );
}

export default function ImpactPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ImpactContent />
        </Suspense>
    )
}