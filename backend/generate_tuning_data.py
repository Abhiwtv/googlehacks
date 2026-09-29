import json
import random

medicines = ["Paracetamol 500mg", "ORS Sachets", "Amoxicillin 250mg", "Cough Syrup 100ml", "Ibuprofen 400mg"]
weathers = ["Monsoon (Heavy Rain)", "Heatwave (38°C)", "Normal", "Winter (Cold Wave)"]
locations = ["Andheri East Clinic", "Bandra West PHC", "Dharavi Mobile Unit", "Colaba General"]

def generate_vertex_example():
    medicine = random.choice(medicines)
    weather = random.choice(weathers)
    location = random.choice(locations)
    clinically_justified = random.randint(30, 200)
    scenario = random.choice(["surge", "error", "loss"])
    
    if scenario == "surge":
        missing_stock = clinically_justified + random.randint(0, 2)
        verdict = "LEGITIMATE_SURGE"
        reason = f"Inventory depletion ({missing_stock}) aligns with the documented clinical requirement ({clinically_justified}). Variance is within acceptable margin of error."
        if "Monsoon" in weather and "Paracetamol" in medicine:
            reason += " Surge is expected given the current monsoon weather conditions and fever-related footfall at the clinic."
            
    elif scenario == "error":
        missing_stock = clinically_justified + random.randint(5, 12)
        verdict = "DATA_ENTRY_ERROR"
        reason = f"Minor inventory discrepancy noted (Depletion: {missing_stock}, Justified: {clinically_justified}). The delta of {missing_stock - clinically_justified} units suggests routine dispensing without digital logging. Recommend front-desk reconciliation."
        
    else: 
        missing_stock = clinically_justified + random.randint(150, 500)
        verdict = "UNEXPLAINED_LOSS"
        reason = f"Significant discrepancy detected. Inventory depletion ({missing_stock}) exceeds clinically justified units ({clinically_justified}) by a delta of {missing_stock - clinically_justified}. This cannot be attributed to normal operational variance or weather patterns. Recommend immediate physical stock audit."

    # Native Vertex AI GenerateContent Format
    return {
        "systemInstruction": {
            "role": "system",
            "parts": [{"text": "You are a forensic healthcare auditor. Analyze the operational metrics and environmental context to determine the supply chain verdict. Output ONLY valid JSON containing 'verdict' and 'reasoning'."}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"Audit Report:\nClinic: {location}\nMedicine: {medicine}\nWeather Context: {weather}\nDepleted Stock: {missing_stock}\nClinically Justified: {clinically_justified}"}]
            },
            {
                "role": "model",
                "parts": [{"text": json.dumps({"verdict": verdict, "reasoning": reason})}]
            }
        ]
    }

with open("rca_training_data_v3.jsonl", "w") as f:
    for _ in range(250):
        f.write(json.dumps(generate_vertex_example()) + "\n")

print("Dataset generated: rca_training_data_v3.jsonl")