'use client';

import  { useState } from 'react';
import { toast } from 'sonner';
import { injectScenario, resetSimulation } from '../lib/api';
import { Button } from '../components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'; // New Card components
import { Play, Power, CloudLightning, Wrench } from 'lucide-react';

export default function ScenariosPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleInject = async (scenario: string) => {
        setLoading(scenario);
        try {
            const response = await injectScenario(scenario);
            toast.success('Scenario Injected', { description: response.message });
        } catch (error) {
            toast.error('Injection Failed', { description: error instanceof Error ? error.message : 'Unknown error' });
        } finally {
            setLoading(null);
        }
    };

    const handleReset = async () => {
        setLoading('reset');
        try {
            const response = await resetSimulation();
            toast.success('Simulation Reset', { description: response.message });
        } catch (error) {
            toast.error('Reset Failed', { description: error instanceof Error ? error.message : 'Unknown error' });
        } finally {
            setLoading(null);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Simulation Control Panel</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Inject Scenarios</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Button onClick={() => handleInject('single_breakdown')} disabled={!!loading}>
                        <Wrench className="mr-2 h-4 w-4" />
                        {loading === 'single_breakdown' ? 'Injecting...' : 'Single Breakdown'}
                    </Button>
                    <Button onClick={() => handleInject('weather_disruption')} disabled={!!loading}>
                        <CloudLightning className="mr-2 h-4 w-4" />
                        {loading === 'weather_disruption' ? 'Injecting...' : 'Weather Disruption'}
                    </Button>
                    <Button onClick={() => handleInject('normal_operations')} disabled={!!loading}>
                        <Play className="mr-2 h-4 w-4" />
                        {loading === 'normal_operations' ? 'Injecting...' : 'Normal Operations'}
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Simulation Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={handleReset} disabled={!!loading}>
                        <Power className="mr-2 h-4 w-4" />
                        {loading === 'reset' ? 'Resetting...' : 'Reset Simulation'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

