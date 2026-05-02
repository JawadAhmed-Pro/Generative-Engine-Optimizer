import requests
from bs4 import BeautifulSoup
from typing import Dict, Optional, Any
import re
from urllib.parse import urlparse
import logging
from config import settings
from logger import app_logger
import httpx
import asyncio

class ContentFetcher:
    """Fetches and extracts content from URLs."""
    
    def __init__(self, timeout: int = 30):
        self.timeout = timeout

    def fetch_url(self, url: str) -> Dict[str, Any]:
        """
        Fetch content from a URL using requests first, and falling back to Selenium if blocked.
        """
        parsed = urlparse(url)
        if not parsed.scheme in ['http', 'https']:
            raise ValueError(f"Invalid URL scheme: {parsed.scheme}")
            
        page_content = ""
        driver_title = ""
        
        # 1. Try lightweight requests first
        try:
            app_logger.info(f"Fetching URL with requests: {url}")
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
                'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'Referer': 'https://www.google.com/'
            }
            response = requests.get(url, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            page_content = response.text
            app_logger.info(f"Successfully fetched {url} via requests")
            
        except requests.exceptions.HTTPError as e:
            # If we get a 403 Forbidden or 401, it's likely bot protection.
            if e.response.status_code in [403, 401, 406, 429]:
                app_logger.warning(f"Requests blocked by {url} ({e.response.status_code}). Falling back to Jina.")
                page_content, driver_title = self._fetch_via_jina(url)
            else:
                raise Exception(f"Failed to fetch exactly {url}: HTTP {e.response.status_code}")
        except Exception as e:
           app_logger.warning(f"Requests connection error for {url}: {e}. Falling back to Jina.")
           page_content, driver_title = self._fetch_via_jina(url)

        if not page_content:
            raise Exception(f"Failed to extract any content from {url}")

        # Parse HTML with BeautifulSoup (reusing existing logic)
        soup = BeautifulSoup(page_content, 'lxml')
        
        # Extract content
        extracted = {
            'url': url,
            'title': self._extract_title(soup, driver_title),
            'content': self._extract_text(soup, page_content),
            'metadata': self._extract_metadata(soup),
            'headings': self._extract_headings(soup),
            'schema': self._extract_schema(soup),
            'raw_html': str(soup),
        }
        
        return extracted
        
    async def async_fetch_url(self, url: str) -> Dict[str, Any]:
        """
        Asynchronously fetch content from a URL using httpx. 
        Falls back to thread-pool Jina request if blocked.
        """
        parsed = urlparse(url)
        if not parsed.scheme in ['http', 'https']:
            raise ValueError(f"Invalid URL scheme: {parsed.scheme}")
            
        page_content = ""
        driver_title = ""
        
        try:
            app_logger.info(f"[Async] Fetching URL: {url}")
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
                'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                page_content = response.text
                app_logger.info(f"[Async] Successfully fetched {url}")
                
        except httpx.HTTPStatusError as e:
            if e.response.status_code in [403, 401, 406, 429]:
                app_logger.warning(f"[Async] Blocked by {url} ({e.response.status_code}). Falling back to Jina.")
                page_content, driver_title = await asyncio.to_thread(self._fetch_via_jina, url)
            else:
                raise Exception(f"Failed to fetch exactly {url}: HTTP {e.response.status_code}")
        except Exception as e:
           app_logger.warning(f"[Async] Connection error for {url}: {e}. Falling back to Jina.")
           page_content, driver_title = await asyncio.to_thread(self._fetch_via_jina, url)

        if not page_content:
            raise Exception(f"Failed to extract any content from {url}")

        # Parse HTML with BeautifulSoup 
        soup = BeautifulSoup(page_content, 'lxml')
        
        # Extract content
        extracted = {
            'url': url,
            'title': self._extract_title(soup, driver_title),
            'content': self._extract_text(soup, page_content),
            'metadata': self._extract_metadata(soup),
            'headings': self._extract_headings(soup),
            'schema': self._extract_schema(soup),
            'raw_html': str(soup),
        }
        
        return extracted
        
    def _fetch_via_jina(self, url: str):
        """Fallback to Jina Reader API to bypass bot protections when Selenium is unavailable."""
        try:
            jina_url = f"https://r.jina.ai/{url}"
            headers = {'Accept': 'text/html'}
            response = requests.get(jina_url, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            content = response.text
            # Use regex to find a title from markdown/html returned by jina if applicable
            title_match = re.search(r'Title: (.*?)\n', content)
            title = title_match.group(1).strip() if title_match else ""
            
            # Since Jina returns Markdown by default, we wrap it in basic HTML 
            # so the existing BeautifulSoup _extract methods don't break downstream
            html_wrapped = f"<html><head><title>{title}</title></head><body><article>{content}</article></body></html>"
            return html_wrapped, title
            
        except requests.exceptions.HTTPError as e:
            msg = "Target site has extremely strict bot protection and blocked all our scrapers."
            app_logger.error(f"Jina fallback failed for {url}: HTTP {e.response.status_code}")
            raise Exception(f"{msg} (Status: {e.response.status_code})")
        except Exception as e:
            app_logger.error(f"Jina fallback completely failed for {url}: {str(e)}")
            raise Exception(f"Scraper fallback failed for {url}: {str(e)}")
    
    def _extract_title(self, soup: BeautifulSoup, driver_title: str = "") -> str:
        """Extract the page title, falling back to driver title."""
        if soup.title and soup.title.string:
            return soup.title.string.strip()
        if driver_title:
            return driver_title
        return "Untitled"
    
    def _extract_text(self, soup: BeautifulSoup, raw_html: str = "") -> str:
        """Extract main text content from the page with aggressive garbage filtering."""
        
        # 1. Try Readability for pristine extraction (strips navs, sidebars, footers)
        text = ""
        if raw_html:
            try:
                from readability import Document
                doc = Document(raw_html)
                clean_html = doc.summary()
                clean_soup = BeautifulSoup(clean_html, 'lxml')
                
                # Convert common interactive elements to text
                for img in clean_soup.find_all('img'):
                    alt = img.get('alt', '').strip()
                    if alt and len(alt) > 3:
                        img.replace_with(f" [Image: {alt}] ")
                for intent in clean_soup.find_all(['button', 'a']):
                    btn_text = intent.get_text(strip=True)
                    if btn_text and any(w in btn_text.lower() for w in ['buy', 'cart', 'shop', 'order', 'purchase', 'get', 'checkout']):
                        intent.replace_with(f" [CTA Button: {btn_text}] ")
                        
                text = clean_soup.get_text(separator='\n', strip=True)
            except Exception as e:
                app_logger.warning(f"Readability extraction failed: {e}. Falling back to basic.")

        # 2. Fallback to basic BeautifulSoup extraction if readability failed or produced too little
        if not text or len(text) < 200:
            # Remove script and style elements
            for script in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'form', 'noscript', 'iframe', 'svg']):
                script.decompose()
            
            # Priority: article > main > body
            main_content = soup.find('article') or soup.find('main') or soup.find('body')
            
            if main_content:
                # Inject textual representations for images
                for img in main_content.find_all('img'):
                    alt = img.get('alt', '').strip()
                    if alt and len(alt) > 3:
                        img.replace_with(f" [Image: {alt}] ")
                
                text = main_content.get_text(separator='\n', strip=True)

        if not text:
            return ""

        # 3. Post-Extraction Cleaning (Aggressive Garbage Removal)
        lines = text.split('\n')
        cleaned_lines = []
        
        # Common navigation / garbage keywords
        garbage_keywords = {
            'sign up', 'sign in', 'log in', 'subscribe', 'privacy policy', 'terms of service',
            'cookie policy', 'sitemap', 'help center', 'careers', 'about us', 'contact us',
            'follow us', 'share on', 'open in app', 'get the app', 'membership', 'write for us',
            'status', 'blog', 'privacy', 'terms', 'about medium', 'verified', 'follower'
        }

        for line in lines:
            line_strip = line.strip()
            if not line_strip:
                continue
                
            # Filter short navigational lines
            line_lower = line_strip.lower()
            
            # 1. Exact match or very short lines with garbage keywords
            if line_lower in garbage_keywords or (len(line_strip) < 30 and any(kw in line_lower for kw in garbage_keywords)):
                continue
                
            # 2. Filter lines that look like social media sharing (e.g., "Share", "Tweet", "Pin")
            if len(line_strip) < 15 and line_lower in ['share', 'tweet', 'pin', 'email', 'save']:
                continue
            
            # 3. Filter lines that are likely just "Listen", "Share", "5 min read" (Medium specific)
            if line_lower in ['listen', 'share', 'follow']:
                continue

            # 4. Filter Markdown links that are just navigation (e.g. [Sitemap](...))
            if re.match(r'^\[.*?\]\(.*?\)$', line_strip):
                # If the link text is a garbage keyword, skip it
                link_text = re.search(r'^\[(.*?)\]', line_strip)
                if link_text and link_text.group(1).lower() in garbage_keywords:
                    continue
                # If it's a sitemap or help link, skip it
                if any(kw in line_lower for kw in ['sitemap', 'help', 'app']):
                    continue
                
            # 5. Filter dates/timestamps that are just single lines (often near top)
            if re.match(r'^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}$', line_strip):
                continue

            cleaned_lines.append(line_strip)

        # Reconstruct and fix double newlines
        final_text = '\n\n'.join(cleaned_lines)
        final_text = re.sub(r'\n\s*\n+', '\n\n', final_text)
        
        return final_text.strip()
    
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
