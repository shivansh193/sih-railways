'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSimulationState, predictDelay } from '../lib/api';
import { Train, Prediction } from '../types/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // New Select component

export default function PredictionsPage() {
    const [trains, setTrains] = useState<Train[]>([]);
    const [selectedTrain, setSelectedTrain] = useState<string>('');
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchTrains = async () => {
            try {
                const simData = await getSimulationState();
                setTrains(simData.trains);
            } catch (error) {
                toast.error('Failed to fetch trains');
            }
        };
        fetchTrains();
    }, []);

    const handlePredict = async () => {
        if (!selectedTrain) {
            toast.warning('Please select a train first.');
            return;
        }
        setLoading(true);
        setPrediction(null);
        try {
            const result = await predictDelay(selectedTrain, 'current'); // Assuming 'current' scenario
            setPrediction(result);
            toast.success(`Prediction successful for ${selectedTrain}`);
        } catch (error) {
            toast.error('Prediction failed', { description: error instanceof Error ? error.message : 'Unknown error' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleAnalyzeImpact = () => {
        if (!prediction) return;
        sessionStorage.setItem('predictionResult', JSON.stringify(prediction));
        router.push(`/impact?trainId=${prediction.train_id}&delay=${prediction.predicted_delay}`);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">AI Prediction Center</h1>
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Select Train</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select onValueChange={setSelectedTrain} value={selectedTrain}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a train..." />
                            </SelectTrigger>
                            <SelectContent>
                                {trains.map(train => (
                                    <SelectItem key={train.id} value={train.id}>{train.id}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handlePredict} disabled={loading || !selectedTrain} className="w-full">
                            {loading ? 'Predicting...' : 'Predict Delay'}
                        </Button>
                    </CardContent>
                </Card>

                {prediction && (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Prediction for {prediction.train_id}</CardTitle>
                            <CardDescription>
                                Confidence Score: {prediction.confidence_score.toFixed(2)}%
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center p-6 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Predicted Delay</p>
                                <p className="text-5xl font-bold text-warning">{prediction.predicted_delay} min</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Explanation:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {Object.entries(prediction.explanation).map(([key, value]) => (
                                        <li key={key}>
                                            <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {value.toFixed(2)}% impact
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             <Button onClick={handleAnalyzeImpact} className="w-full">
                                Analyze Impact
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

// You will need to create the new Select component
// /components/ui/select.tsx (Add this from shadcn/ui or similar)