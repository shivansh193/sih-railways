'use client';

import React, { useState, useEffect } from 'react';
import { getRecommendations } from '../lib/api';
import { ImpactAnalysis, Recommendation } from '../types/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const getPriorityVariant = (priority: Recommendation['priority']) => {
    switch (priority) {
        case 'High': return 'destructive';
        case 'Medium': return 'secondary';
        case 'Low': return 'default';
        default: return 'secondary';
    }
};

export default function RecommendationsPage() {
    const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);
    const [riskLevel, setRiskLevel] = useState<string>('Medium');
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const data = sessionStorage.getItem('impactAnalysis');
        if (data) {
            setImpactAnalysis(JSON.parse(data));
        }
    }, []);

    const handleFetchRecommendations = async () => {
        if (!impactAnalysis) {
            toast.warning('No impact analysis data found.');
            return;
        }
        setLoading(true);
        try {
            const result = await getRecommendations(impactAnalysis, riskLevel);
            setRecommendations(result.recommendations);
            toast.success('Recommendations generated!');
        } catch (error) {
            toast.error('Failed to get recommendations', { description: error instanceof Error ? error.message : 'Unknown error' });
        } finally {
            setLoading(false);
        }
    };

    if (!impactAnalysis) return <div>No impact analysis data. Please start from the predictions page.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Strategic Recommendations</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Generate Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/3">
                         <label className="text-sm font-medium">Risk Level</label>
                        <Select onValueChange={setRiskLevel} value={riskLevel}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select risk level..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleFetchRecommendations} disabled={loading}>
                        {loading ? 'Generating...' : 'Get Recommendations'}
                    </Button>
                </CardContent>
            </Card>

            {recommendations.length > 0 && (
                 <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>Recommendation #{index + 1}</CardTitle>
                                    <Badge variant={getPriorityVariant(rec.priority)}>{rec.priority} Priority</Badge>
                                </div>
                                <CardDescription>Confidence: {rec.confidence.toFixed(2)}%</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>{rec.action}</p>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            )}
        </div>
    );
}