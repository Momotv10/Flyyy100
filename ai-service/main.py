import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
import io
import json

app = FastAPI(title="STAMS AI OCR Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "gemini_configured": bool(GEMINI_API_KEY)}

@app.post("/ocr/passport")
async def analyze_passport(file: UploadFile = File(...)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Initialize Gemini Pro Vision
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """
        Analyze this passport image and extract the following information in JSON format:
        {
            "firstName": "string",
            "lastName": "string",
            "passportNumber": "string",
            "nationality": "string",
            "dateOfBirth": "YYYY-MM-DD",
            "expiryDate": "YYYY-MM-DD",
            "confidence": 0.95
        }
        If any field is not found, use null.
        """
        
        response = model.generate_content([prompt, image])
        
        # Extract JSON from response
        text = response.text
        # Simple JSON extraction from markdown if needed
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process passport: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
