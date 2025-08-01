import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export function MetricsCard({ title, value, change, changeType = 'neutral', description }: MetricsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-accent-green';
      case 'negative': return 'text-accent-pink';
      default: return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="w-3 h-3" />;
      case 'negative': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  return (
    <Card className="glass-card hover-accent transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{value}</div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${getChangeColor()} mt-1`}>
            {getChangeIcon()}
            <span>{change}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}