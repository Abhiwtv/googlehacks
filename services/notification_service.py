from datetime import datetime
from typing import Dict, Any, List

# In-memory alert log
_dispatched_alerts = []

def process_and_dispatch_alerts(spatial_data: Dict[str, Any], rca_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Feature 6: Rules Engine. Evaluates anomalies and forensic data to dispatch 
    targeted SMS/Email alerts to relevant authorities. Prevents alert fatigue.
    """
    new_alerts = []

    # 1. Evaluate Spatial Anomalies (Public Health Officer Alerts)
    for anomaly in spatial_data.get("active_anomalies", []):
        if anomaly["severity"] == "CRITICAL" or anomaly["case_count"] >= 5:
            alert = {
                "alert_id": f"ALT-GEO-{int(datetime.utcnow().timestamp())}",
                "timestamp": datetime.utcnow().isoformat(),
                "type": "PUBLIC_HEALTH_WARNING",
                "recipient": "District Health Officer (DHO)",
                "channel": "SMS & EMAIL",
                "message": f"URGENT: {anomaly['case_count']} cases of {anomaly['symptom']} detected in {anomaly['locality']}. Threshold exceeded. Deploy rapid response."
            }
            new_alerts.append(alert)

    # 2. Evaluate Forensic RCA (Supply Chain / Anti-Fraud Alerts)
    if rca_data.get("verdict") == "SUSPECTED_PHANTOM_LEAKAGE":
        alert = {
            "alert_id": f"ALT-FRAUD-{int(datetime.utcnow().timestamp())}",
            "timestamp": datetime.utcnow().isoformat(),
            "type": "SUPPLY_CHAIN_INTEGRITY_BREACH",
            "recipient": "State Vigilance Officer",
            "channel": "SECURE_PORTAL & EMAIL",
            "message": f"FRAUD ALERT: Facility {rca_data.get('facility_id')} shows unaccounted depletion of {rca_data.get('discrepancy_delta', {}).get('unaccounted_units')} units of {rca_data.get('medicine')}. Freeze batch dispatches."
        }
        new_alerts.append(alert)
        
    # Save to our memory log
    _dispatched_alerts.extend(new_alerts)

    return {
        "alerts_triggered_this_run": len(new_alerts),
        "dispatched_alerts": new_alerts,
        "total_historical_alerts": len(_dispatched_alerts)
    }
    
def get_all_alerts():
    return _dispatched_alerts