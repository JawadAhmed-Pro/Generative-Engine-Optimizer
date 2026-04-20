import requests
import time
import uuid

# Base URL - testing against local server
BASE_URL = "http://localhost:8000"

def test_api():
    print("🚀 Starting GEO API Verification Test Suite...")
    
    # 1. Register a test user
    email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "password123"
    
    print(f"--- Testing /api/auth/register ---")
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": password,
            "name": "Test User"
        })
        if resp.status_code != 200:
            print(f"❌ Registration Failed: {resp.status_code} {resp.text}")
            return
        
        token_data = resp.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"✅ User Registered and Authenticated")
        
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return

    # 2. Create a project
    print(f"\n--- Testing /api/projects ---")
    resp = requests.post(f"{BASE_URL}/api/projects", 
                         headers=headers,
                         json={"name": "Test Project", "description": "Verification Project"})
    if resp.status_code != 200:
        print(f"❌ Project Creation Failed: {resp.status_code} {resp.text}")
    else:
        project_id = resp.json()["id"]
        print(f"✅ Project Created (ID: {project_id})")

    # 3. Test URL Analysis
    print(f"\n--- Testing /api/analyze-url ---")
    # Using a stable, public URL
    test_url = "https://www.google.com" # Some sites might block, but we want to see if our logic holds
    resp = requests.post(f"{BASE_URL}/api/analyze-url", 
                         headers=headers,
                         json={
                             "url": test_url, 
                             "project_id": project_id,
                             "content_type": "general",
                             "target_keyword": "search engine"
                         })
    
    if resp.status_code == 200:
        print(f"✅ URL Analysis Success")
        content_item_id = resp.json().get("content_item_id")
    else:
        print(f"❌ URL Analysis Failed: {resp.status_code} {resp.text}")
        # Let's try text analysis anyway
        content_item_id = None

    # 4. Test Text Analysis
    print(f"\n--- Testing /api/analyze-text ---")
    resp = requests.post(f"{BASE_URL}/api/analyze-text", 
                         headers=headers,
                         json={
                             "content": "Generative Engine Optimization is about making content readable for AI search engines like Perplexity and Gemini. This requires semantic richness and high citation readiness.",
                             "project_id": project_id,
                             "title": "GEO Strategy Guide",
                             "content_type": "general",
                             "target_keyword": "GEO Strategy"
                         })
    if resp.status_code == 200:
        print(f"✅ Text Analysis Success")
        if not content_item_id:
            content_item_id = resp.json().get("content_item_id")
    else:
        print(f"❌ Text Analysis Failed: {resp.status_code} {resp.text}")

    if not content_item_id:
        print("🛑 Critical error: Could not obtain content_item_id for further tests.")
        return

    # 5. Test RAG Insights
    print(f"\n--- Testing /api/generate-insights ---")
    for itype in ["explanation", "recommendations"]:
        resp = requests.post(f"{BASE_URL}/api/generate-insights", 
                            headers=headers,
                            json={
                                "content_item_id": content_item_id,
                                "insight_type": itype
                            })
        if resp.status_code == 200:
            print(f"✅ Insight ({itype}) Success")
        else:
            print(f"❌ Insight ({itype}) Failed: {resp.status_code} {resp.text}")

    # 6. Test Competitor Comparison (Background Job)
    print(f"\n--- Testing /api/competitor-compare (Background Job) ---")
    resp = requests.post(f"{BASE_URL}/api/competitor-compare", 
                         headers=headers,
                         json={
                             "user_url": "https://www.bing.com",
                             "competitor_urls": ["https://www.google.com"],
                             "content_type": "general",
                             "target_keyword": "search"
                         })
    if resp.status_code == 200:
        job_id = resp.json().get("job_id")
        print(f"✅ Competitor Analysis Dispatched (Job ID: {job_id})")
        
        # Polling
        print("--- Polling Job Status ---")
        for _ in range(5):
            time.sleep(3)
            job_resp = requests.get(f"{BASE_URL}/api/jobs/{job_id}", headers=headers)
            status = job_resp.json().get("status")
            print(f"   Job Status: {status}")
            if status in ["completed", "failed"]:
                break
        if status == "completed":
            print(f"✅ Competitor Analysis Job Completed")
        else:
            print(f"⚠️ Competitor Analysis Job still {status}")
    else:
        print(f"❌ Competitor Analysis Dispatch Failed: {resp.status_code} {resp.text}")

    # 7. Test Prompt Discovery (Background Job)
    print(f"\n--- Testing /api/discover-prompts (Background Job) ---")
    resp = requests.post(f"{BASE_URL}/api/discover-prompts", 
                         headers=headers,
                         json={
                             "keyword": "Artificial Intelligence",
                             "niche": "Technology"
                         })
    if resp.status_code == 200:
        job_id = resp.json().get("job_id")
        print(f"✅ Prompt Discovery Dispatched (Job ID: {job_id})")
        
        # Polling
        print("--- Polling Discovery Job Status ---")
        for _ in range(5):
            time.sleep(3)
            job_resp = requests.get(f"{BASE_URL}/api/jobs/{job_id}", headers=headers)
            status = job_resp.json().get("status")
            print(f"   Job Status: {status}")
            if status in ["completed", "failed"]:
                break
        if status == "completed":
            print(f"✅ Prompt Discovery Job Completed")
        else:
            print(f"⚠️ Prompt Discovery Job still {status}")
    else:
        print(f"❌ Prompt Discovery Dispatch Failed: {resp.status_code} {resp.text}")

    # 8. Test Competitor Discovery (New Endpoint)
    print(f"\n--- Testing /api/discover/competitors ---")
    resp = requests.post(f"{BASE_URL}/api/discover/competitors", 
                         headers=headers,
                         json={
                             "keyword": "GEO tool",
                             "niche": "SEO"
                         })
    if resp.status_code == 200:
        print(f"✅ Competitor Discovery Success (Found: {len(resp.json().get('competitors', []))})")
    else:
        print(f"❌ Competitor Discovery Failed: {resp.status_code} {resp.text}")

    print(f"\n✨ Verification Suite Completed.")

if __name__ == "__main__":
    test_api()
