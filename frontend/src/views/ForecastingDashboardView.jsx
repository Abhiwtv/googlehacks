import React, { useState, useEffect } from 'react';
import { getForecast } from '../services/api';
import ForecastChart from '../components/analytics/ForecastChart';

export default function ForecastingDashboardView({ activeFacility = 'PHC-042' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const res = await getForecast(activeFacility);
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load BigQuery ARIMA_PLUS time-series models');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeFacility]);

  return (
    <div className="space-y-8 pb-8 bg-white">
      {/* Top Header & ML Model Badge */}
      <div className="bg-white border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm font-mono">
              FEATURE 2 &amp; 7 ANALYTICS
            </span>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-sm">
              Scope: <strong className="text-slate-900">{activeFacility}</strong>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 m-0 tracking-tight">
            Predictive Healthcare Demand &amp; Seasonal Footfall Forecaster
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 m-0">
            Machine learning projections for OPD patient surges and consumable replenishment planning.
          </p>
        </div>

        {/* Tech Badge */}
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm font-mono flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600"></span>
          </span>
          <span>⚡ Powered by {data?.ml_model_used || 'Google BigQuery ML (ARIMA_PLUS) - LIVE'}</span>
        </div>
      </div>

      {/* Latency Skeleton Loader */}
      {loading ? (
        <div className="bg-slate-50 rounded-md border border-slate-200 p-12 text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-slate-900" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0 tracking-tight">
              Querying Google BigQuery ML (ARIMA_PLUS)...
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Fetching live ARIMA_PLUS footfall predictions &amp; 7-day consumable demand for {activeFacility}.
            </p>
          </div>

          <div className="max-w-xl mx-auto space-y-2 pt-2 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-md text-xs font-semibold">
          ❌ {error}
        </div>
      ) : (
        <ForecastChart forecastData={data} />
      )}
    </div>
  );
}
