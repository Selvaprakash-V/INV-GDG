'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, ArrowRight, BarChart2, Brain, Info, Lightbulb, RefreshCw, TrendingUp } from 'lucide-react';
import { ErrorState, LoadingState } from '@/features/admin/components/DataState';
import { usePredictiveAnalysis } from '@/features/admin/hooks/useAnalytics';
import CategoryPerformanceChart from '@/features/admin/components/predictive/CategoryPerformanceChart';
import DemandTable from '@/features/admin/components/predictive/DemandTable';
import ExpiryRiskList from '@/features/admin/components/predictive/ExpiryRiskList';
import RecommendationList from '@/features/admin/components/predictive/RecommendationList';
import SalesForecastChart from '@/features/admin/components/predictive/SalesForecastChart';

const OVERVIEW_LIMITS = { risk: 3, recommendations: 4, demand: 5 };

const RECOMMENDATION_FILTERS = [
  { value: 'all', label: 'All', type: undefined },
  { value: 'stock', label: 'Restock', type: 'stock' },
  { value: 'promotion', label: 'Promotions', type: 'promotion' },
  { value: 'expiry', label: 'Expiry', type: 'expiry' },
];

function Section({ Icon, iconClass, title, description, children, footer, className = '' }) {
  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          {Icon && <Icon className={`mr-2 h-5 w-5 ${iconClass}`} aria-hidden="true" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

function MoreLink({ onClick, className, children }) {
  return (
    <Button variant="ghost" className={className} onClick={onClick}>
      {children}
      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
    </Button>
  );
}

/** Demand forecast and expiry-risk view backed by GET /api/analytics?type=predictive. */
export default function PredictiveAnalysis() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data, error, loading, refetch } = usePredictiveAnalysis();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="mr-3 h-8 w-8 text-purple-600" aria-hidden="true" />
            Predictive Analysis
          </h2>
          <p className="text-gray-600 mt-1">Demand forecasts and expiry risk based on your recorded sales</p>
        </div>
        <Button onClick={refetch} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          {loading ? 'Refreshing…' : 'Refresh Analysis'}
        </Button>
      </div>

      {data?.method && (
        <p className="flex items-start gap-2 text-sm text-gray-600 bg-white/70 border border-gray-200 rounded-lg p-3">
          <Info className="h-4 w-4 mt-0.5 text-purple-600 shrink-0" aria-hidden="true" />
          <span>
            Method: {data.method}. The 7-day projection is a straight-line trend fitted to daily revenue; treat it as a rough
            guide, not a guarantee.
          </span>
        </p>
      )}

      {error && !data ? (
        <ErrorState error={error} title="Could not load predictive analysis" onRetry={refetch} />
      ) : !data ? (
        <LoadingState label="Analysing sales history…" />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Demand</TabsTrigger>
            <TabsTrigger value="expiry">Expiry Risk</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section
                Icon={TrendingUp}
                iconClass="text-purple-600"
                title="Sales Forecast"
                description="Daily revenue for the last 30 days and the next 7 days projected"
                footer={<MoreLink className="text-purple-600 hover:bg-purple-50" onClick={() => setActiveTab('sales')}>View demand by product</MoreLink>}
              >
                <SalesForecastChart salesTrend={data.salesTrend} forecast={data.forecast} />
              </Section>
              <Section
                Icon={AlertTriangle}
                iconClass="text-orange-500"
                title="Expiry Risk"
                description="Products likely to expire before they sell at current demand"
                footer={<MoreLink className="text-orange-500 hover:bg-orange-50" onClick={() => setActiveTab('expiry')}>View all at-risk products</MoreLink>}
              >
                <ExpiryRiskList rows={data.expiryRisk} limit={OVERVIEW_LIMITS.risk} compact />
              </Section>
            </div>
            <Section
              Icon={Lightbulb}
              iconClass="text-yellow-500"
              title="Recommendations"
              description="Suggestions derived from demand, stock cover and expiry dates"
              footer={<MoreLink className="text-yellow-600 hover:bg-yellow-50" onClick={() => setActiveTab('recommendations')}>View all recommendations</MoreLink>}
            >
              <RecommendationList recommendations={data.recommendations} limit={OVERVIEW_LIMITS.recommendations} columns={2} />
            </Section>
            <Section Icon={BarChart2} iconClass="text-blue-500" title="Fastest-moving Products" description="Highest predicted daily demand">
              <DemandTable rows={data.predictedDemand} limit={OVERVIEW_LIMITS.demand} />
            </Section>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Section
              Icon={TrendingUp}
              iconClass="text-purple-600"
              title="Sales Trend & Projection"
              description={`Based on ${data.observedDays} day(s) of observed sales`}
            >
              <SalesForecastChart salesTrend={data.salesTrend} forecast={data.forecast} height="h-80" />
            </Section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Section className="lg:col-span-2" title="Predicted Demand" description="Units per day / week / month at the current sales rate; cover = days of stock left">
                <DemandTable rows={data.predictedDemand} />
              </Section>
              <Section title="Category Performance" description="Units sold per category in the lookback window">
                <CategoryPerformanceChart data={data.categoryPerformance} />
              </Section>
            </div>
          </TabsContent>

          <TabsContent value="expiry" className="space-y-6">
            <Section
              Icon={AlertTriangle}
              iconClass="text-orange-500"
              title="Expiry Risk Analysis"
              description="Risk score = share of current stock projected to remain unsold at expiry"
            >
              <ExpiryRiskList rows={data.expiryRisk} />
            </Section>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Section Icon={Lightbulb} iconClass="text-yellow-500" title="Recommendations" description="Restock, promotion and expiry suggestions">
              <Tabs defaultValue="all">
                <TabsList className="mb-4 flex-wrap h-auto">
                  {RECOMMENDATION_FILTERS.map((f) => (
                    <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>
                  ))}
                </TabsList>
                {RECOMMENDATION_FILTERS.map((f) => (
                  <TabsContent key={f.value} value={f.value}>
                    <RecommendationList recommendations={data.recommendations} type={f.type} />
                  </TabsContent>
                ))}
              </Tabs>
            </Section>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
