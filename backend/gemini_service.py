from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

# Load API key
GENAI_API_KEY = os.getenv("GENAI_API_KEY")
if not GENAI_API_KEY:
    raise ValueError("GENAI_API_KEY not found in environment variables.")

# Initialize Gemini API Client
client = genai.Client(api_key=GENAI_API_KEY)

def get_appliance_wattage(appliance_name):
    """Fetch average wattage of an appliance using Gemini API."""
    prompt = f"What is the average wattage of a {appliance_name}? If the average wattage is a range, give me the modal wattage. If not available, give a single value representing the average wattage best. Return only a single numeric value (e.g., 700, 800) with no additional text or explanation."

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        # Ensure response is valid and contains text
        if response and hasattr(response, "text") and response.text:
            return response.text.strip()
        else:
            return "Error: Invalid response from Gemini API."

    except Exception as e:
        return f"Error: {str(e)}"