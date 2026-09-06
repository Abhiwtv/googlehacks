import os
import io
from PIL import Image
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.domain import ExtractedDocument

load_dotenv()  
# Initialize the Gemini client (it automatically picks up GOOGLE_API_KEY from the environment)
client = genai.Client()

def process_document_gemini(file_bytes: bytes, filename: str) -> ExtractedDocument:
    """
    REAL SERVICE: Uses Gemini 1.5 Flash to read the image and extract structured JSON.
    """
    # 1. Load the image from the uploaded bytes
    image = Image.open(io.BytesIO(file_bytes))
    
    # 2. Tell Gemini exactly what we want
    prompt = """
    You are an AI assistant for a public health system. 
    Extract the inventory data from this medicine stock register image.
    If the facility ID or date is missing, do your best to infer them from the text, otherwise use 'UNKNOWN'.
    Pay close attention to 'quantity received' vs 'quantity dispensed'.
    """
    
    # 3. Call Gemini Flash with Structured Outputs
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents=[image, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ExtractedDocument, # We pass our Pydantic model here!
            temperature=0.1, # Low temperature for factual, deterministic extraction
        ),
    )
    
    # 4. Gemini returns a JSON string that perfectly matches our schema. 
    # We parse it directly into our Pydantic model.
    extracted_data = ExtractedDocument.model_validate_json(response.text)
    
    # Optional: We could dynamically calculate a confidence score here, 
    # but for now we'll set it to 0.95 to simulate high confidence.
    extracted_data.confidence_score = 0.95
    
    return extracted_data