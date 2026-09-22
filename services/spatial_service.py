from datetime import datetime
from typing import Dict, Any, List
from db.memory import _appointments, _patients

def detect_spatial_anomalies(days_back: int = 7, anomaly_threshold: int = 3) -> Dict[str, Any]:
    """
    Feature 4: Scans all appointments across all facilities.
    Groups symptoms by Patient Locality to detect geographic disease clusters.
    """
    
    # 1. Initialize the spatial map
    # Structure will look like: { "Andheri East": { "fever": 5, "cough": 2 } }
    spatial_map: Dict[str, Dict[str, int]] = {}
    
    # 2. Aggregate data (In production, this would be a BigQuery geospatial query)
    for apt in _appointments:
        # Find the patient to get their locality
        patient = next((p for p in _patients if p.patient_id == apt.patient_id), None)
        locality = patient.locality if patient else "UNKNOWN_REGION"
        
        if locality not in spatial_map:
            spatial_map[locality] = {}
            
        # Count the symptoms for this locality
        for symptom in apt.symptoms:
            s_lower = symptom.lower().strip()
            spatial_map[locality][s_lower] = spatial_map[locality].get(s_lower, 0) + 1

    # 3. Apply the Rules Engine (Detect Anomalies)
    anomalies = []
    for locality, symptoms in spatial_map.items():
        for symptom, count in symptoms.items():
            if count >= anomaly_threshold:
                # We found an anomaly!
                severity = "CRITICAL" if count >= (anomaly_threshold * 2) else "WARNING"
                
                anomalies.append({
                    "locality": locality,
                    "symptom": symptom,
                    "case_count": count,
                    "threshold_exceeded": anomaly_threshold,
                    "severity": severity,
                    "status": "ACTIVE",
                    "action_recommended": f"Dispatch rapid response unit to {locality} to investigate {symptom} cluster."
                })

    return {
        "scan_timestamp": datetime.utcnow().isoformat(),
        "total_localities_scanned": len(spatial_map),
        "active_anomalies": anomalies,
        "raw_spatial_data": spatial_map # This is what the frontend uses to draw the Heatmap!
    }