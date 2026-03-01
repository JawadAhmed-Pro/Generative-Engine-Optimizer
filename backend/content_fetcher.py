import requests
from bs4 import BeautifulSoup
from typing import Dict, Optional, Any
import re
from urllib.parse import urlparse
import logging
from config import settings
from logger import app_logger

# Selenium imports
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

class ContentFetcher:
    """Fetches and extracts content from URLs using Headless Chrome."""
    
    def __init__(self, timeout: int = 30):
        self.timeout = timeout
        
    def _get_driver(self):
        """Initialize and return a headless Chrome driver."""
        chrome_options = Options()
        chrome_options.add_argument("--headless=new") # Modern headless mode (more stable)
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080") # Ensure elements render
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-software-rasterizer")
        
        # Anti-detection
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Performance & Stability options
        chrome_options.add_argument("--log-level=3")
        chrome_options.add_argument("--ignore-certificate-errors")
        chrome_options.add_argument("--ignore-ssl-errors")
        chrome_options.page_load_strategy = 'eager'
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_page_load_timeout(60) # Increased timeout
        return driver

    def fetch_url(self, url: str) -> Dict[str, Any]:
        """
        Fetch content from a URL using Selenium to bypass anti-bot checks.
        """
        driver = None
        try:
            # Validate URL
            parsed = urlparse(url)
            if not parsed.scheme in ['http', 'https']:
                raise ValueError(f"Invalid URL scheme: {parsed.scheme}")
            
            app_logger.info(f"Fetching URL with Selenium: {url}")
            driver = self._get_driver()
            
            # Load page
            driver.get(url)
            
            # Wait briefly for JS to load content
            time.sleep(2) 
            
            # Get page source
            page_content = driver.page_source
            
            # Parse HTML with BeautifulSoup (reusing existing logic)
            soup = BeautifulSoup(page_content, 'lxml')
            
            # Extract content
            extracted = {
                'url': url,
                'title': self._extract_title(soup, driver.title),
                'content': self._extract_text(soup),
                'metadata': self._extract_metadata(soup),
                'headings': self._extract_headings(soup),
                'schema': self._extract_schema(soup),
                'raw_html': str(soup),
            }
            
            return extracted
            
        except Exception as e:
            raise Exception(f"Failed to fetch URL {url}: {str(e)}")
        finally:
            if driver:
                driver.quit()
    
    def _extract_title(self, soup: BeautifulSoup, driver_title: str = "") -> str:
        """Extract the page title, falling back to driver title."""
        if soup.title and soup.title.string:
            return soup.title.string.strip()
        if driver_title:
            return driver_title
        return "Untitled"
    
    def _extract_text(self, soup: BeautifulSoup) -> str:
        """Extract main text content from the page."""
        # Remove script and style elements
        for script in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'form', 'noscript', 'iframe']):
            script.decompose()
        
        # Priority: article > main > body
        main_content = soup.find('article') or soup.find('main') or soup.find('body')
        
        if not main_content:
            return ""
        
        # Inject textual representations for important non-text elements
        
        # 1. Images with alt text
        for img in main_content.find_all('img'):
            alt = img.get('alt', '').strip()
            if alt and len(alt) > 3: # Filter tiny icons
                img.replace_with(f" [Image: {alt}] ")
                
        # 2. Buttons and Links (CTA)
        for intent in main_content.find_all(['button', 'a']):
            text = intent.get_text(strip=True)
            # Check if likely a CTA
            if text and any(w in text.lower() for w in ['buy', 'cart', 'shop', 'order', 'purchase', 'get', 'checkout']):
                intent.replace_with(f" [CTA Button: {text}] ")
        
        # Get text
        text = main_content.get_text(separator='\n', strip=True)
        
        # Clean up whitespace
        text = re.sub(r'\n\s*\n', '\n\n', text)
        text = re.sub(r' +', ' ', text)
        
        return text.strip()
    
    def _extract_metadata(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract metadata from meta tags."""
        metadata = {}
        
        # Description
        desc_tag = soup.find('meta', attrs={'name': 'description'})
        if desc_tag and desc_tag.get('content'):
            metadata['description'] = desc_tag['content']
        
        # Open Graph
        og_tags = soup.find_all('meta', property=re.compile(r'^og:'))
        for tag in og_tags:
            key = tag.get('property', '').replace('og:', '')
            content = tag.get('content', '')
            if key and content:
                metadata[f'og_{key}'] = content
        
        # Keywords
        keywords_tag = soup.find('meta', attrs={'name': 'keywords'})
        if keywords_tag and keywords_tag.get('content'):
            metadata['keywords'] = keywords_tag['content']
        
        # Author
        author_tag = soup.find('meta', attrs={'name': 'author'})
        if author_tag and author_tag.get('content'):
            metadata['author'] = author_tag['content']
        
        return metadata
    
    def _extract_headings(self, soup: BeautifulSoup) -> Dict[str, list]:
        """Extract all headings."""
        headings = {
            'h1': [], 'h2': [], 'h3': [], 'h4': [], 'h5': [], 'h6': []
        }
        for level in headings.keys():
            tags = soup.find_all(level)
            headings[level] = [tag.get_text().strip() for tag in tags]
        return headings
    
    def _extract_schema(self, soup: BeautifulSoup) -> Dict[str, list]:
        """Extract schema.org structured data."""
        schemas = {
            'types': [],
            'raw': []
        }
        
        # JSON-LD schema
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_ld_scripts:
            try:
                import json
                if script.string:
                    schema_data = json.loads(script.string)
                    schemas['raw'].append(schema_data)
                    
                    if isinstance(schema_data, dict):
                        schema_type = schema_data.get('@type', '')
                        if schema_type: schemas['types'].append(schema_type)
                    elif isinstance(schema_data, list):
                        for item in schema_data:
                            if isinstance(item, dict):
                                type_val = item.get('@type', '')
                                if type_val: schemas['types'].append(type_val)
            except:
                pass
        
        return schemas
