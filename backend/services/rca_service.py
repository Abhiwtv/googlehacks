import json
from google import genai
from google.genai.types import HttpOptions
from google.genai import types

# Google Cloud configuration
PROJECT_ID = "healthcare-ai-509518"
LOCATION = "us-central1"

# Tuned model's deployed online inference endpoint
TUNED_ENDPOINT = (
    "projects/1025428896998/"
    "locations/us-central1/"
    "endpoints/5712451639214866432"
)

# Create Google Gen AI client
client = genai.Client(
    vertexai=True,
    project=PROJECT_ID,
    location=LOCATION,
    http_options=HttpOptions(api_version="v1")
)

# Same instruction used during fine-tuning
SYSTEM_INSTRUCTION = (
    "You are a forensic healthcare auditor. "
    "Analyze the provided operational metrics and environmental context "
    "to determine the supply chain verdict. "

    "The verdict MUST be exactly one of these four values: "
    "UNEXPLAINED_LOSS, DATA_ENTRY_ERROR, LEGITIMATE_SURGE, NORMAL_OPERATION. "
    
    "If the ledger math is perfectly reconciled and there are no suspicious environmental factors, output NORMAL_OPERATION. "
    "Never output THEFT, FRAUD, ERROR, or any other verdict. "

    "IMPORTANT: A mathematically reconciled inventory ledger does NOT by itself "
    "prove a legitimate demand surge. Do not claim a surge unless the provided "
    "evidence supports unusually high legitimate demand. "

    "Output ONLY valid JSON containing exactly two fields: "
    "'verdict' and 'reasoning'. Do not use markdown ticks. Never use unescaped double quotes inside the reasoning string."
)


def analyze_root_cause(
    facility_id: str,
    medicine: str,
    weather_context: str,
    total_received: int,
    total_dispensed: int,
    expected_remaining: int
) -> dict:

    prompt = f"""
{SYSTEM_INSTRUCTION}

Audit Report:
Clinic: {facility_id}
Medicine: {medicine}
Weather Context: {weather_context}

Ledger Metrics:
Total Received: {total_received}
Total Dispensed: {total_dispensed}
Expected Remaining Stock: {expected_remaining}
"""

    try:
        response = client.models.generate_content(
            model=TUNED_ENDPOINT,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1
            )
        )

        raw_text = response.text.strip()
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        ai_output = json.loads(raw_text)

        return {
            "facility_id": facility_id,
            "medicine": medicine,
            "weather_context": weather_context,
            "ledger_metrics": {
                "total_received": total_received,
                "total_dispensed": total_dispensed,
                "expected_remaining": expected_remaining
            },
            "verdict": ai_output.get("verdict", "ERROR"),
            "reasoning": ai_output.get(
                "reasoning",
                "Failed to generate reasoning."
            ),
            "audit_status": "COMPLETED",
            "model_engine": "Vertex AI Custom Tuned"
        }

    except Exception as e:
        print(f"Vertex AI RCA Execution Failed: {e}")

        return {
            "error": f"RCA Forensic Engine Unavailable: {str(e)}"
        }