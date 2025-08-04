import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { CreditCard, Download, Calendar, Zap, Crown, Star, CheckCircle, AlertCircle } from "lucide-react";

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
  used?: string;
}

interface BillingData {
  currentPlan: {
    name: string;
    price: string;
    period: string;
    features: PlanFeature[];
  };
  usage: {
    workflows: {
      used: number;
      limit: number;
      percentage: number;
    };
    storage: {
      used: number;
      limit: number;
      percentage: number;
    };
    apiCalls: {
      used: number;
      limit: number;
      percentage: number;
    };
  };
  nextBilling: string;
  totalSpent: string;
}

const mockBillingData: BillingData = {
  currentPlan: {
    name: "Pro Plan",
    price: "$99",
    period: "month",
    features: [
      { name: "Workflow Executions", included: true, limit: "10,000", used: "6,247" },
      { name: "Storage", included: true, limit: "100 GB", used: "34.2 GB" },
      { name: "API Calls", included: true, limit: "50,000", used: "28,456" },
      { name: "Priority Support", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "Custom Integrations", included: true },
      { name: "Dedicated Infrastructure", included: false },
      { name: "SLA Guarantee", included: false },
    ]
  },
  usage: {
    workflows: {
      used: 6247,
      limit: 10000,
      percentage: 62.5
    },
    storage: {
      used: 34.2,
      limit: 100,
      percentage: 34.2
    },
    apiCalls: {
      used: 28456,
      limit: 50000,
      percentage: 56.9
    }
  },
  nextBilling: "2024-02-15",
  totalSpent: "$297"
};

export function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Billing & Usage
          </h1>
          <p className="text-muted-foreground">Manage your subscription and monitor usage</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Invoice
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Current Plan Card */}
      <Card className="glass-card hover-accent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-primary">{mockBillingData.currentPlan.name}</CardTitle>
                <p className="text-muted-foreground">Current subscription</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{mockBillingData.currentPlan.price}</div>
              <div className="text-sm text-muted-foreground">per {mockBillingData.currentPlan.period}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-primary">Plan Features</h4>
              <div className="space-y-2">
                {mockBillingData.currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {feature.included ? (
                        <CheckCircle className="w-4 h-4 text-accent-green" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                        {feature.name}
                      </span>
                    </div>
                    {feature.limit && (
                      <div className="text-sm text-muted-foreground">
                        {feature.used}/{feature.limit}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-primary">Billing Info</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next billing date</span>
                  <span className="font-medium">{mockBillingData.nextBilling}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total spent this period</span>
                  <span className="font-medium text-primary">{mockBillingData.totalSpent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment method</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>•••• •••• •••• 4242</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover-accent">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Workflow Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {mockBillingData.usage.workflows.used.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {mockBillingData.usage.workflows.limit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={mockBillingData.usage.workflows.percentage} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usage</span>
                <span className="text-primary font-medium">
                  {mockBillingData.usage.workflows.percentage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-accent">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Star className="w-5 h-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {mockBillingData.usage.storage.used} GB
                </span>
                <span className="text-sm text-muted-foreground">
                  / {mockBillingData.usage.storage.limit} GB
                </span>
              </div>
              <Progress 
                value={mockBillingData.usage.storage.percentage} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usage</span>
                <span className="text-primary font-medium">
                  {mockBillingData.usage.storage.percentage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-accent">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Zap className="w-5 h-5" />
              API Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {mockBillingData.usage.apiCalls.used.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {mockBillingData.usage.apiCalls.limit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={mockBillingData.usage.apiCalls.percentage} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usage</span>
                <span className="text-primary font-medium">
                  {mockBillingData.usage.apiCalls.percentage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Alerts */}
      <Card className="glass-card hover-accent border-accent-yellow/30">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent-yellow" />
            Usage Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent-yellow/10 rounded-lg border border-accent-yellow/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent-yellow rounded-full animate-pulse"></div>
                <span className="font-medium">Workflow executions approaching limit</span>
              </div>
              <Badge variant="secondary" className="bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30">
                62.5% Used
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent-green/10 rounded-lg border border-accent-green/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                <span className="font-medium">Storage usage is healthy</span>
              </div>
              <Badge variant="secondary" className="bg-accent-green/20 text-accent-green border-accent-green/30">
                34.2% Used
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card className="glass-card hover-accent">
        <CardHeader>
          <CardTitle className="text-primary">Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Starter</h3>
                <div className="text-2xl font-bold text-primary">$29</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  1,000 workflow executions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  10 GB storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  Basic support
                </li>
              </ul>
            </div>

            <div className="p-4 border-2 border-primary rounded-lg bg-primary/5 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Current</Badge>
              </div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Pro</h3>
                <div className="text-2xl font-bold text-primary">$99</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  10,000 workflow executions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  100 GB storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  Advanced analytics
                </li>
              </ul>
            </div>

            <div className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Enterprise</h3>
                <div className="text-2xl font-bold text-primary">$299</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  Unlimited executions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  1 TB storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  Dedicated support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  SLA guarantee
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 