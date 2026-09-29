import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getSpatialAnomalies, seedSpatialData } from '../../services/api';
import LogisticsModal from './LogisticsModal';

// Standard fallback coordinates for Mumbai localities & facilities
const LOCALITY_COORDS = {
  'Andheri East': { lat: 19.1136, lng: 72.8697 },
  'Bandra West': { lat: 19.0596, lng: 72.8295 },
  'Dharavi': { lat: 19.0402, lng: 72.8508 },
  'Kurla': { lat: 19.0726, lng: 72.8845 },
  'Dadar': { lat: 19.0178, lng: 72.8478 },
  'Thane': { lat: 19.2183, lng: 72.9781 },
  'PHC-001': { lat: 19.1136, lng: 72.8697 },
  'PHC-002': { lat: 19.0596, lng: 72.8295 },
  'PHC-042': { lat: 19.0402, lng: 72.8508 },
  'CHC-101': { lat: 19.0726, lng: 72.8845 },
  'DH-88': { lat: 19.0178, lng: 72.8478 },
};

// Component to dynamically fit map viewport bounds when a route polyline is plotted
function MapBoundsFitter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [60, 60], animate: true });
    }
  }, [bounds, map]);
  return null;
}

export default function SpatialWarRoom({ activeFacility }) {
  const [spatialData, setSpatialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAnomalies = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getSpatialAnomalies(3);
      setSpatialData(data);
    } catch (err) {
      console.error('Spatial scan error:', err);
      setErrorMsg('Failed to fetch spatial anomalies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleSeedMockOutbreak = async () => {
    setSeeding(true);
    try {
      await seedSpatialData();
      await fetchAnomalies();
    } catch (err) {
      console.error('Mock outbreak seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handleRouteCalculated = (routeInfo) => {
    // Resolve coordinates for origin & destination
    const origin = routeInfo.origin_coords ||
      LOCALITY_COORDS[routeInfo.depletedLocality] ||
      LOCALITY_COORDS[routeInfo.depletedFacility] ||
      { lat: 19.1136, lng: 72.8697 };

    const dest = routeInfo.destination_coords ||
      LOCALITY_COORDS[routeInfo.destination_address?.split(',')[0]?.trim()] ||
      LOCALITY_COORDS[routeInfo.redirect_to_facility?.split(' ')[0]] ||
      { lat: 19.0596, lng: 72.8295 };

    setActiveRoute({
      ...routeInfo,
      origin,
      dest,
      polyline: [[origin.lat, origin.lng], [dest.lat, dest.lng]],
    });
  };

  const polylineBounds = useMemo(() => {
    if (!activeRoute || !activeRoute.polyline) return null;
    return activeRoute.polyline;
  }, [activeRoute]);

  const activeAnomalies = spatialData?.active_anomalies || [];
  const regionalEscalations = spatialData?.regional_epidemic_escalations || [];

  return (
    <div className="space-y-8 pb-8 bg-white">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm font-mono">
            National Health Surveillance Engine
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight flex items-center gap-2">
            Global War Room &amp; Spatial Disease Intelligence
          </h2>
          <p className="text-xs text-slate-500 m-0">
            Real-time geospatial outbreak clustering, pathogen footprint tracking, and emergency supply chain corridor routing.
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchAnomalies}
            disabled={loading}
            className="bg-[#063b70] hover:bg-[#052d56] text-white font-medium text-xs px-4 py-2 rounded-md transition shadow-none cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {loading ? (
              <span>Scanning...</span>
            ) : (
              <span>Run Spatial Scan</span>
            )}
          </button>

          <button
            onClick={handleSeedMockOutbreak}
            disabled={seeding}
            className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs px-4 py-2 rounded-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Inject simulated outbreak cases in Andheri East for judges demo"
          >
            {seeding ? (
              <span>Seeding...</span>
            ) : (
              <span>Seed Mock Outbreak (Andheri East)</span>
            )}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs px-4 py-2 rounded-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>Simulate Critical Stockout &amp; Reroute</span>
          </button>
        </div>
      </div>

      {/* Regional Epidemic Alert Banner - Tone down saturation to subtle amber alert as per rule #3 */}
      {regionalEscalations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-md space-y-1.5">
          {regionalEscalations.map((esc, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <div>
                  <strong className="text-xs font-mono font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-sm border border-amber-300">
                    CRITICAL: Regional Epidemic Cluster Detected!
                  </strong>
                  <p className="text-xs font-semibold m-0 mt-1 text-amber-900">
                    Pathogen footprint spans <strong className="text-amber-950 font-bold font-mono">{esc.distance_span_km} km</strong> across{' '}
                    <span className="underline font-bold">{esc.affected_zones?.join(', ')}</span> for symptom cluster:{' '}
                    <strong className="uppercase tracking-wider font-mono text-amber-950">"{esc.symptom}"</strong>.
                  </p>
                </div>
              </div>
              <span className="bg-amber-900 text-amber-50 font-bold text-[10px] px-2.5 py-1 rounded-sm uppercase tracking-wider font-mono shrink-0">
                CRITICAL ESCALATION
              </span>
            </div>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-md text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Main Spatial Map Viewport */}
      <div className="bg-white border-t border-slate-200 pt-6 space-y-4">
        <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-200 gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 m-0 uppercase tracking-wider">
              Geospatial Pathogen Heatmap &amp; Corridor Vector
            </h3>
            <span className="bg-slate-100 text-slate-700 font-mono text-xs px-2.5 py-0.5 rounded-sm border border-slate-200 font-bold">
              Scan Status: Active
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 inline-block border border-rose-700"></span>
              <strong className="text-slate-700">Critical Cluster (&gt;6 cases)</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-amber-600"></span>
              <strong className="text-slate-700">Warning Cluster (&ge;3 cases)</strong>
            </span>
            {activeRoute && (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-slate-900 inline-block border-t border-b border-slate-900"></span>
                <strong className="text-slate-900 font-bold">Emergency Transit Corridor</strong>
              </span>
            )}
          </div>
        </div>

        {/* Leaflet Interactive Map Canvas */}
        <div className="relative w-full h-[520px] rounded-md overflow-hidden border border-slate-200 z-0">
          <MapContainer
            center={[19.0760, 72.8777]}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Fit bounds when polyline is active */}
            {polylineBounds && <MapBoundsFitter bounds={polylineBounds} />}

            {/* Render Threat Anomaly Circle Markers */}
            {activeAnomalies.map((anomaly, idx) => {
              const coords = anomaly.coordinates ||
                LOCALITY_COORDS[anomaly.locality] ||
                LOCALITY_COORDS[anomaly.facility] ||
                { lat: 19.0760 + (idx * 0.03), lng: 72.8777 + (idx * 0.03) };

              const isCritical = anomaly.severity === 'CRITICAL';
              const strokeColor = isCritical ? '#dc2626' : '#d97706';
              const fillColor = isCritical ? '#f87171' : '#fbbf24';
              const radius = Math.max(12, (anomaly.case_count || 3) * 4);

              return (
                <CircleMarker
                  key={idx}
                  center={[coords.lat, coords.lng]}
                  radius={radius}
                  pathOptions={{
                    color: strokeColor,
                    fillColor: fillColor,
                    fillOpacity: 0.65,
                    weight: isCritical ? 3 : 2,
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 space-y-1.5 text-xs font-sans">
                      <div className="flex justify-between items-center gap-2 border-b border-slate-200 pb-1">
                        <strong className="text-slate-900 font-bold">{anomaly.locality}</strong>
                        <span
                          className={`px-1.5 py-0.5 rounded-sm text-[9px] font-extrabold uppercase font-mono border ${
                            isCritical ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {anomaly.severity}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Active Symptom Cluster:</span>
                        <strong className="text-slate-900 font-mono text-xs uppercase">{anomaly.symptom}</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px] bg-slate-50 p-1.5 rounded-sm">
                        <span>Reported Consultations:</span>
                        <strong className="font-mono text-slate-900">{anomaly.case_count} cases</strong>
                      </div>
                      <p className="text-[10px] text-slate-600 m-0 leading-tight">
                        {anomaly.action_recommended || 'Dispatch field triage unit to inspect cluster.'}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Render Emergency Transit Polyline & Facility Markers */}
            {activeRoute && activeRoute.origin && activeRoute.dest && (
              <>
                <Polyline
                  positions={activeRoute.polyline}
                  pathOptions={{
                    color: '#0f172a',
                    weight: 4,
                    opacity: 0.9,
                    dashArray: '8, 8',
                  }}
                />

                {/* Depleted Origin Facility Marker */}
                <CircleMarker
                  center={[activeRoute.origin.lat, activeRoute.origin.lng]}
                  radius={10}
                  pathOptions={{ color: '#991b1b', fillColor: '#ef4444', fillOpacity: 0.9, weight: 2 }}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong className="text-rose-900 block font-bold">Depleted Facility</strong>
                      <span>{activeRoute.depletedFacility} ({activeRoute.depletedLocality})</span>
                      <span className="text-[10px] block text-slate-500 font-mono mt-1">Needed: {activeRoute.neededMedicine}</span>
                    </div>
                  </Popup>
                </CircleMarker>

                {/* Donor Destination Facility Marker */}
                <CircleMarker
                  center={[activeRoute.dest.lat, activeRoute.dest.lng]}
                  radius={10}
                  pathOptions={{ color: '#065f46', fillColor: '#10b981', fillOpacity: 0.9, weight: 2 }}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong className="text-emerald-900 block font-bold">Surplus Stock Donor</strong>
                      <span>{activeRoute.redirect_to_facility || 'PHC-002 (Bandra West)'}</span>
                      <span className="text-[10px] block text-emerald-800 font-mono font-bold mt-1">
                        Surplus: {activeRoute.available_stock || 180} units
                      </span>
                    </div>
                  </Popup>
                </CircleMarker>
              </>
            )}
          </MapContainer>
        </div>

        {/* Active Emergency Route Summary Bar (Payoff) */}
        {activeRoute && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#063b70] text-white px-2 py-0.5 rounded-sm font-mono">
                Active Transit Vector Plotted
              </span>
              <h4 className="text-xs font-bold text-slate-900 m-0 flex items-center gap-2">
                Redirecting Stock from <strong className="text-slate-900">{activeRoute.redirect_to_facility}</strong> to <strong className="text-slate-900">{activeRoute.depletedFacility}</strong>
              </h4>
              <p className="text-xs text-slate-600 m-0">
                Transit Distance: <strong className="font-mono text-slate-900">{activeRoute.distance_text || '6.8 km'}</strong> • Live Traffic ETA: <strong className="font-mono text-slate-900">{activeRoute.driving_time_mins || 16} mins</strong>
              </p>
            </div>

            <button
              onClick={() => setActiveRoute(null)}
              className="text-xs text-slate-700 hover:text-slate-900 underline font-semibold cursor-pointer shrink-0"
            >
              Clear Route Overlay
            </button>
          </div>
        )}
      </div>

      {/* Spatial Anomalies Table View */}
      <div className="bg-white border-t border-slate-200 pt-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900 m-0 uppercase tracking-wider flex items-center gap-2">
            Spatial Anomaly Registry: <span className="text-slate-900 font-extrabold">{activeAnomalies.length} Clusters Detected</span>
          </h3>

          <span className="bg-slate-100 text-slate-700 font-mono text-xs px-3 py-1 rounded-sm border border-slate-200 font-semibold">
            Threshold: &ge; 3 cases / locality
          </span>
        </div>

        {activeAnomalies.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-md border border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-700 m-0">No Active Outbreak Clusters Detected</p>
            <p className="text-xs text-slate-500 mt-1">Click "Seed Mock Outbreak" or "Run Spatial Scan" to inspect disease clusters.</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Locality / Zone</th>
                  <th className="p-3">Symptom Cluster</th>
                  <th className="p-3 text-right font-mono">Case Count</th>
                  <th className="p-3 text-center font-mono">Severity</th>
                  <th className="p-3">Action Protocol Recommended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {activeAnomalies.map((anom, idx) => {
                  const isCritical = anom.severity === 'CRITICAL';
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{anom.locality}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase font-mono bg-slate-100 text-slate-800 border border-slate-200">
                          {anom.symptom}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 text-xs">
                        {anom.case_count} cases
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase font-mono border ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {anom.severity}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-700">
                        {anom.action_recommended || `Dispatch field audit to ${anom.locality}.`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Emergency Rerouting Modal */}
      <LogisticsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRouteCalculated={handleRouteCalculated}
      />
    </div>
  );
}
