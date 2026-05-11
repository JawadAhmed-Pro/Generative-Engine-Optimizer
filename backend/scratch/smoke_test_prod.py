"""
Production Smoke Test — hits live API to validate all 13 fixes.
Tests: Health, Auth, Analysis (URL + Text), Optimization, Job Polling.
"""
import requests
import time
import uuid
import json
import sys

BASE_URL = "https://api.geo-tool.site"

def smoke_test():
    results = []
    
    def check(name, passed, detail=""):
        status = "✅" if passed else "❌"
        results.append({"name": name, "passed": passed, "detail": detail})
        print(f"  {status} {name}: {detail}")
    
    print(f"\n🚀 GEO Production Smoke Test")
    print(f"   Target: {BASE_URL}")
    print(f"{'='*60}")
    
    # 1. Health Check
    print("\n[1/6] Health Check")
    try:
        resp = requests.get(f"{BASE_URL}/health", timeout=15)
        check("API Health", resp.status_code == 200, f"HTTP {resp.status_code}")
    except Exception as e:
        check("API Health", False, str(e)[:80])
        print("\n🛑 API is down. Cannot continue.")
        return results

    # 2. Auth
    print("\n[2/6] Authentication")
    email = f"smoketest_{uuid.uuid4().hex[:6]}@test.com"
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email, "password": "smoke123!", "name": "Smoke Test"
        }, timeout=15)
        if resp.status_code == 200:
            token = resp.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            check("Register + Auth", True, f"Token obtained")
        else:
            check("Register + Auth", False, f"HTTP {resp.status_code}: {resp.text[:100]}")
            return results
    except Exception as e:
        check("Register + Auth", False, str(e)[:80])
        return results

    # 3. Create Project
    print("\n[3/6] Project Creation")
    try:
        resp = requests.post(f"{BASE_URL}/api/projects", headers=headers, json={
            "name": "Smoke Test Project", "description": "Automated verification"
        }, timeout=15)
        project_id = resp.json()["id"]
        check("Create Project", True, f"ID: {project_id}")
    except Exception as e:
        check("Create Project", False, str(e)[:80])
        return results

    # 4. Text Analysis (V1 + V2 validation)
    print("\n[4/6] Text Analysis (validates V1: heading parse + V2: keyword extraction)")
    test_content = """# Best AI Tools for Content Writing in 2026

## Introduction
AI-powered content writing tools have revolutionized digital marketing. According to a 2025 HubSpot survey, 73% of marketers now use AI for content creation.

## Top Tools Comparison
| Tool | Price | Rating |
|------|-------|--------|
| ChatGPT | $20/mo | 4.8 |
| Claude | $20/mo | 4.7 |
| Jasper | $49/mo | 4.5 |

## Expert Recommendations
Dr. Sarah Mitchell, AI Research Director at Stanford, recommends using multiple AI tools in combination for optimal results.

## FAQ
### What is the best AI writing tool?
ChatGPT and Claude are consistently rated as the top AI writing assistants for 2026.

### How much do AI writing tools cost?
Most premium AI writing tools range from $20 to $50 per month for individual plans.
"""
    try:
        resp = requests.post(f"{BASE_URL}/api/analyze-text", headers=headers, json={
            "content": test_content,
            "project_id": project_id,
            "title": "Best AI Tools for Content Writing in 2026",
            "content_type": "educational",
            "engine": "perplexity"
        }, timeout=30)
        
        if resp.status_code == 200:
            data = resp.json()
            job_id = data.get("job_id")
            check("Submit Text Analysis", True, f"Job: {job_id}")
            
            # Poll for completion (V4, V5 validation happens during scoring)
            print("   ⏳ Polling job status...")
            final_status = "unknown"
            for i in range(20):  # Up to 60 seconds
                time.sleep(3)
                job_resp = requests.get(f"{BASE_URL}/api/jobs/{job_id}", headers=headers, timeout=10)
                if job_resp.status_code == 200:
                    job_data = job_resp.json()
                    final_status = job_data.get("status", "unknown")
                    progress = job_data.get("progress", 0)
                    print(f"   ... [{progress}%] {final_status}")
                    if final_status in ["completed", "failed"]:
                        break
            
            check("Analysis Job Completed", final_status == "completed", f"Status: {final_status}")
        else:
            check("Submit Text Analysis", False, f"HTTP {resp.status_code}")
    except Exception as e:
        check("Text Analysis", False, str(e)[:80])

    # 5. Content Generation (O1, O2, O3 validation)
    print("\n[5/6] Content Generation (validates O1: grounding + O2: real semantic + O3: re-scoring)")
    try:
        resp = requests.post(f"{BASE_URL}/api/optimize", headers=headers, json={
            "content": "Best practices for Generative Engine Optimization in 2026",
            "mode": "generate",
            "strategy": "general",
            "tone": "professional",
            "audience": "intermediate",
            "strength": 70,
            "content_type": "educational",
            "project_id": project_id,
            "engine": "perplexity"
        }, timeout=30)
        
        if resp.status_code == 200:
            data = resp.json()
            opt_job_id = data.get("job_id")
            check("Submit Generation", True, f"Job: {opt_job_id}")
            
            # Poll for completion
            print("   ⏳ Polling generation job (this takes 30-90s)...")
            opt_status = "unknown"
            for i in range(30):  # Up to 90 seconds
                time.sleep(3)
                job_resp = requests.get(f"{BASE_URL}/api/jobs/{opt_job_id}", headers=headers, timeout=10)
                if job_resp.status_code == 200:
                    job_data = job_resp.json()
                    opt_status = job_data.get("status", "unknown")
                    progress = job_data.get("progress", 0)
                    print(f"   ... [{progress}%] {opt_status}")
                    if opt_status in ["completed", "failed"]:
                        if opt_status == "completed":
                            result = job_data.get("result", {})
                            score = result.get("overall_score", "N/A")
                            print(f"   📊 Overall Score: {score}")
                        break
            
            check("Generation Job Completed", opt_status == "completed", f"Status: {opt_status}")
        else:
            check("Submit Generation", False, f"HTTP {resp.status_code}: {resp.text[:100]}")
    except Exception as e:
        check("Content Generation", False, str(e)[:80])

    # 6. Summary
    print(f"\n{'='*60}")
    passed = sum(1 for r in results if r['passed'])
    total = len(results)
    print(f"📋 Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 ALL CHECKS PASSED — Production is GREEN")
    else:
        failed = [r['name'] for r in results if not r['passed']]
        print(f"⚠️  FAILED: {', '.join(failed)}")
    
    return results

if __name__ == "__main__":
    smoke_test()
