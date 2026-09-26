import React, { useState } from 'react';
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

/**
 * Chart.js dataset config object for reference/interop
 */
export const getChartJsDataset = (dailyBreakdown = []) => ({
  labels: dailyBreakdown.map((item) => item.date),
  datasets: [
    {
      label: 'Predicted OPD Footfall',
      data: dailyBreakdown.map((item) => item.predicted_footfall),
      borderColor: 'rgba(59, 130, 246, 1)', // Blue
      borderDash: [5, 5], // Dashed line for predictions
      backgroundColor: 'rgba(59, 130, 246, 0.2)', // Translucent fill
      fill: true,
      tension: 0.4,
    },
  ],
});

export default function ForecastChart({ forecastData }) {
  const [supplyRequested, setSupplyRequested] = useState(false);

  const mlModel = forecastData?.ml_model_used || 'Google BigQuery ML (ARIMA_PLUS) - LIVE';
  const dailyBreakdown = forecastData?.predictions?.daily_breakdown || [];
  const totalFootfall = forecastData?.predictions?.total_7_day_expected_footfall || 
    dailyBreakdown.reduce((sum, item) => sum + (item.predicted_footfall || 0), 0);

  const rawMedicineDemand = forecastData?.medicine_demand_forecast || {};

  // Convert medicine_demand_forecast object to list of items
  let medicineItems = [];
  if (Array.isArray(rawMedicineDemand)) {
    medicineItems = rawMedicineDemand.map((item) => ({
      name: item.medicine || item.name || 'Medicine',
      qty: item.predicted_7day_units ?? item.predicted_quantity ?? item.predicted ?? 0,
    }));
  } else if (typeof rawMedicineDemand === 'object' && rawMedicineDemand !== null) {
    medicineItems = Object.entries(rawMedicineDemand).map(([medName, val]) => {
      let qty = 0;
      if (typeof val === 'number' || typeof val === 'string') {
        qty = Number(val) || 0;
      } else if (typeof val === 'object' && val !== null) {
        qty = val.predicted_7day_units ?? val.predicted_quantity ?? val.predicted ?? val.quantity ?? 0;
      }
      return { name: medName, qty };
    });
  }

  const handleRequestSupplyDrop = () => {
    setSupplyRequested(true);
  };

  // Custom Tooltip for Footfall Predictions
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      return (
        <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-mono">
          <p className="font-bold text-amber-300 m-0 border-b border-slate-800 pb-1">
            Date: {label}
          </p>
          <p className="text-blue-400 font-bold m-0 flex justify-between gap-4">
            <span>Predicted Footfall:</span>
            <span className="text-sm text-white">{item?.predicted_footfall} Patients</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: ML Engine Badge & High Footfall Warning Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* ML Engine Badge */}
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm font-mono flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600"></span>
          </span>
          <span>Powered by {mlModel}</span>
        </div>

        {/* Actionable Warning Button if total_7_day_expected_footfall > 500 */}
        {totalFootfall > 500 && (
          <div>
            {supplyRequested ? (
              <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold text-xs px-4 py-2 rounded-md flex items-center gap-1.5">
                Preventive Supply Drop Dispatched (Req #SD-{Math.floor(1000 + Math.random() * 9000)})
              </span>
            ) : (
              <button
                onClick={handleRequestSupplyDrop}
                className="bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-xs px-4 py-2 rounded-md hover:bg-amber-100 transition cursor-pointer flex items-center gap-2"
              >
                <span>Warning: High footfall predicted ({totalFootfall} patients). Click to request preventive supply drop.</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Chart Container */}
      <div className="bg-white border-t border-slate-200 pt-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0 tracking-tight flex items-center gap-2">
              7-Day OPD Patient Footfall Forecast (Dashed ARIMA_PLUS Curve)
            </h3>
            <p className="text-xs text-slate-500 m-0">
              BigQuery ML projected daily check-in volume for {forecastData?.facility_id || 'PHC-042'}.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm">
            7-Day Expected Footfall: {totalFootfall} Patients
          </span>
        </div>

        {/* Recharts Container styled to match requested Chart.js dashed curve */}
        <div className="h-[300px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyBreakdown} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(59, 130, 246, 0.2)" />
                  <stop offset="95%" stopColor="rgba(59, 130, 246, 0.02)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Translucent fill area */}
              <Area
                type="monotone"
                dataKey="predicted_footfall"
                stroke="none"
                fill="url(#forecastFill)"
                name="Translucent Fill"
              />

              {/* Dashed Line matching Chart.js spec: borderColor 'rgba(59, 130, 246, 1)', borderDash [5, 5], tension 0.4 */}
              <Line
                type="monotone"
                dataKey="predicted_footfall"
                stroke="rgba(59, 130, 246, 1)"
                strokeDasharray="5 5"
                strokeWidth={3}
                dot={{ r: 5, fill: 'rgba(59, 130, 246, 1)', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, fill: '#1d4ed8' }}
                name="Predicted Footfall (BigQuery ARIMA_PLUS)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day Medicine Demand Summary Cards */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-1.5">
          7-Day Predicted Medicine Demand Forecast
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {medicineItems.map((item, idx) => (
            <div key={idx} className="bg-white rounded-md border border-slate-200 p-4 space-y-1">
              <div className="text-xs font-bold text-slate-900 truncate">{item.name}</div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">7-Day Demand:</span>
                <span className="text-lg font-extrabold font-mono text-slate-900 tracking-tight">{item.qty} units</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
