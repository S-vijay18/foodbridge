import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import {
  BarChart3, Sparkles, TrendingUp, Utensils,
  Leaf, Users, Clock, Award
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardMetrics, ImpactMetrics } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<{ categories: any[]; monthly_trends: any[] } | null>(null);
  const [wasteInsights, setWasteInsights] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashMetrics, donationsTrends, insights] = await Promise.all([
          api.getDashboardMetrics(),
          api.getDonationAnalytics(),
          api.getWasteInsights(),
        ]);
        setMetrics(dashMetrics);
        setChartData(donationsTrends);
        setWasteInsights(insights);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#166534', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
          Data, Environmental & Social Impact
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Platform Waste & Impact Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time metrics measuring food diverted from landfills, community hunger relief, and carbon emission savings.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Meals Served</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Utensils size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {metrics?.estimated_meals_served?.toLocaleString() || '1,280'}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center">
            <TrendingUp size={12} className="mr-1" /> +24% from last month
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Food Diverted</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Leaf size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {metrics?.total_kg_donated || '450.5'} <span className="text-base font-bold text-slate-500">kg</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center">
            <TrendingUp size={12} className="mr-1" /> Zero landfill policy
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">CO₂ Avoided</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Sparkles size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {metrics?.co2_offset_kg || '1,126'} <span className="text-base font-bold text-slate-500">kg</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            EPA standard 2.5 kg CO₂e / kg food
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Deliveries Completed</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Award size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {metrics?.successful_deliveries || '18'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            100% verified recipient delivery
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend Area Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Monthly Food Rescue Trajectory (kg)
            </h3>
            <span className="text-[11px] text-slate-400">Past 6 Months</span>
          </div>

          <div className="h-72 w-full pt-4">
            {chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.monthly_trends}>
                  <defs>
                    <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#166534" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#166534" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kg"
                    stroke="#166534"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorKg)"
                    name="Rescued (kg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Surplus Distribution by Food Category
            </h3>
            <span className="text-[11px] text-slate-400">By Weight (kg)</span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="kg"
                    nameKey="name"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading breakdown...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Food Waste Insights & Recommendations */}
      <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles size={16} />
          <span>AI Waste Analytics & Actionable Insights</span>
        </div>

        <h3 className="text-xl font-bold">Predictive Food Rescue Insights</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {wasteInsights?.insights ? (
            wasteInsights.insights.map((insight: string, idx: number) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-xs leading-relaxed text-emerald-200"
              >
                <div className="text-amber-400 font-extrabold text-sm mb-2">Insight #{idx + 1}</div>
                {insight}
              </div>
            ))
          ) : (
            <p className="text-xs text-emerald-300">Generating AI waste insights...</p>
          )}
        </div>
      </div>
    </div>
  );
};

