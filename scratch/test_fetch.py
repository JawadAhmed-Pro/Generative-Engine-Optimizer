import requests
from bs4 import BeautifulSoup

url = "https://crex.com/cricket-analysis/psl-2026-playoffs-qualification-scenarios-69e914d4bc4e0baeebc451f7"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
}

try:
    print(f"Fetching {url}...")
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success!")
        print(f"Content length: {len(response.text)}")
    else:
        print(f"Failed with status: {response.status_code}")
        print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")

# Try Jina fallback
jina_url = f"https://r.jina.ai/{url}"
print(f"\nTrying Jina fallback: {jina_url}")
try:
    response = requests.get(jina_url, timeout=10)
    print(f"Jina Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Jina Success!")
        print(f"Jina Content length: {len(response.text)}")
    else:
        print(f"Jina Failed with status: {response.status_code}")
except Exception as e:
    print(f"Jina Error: {e}")
