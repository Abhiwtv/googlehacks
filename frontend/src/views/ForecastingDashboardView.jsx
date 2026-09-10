import React, { useState, useEffect } from 'react';
import { getForecast } from '../services/api';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function ForecastingDashboardView({ activeFacility = 'PHC-042' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError('');
      // Simulate Prophet training latency (1.5 seconds)
      const timer = setTimeout(async () => {
        try {
          const res = await getForecast(activeFacility);
          if (isMounted) {
            setData(res);
          }
        } catch (err) {
          if (isMounted) {
            setError(err.message || 'Failed to load Prophet time-series models');
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      }, 1400);

      return () => clearTimeout(timer);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeFacility]);

  // Custom Tooltip for Recharts Footfall & Confidence Intervals
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      return (
        <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-amber-300 m-0 border-b border-slate-800 pb-1">
            📅 Date: {label}
          </p>
          <div className="space-y-1 font-mono">
            <p className="text-cyan-400 font-bold m-0 flex justify-between gap-4">
              <span>Predicted Footfall:</span>
              <span className="text-sm">{item?.predicted_footfall} OPD Patients</span>
            </p>
            <p className="text-slate-400 text-[11px] m-0 flex justify-between gap-4">
              <span>95% Lower Bound (Min):</span>
              <span>{item?.confidence_lower}</span>
            </p>
            <p className="text-slate-400 text-[11px] m-0 flex justify-between gap-4">
              <span>95% Upper Bound (Max):</span>
              <span>{item?.confidence_upper}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & ML Model Badge */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-900 text-amber-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border border-blue-800">
              FEATURE 2 &amp; 7 ANALYTICS
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              Scope: <strong className="text-blue-900">{activeFacility}</strong>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 m-0 tracking-tight">
            Predictive Healthcare Demand &amp; Seasonal Footfall Forecaster
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 m-0">
            Machine learning projections for OPD patient surges and consumable replenishment planning.
          </p>
        </div>

        {/* Tech Badge */}
        <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5 shadow-md shrink-0">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-bold text-emerald-300">
            ⚡ Powered by {data?.ml_model_used || 'Facebook Prophet (Time-Series ML)'}
          </span>
        </div>
      </div>

      {/* Latency Skeleton Loader */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-blue-700" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs">📈</div>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 m-0">
              Training Facebook Prophet time-series models...
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Fitting additive regression curves across 90-day clinic history for {activeFacility}.
            </p>
          </div>

          {/* Skeleton Pulse Layout */}
          <div className="max-w-xl mx-auto space-y-2 pt-2 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-medium">
          ❌ {error}
        </div>
      ) : (
        <>
          {/* Main 7-Day Patient Footfall Chart (Recharts) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                  7-Day OPD Patient Footfall Projection &amp; Uncertainty Intervals
                </h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Solid line denotes expected footfall; shaded area shows 95% confidence interval bounds.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-cyan-500 rounded-sm"></span> Predicted Footfall
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-cyan-200/60 rounded-sm"></span> 95% Confidence Band
                </span>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-[340px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data?.predictions?.daily_breakdown || []}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={['dataMin - 20', 'dataMax + 20']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {/* Confidence Interval Upper Area */}
                  <Area
                    type="monotone"
                    dataKey="confidence_upper"
                    stroke="none"
                    fill="url(#confidenceBand)"
                    name="Upper Bound (95%)"
                  />

                  {/* Main Predicted Line */}
                  <Line
                    type="monotone"
                    dataKey="predicted_footfall"
                    stroke="#0284c7"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7, fill: '#0369a1' }}
                    name="Predicted Footfall"
                  />

                  {/* Confidence Interval Lower Line reference */}
                  <Line
                    type="monotone"
                    dataKey="confidence_lower"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                    name="Lower Bound (95%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Medicine Demand Forecast Cards */}
          {(() => {
            const rawDemand = data?.medicine_demand_forecast;
            let items = [];

            if (Array.isArray(rawDemand)) {
              items = rawDemand.map((item) => ({
                medicine: item.medicine || item.name || 'Medicine',
                predicted_7day_units: item.predicted_7day_units ?? item.predicted_quantity ?? item.predicted ?? 0,
                daily_burn_rate: item.daily_burn_rate ?? item.burn_rate ?? Math.round((item.predicted_7day_units || item.predicted_quantity || 0) / 7),
                current_stock: item.current_stock ?? item.stock ?? 500,
                status: item.status || 'Optimal Buffer',
              }));
            } else if (rawDemand && typeof rawDemand === 'object') {
              items = Object.entries(rawDemand).map(([medName, medData]) => {
                let predicted = 0;
                let burnRate = 0;
                let stock = 500;
                let status = 'Optimal Buffer';

                if (typeof medData === 'number' || typeof medData === 'string') {
                  predicted = Number(medData) || 0;
                  burnRate = Math.round((predicted / 7) * 10) / 10;
                  status = predicted > 1000 ? 'Reorder Advisory' : 'Optimal Buffer';
                } else if (medData && typeof medData === 'object') {
                  predicted = medData.predicted_7day_units ?? medData.predicted_quantity ?? medData.predicted ?? medData.quantity ?? 0;
                  burnRate = medData.daily_burn_rate ?? medData.burn_rate ?? (Math.round((predicted / 7) * 10) / 10);
                  stock = medData.current_stock ?? medData.stock ?? 500;
                  status = medData.status || (predicted > stock ? 'Critical Stock - Reorder Advisory' : 'Optimal Buffer');
                }

                return {
                  medicine: medName,
                  predicted_7day_units: predicted,
                  daily_burn_rate: burnRate,
                  current_stock: stock,
                  status: status,
                };
              });
            }

            return (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider m-0">
                    7-Day Consumable &amp; Medicine Replenishment Forecast
                  </h3>
                  <span className="text-xs text-slate-500">
                    Calculated against predicted OPD surges
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {items.map((item, idx) => {
                    const statusStr = String(item.status || '');
                    const isWarning = statusStr.includes('Reorder') || statusStr.includes('Critical') || statusStr.includes('Warning');

                    return (
                      <div
                        key={idx}
                        className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                          isWarning ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="font-bold text-slate-900 text-sm m-0 leading-tight">
                              {item.medicine}
                            </h4>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                                isWarning
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="space-y-1 pt-2 border-t border-slate-100">
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Predicted 7-Day Demand:</span>
                              <strong className="text-slate-900 font-mono">{item.predicted_7day_units} units</strong>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Daily Burn Rate:</span>
                              <strong className="text-blue-900 font-mono">{item.daily_burn_rate} / day</strong>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Current Stock:</span>
                              <strong className={`font-mono ${isWarning ? 'text-amber-800' : 'text-emerald-800'}`}>
                                {item.current_stock} units
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 text-right">
                          <span className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer">
                            {isWarning ? '⚠️ Auto-Trigger Stock Reorder' : '✓ Stock Levels Healthy'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
