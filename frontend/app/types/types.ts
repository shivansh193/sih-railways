export interface Train {
  id: string;
  current_station: string;
  next_station: string;
  status: 'On-Time' | 'Delayed' | 'Critical';
  delay_minutes: number;
}

export interface KPI {
  id: string;
  title: string;
  value: string;
  change: number;
  status: 'good' | 'warning' | 'critical';
}

export interface Prediction {
  train_id: string;
  predicted_delay: number;
  explanation: Record<string, number>;
  confidence_score: number;
}

export interface AffectedTrain {
  train_id: string;
  additional_delay: number;
}

export interface ImpactAnalysis {
  primary_train: string;
  affected_train_count: number;
  total_delay_minutes: number;
  affected_trains: AffectedTrain[];
}

export interface Recommendation {
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  confidence: number;
}

export interface Alert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actions?: { label: string; action: () => void }[];
}