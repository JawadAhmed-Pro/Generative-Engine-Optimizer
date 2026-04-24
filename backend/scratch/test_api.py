import requests
import json

BASE_URL = "https://api.geo-tool.site"
# BASE_URL = "http://localhost:8000"

def test_analyze_text():
    payload = {
        "content": "This is a test content about Generative Engine Optimization. It should be long enough to pass basic checks.",
        "title": "Test Analysis",
        "content_type": "general",
        "target_keyword": "GEO"
    }
    
    # Note: We need a valid token to test this, but let's see if it returns 401 or 500
    try:
        response = requests.post(f"{BASE_URL}/api/analyze-text", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_analyze_text()
