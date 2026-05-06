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

    def _sanitize_xml_text(self, text: str) -> str:
        """Remove XML-incompatible characters (NULL bytes and control characters)."""
        if not text:
            return text
        # Remove NULL bytes and most control characters, keep only valid XML chars
        # Valid: tab, newline, carriage return, and any character >= 0x20
        return ''.join(
            char for char in text 
            if char == '\t' or char == '\n' or char == '\r' or ord(char) >= 0x20
        )

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

        # Sanitize HTML before parsing to prevent lxml errors
        page_content = self._sanitize_xml_text(page_content)
        
        # Parse HTML with BeautifulSoup (reusing existing logic)
        soup = BeautifulSoup(page_content, 'lxml')
        
        # Extract content
        content_text = self._extract_text(soup, page_content)
        
        # If content is extremely short, it might be a JS-rendered page or a bot-protected "loading" screen.
        # Fallback to Jina for better extraction if not a small static file.
        if len(content_text) < 500 and not any(url.lower().endswith(ext) for ext in ['.pdf', '.xml', '.json', '.txt']):
            app_logger.warning(f"Extracted content is too short ({len(content_text)}). Falling back to Jina for better depth.")
            try:
                page_content, driver_title = self._fetch_via_jina(url)
                soup = BeautifulSoup(page_content, 'lxml')
                content_text = self._extract_text(soup, page_content)
            except Exception as jina_err:
                app_logger.error(f"Jina fallback failed for short content: {jina_err}")
                # Keep original content if Jina fails
        
        extracted = {
            'url': url,
            'title': self._extract_title(soup, driver_title),
            'content': content_text,
            'metadata': self._extract_metadata(soup),
            'headings': self._extract_headings(soup),
            'schema': self._extract_schema(soup),
            'raw_html': str(soup),
        }
        
        return extracted

    async def async_fetch_url(self, url: str) -> Dict[str, Any]:
        """
        Asynchronously fetch content from a URL using httpx. 
        Falls back to thread-pool Jina request if blocked or content is suspiciously short.
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

        # Sanitize HTML before parsing to prevent lxml errors
        page_content = self._sanitize_xml_text(page_content)
        
        # Parse HTML with BeautifulSoup 
        soup = BeautifulSoup(page_content, 'lxml')
        
        # Extract content
        content_text = self._extract_text(soup, page_content)

        # If content is extremely short, it might be a JS-rendered page or a bot-protected "loading" screen.
        if len(content_text) < 500 and not any(url.lower().endswith(ext) for ext in ['.pdf', '.xml', '.json', '.txt']):
            app_logger.warning(f"[Async] Extracted content is too short ({len(content_text)}). Falling back to Jina for better depth.")
            try:
                page_content, driver_title = await asyncio.to_thread(self._fetch_via_jina, url)
                soup = BeautifulSoup(page_content, 'lxml')
                content_text = self._extract_text(soup, page_content)
            except Exception as jina_err:
                app_logger.error(f"[Async] Jina fallback failed: {jina_err}")

        extracted = {
            'url': url,
            'title': self._extract_title(soup, driver_title),
            'content': content_text,
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
        """Extract main text content from the page with robust fallback and filtering."""
        
        # 1. Try Readability for pristine extraction
        readability_text = ""
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
                    else:
                        img.decompose()

                for intent in clean_soup.find_all(['button', 'a']):
                    btn_text = intent.get_text(strip=True)
                    if btn_text and any(w in btn_text.lower() for w in ['buy', 'cart', 'shop', 'order', 'purchase', 'get', 'checkout', 'subscribe']):
                        intent.replace_with(f" [CTA Button: {btn_text}] ")
                        
                readability_text = clean_soup.get_text(separator='\n', strip=True)
            except Exception as e:
                app_logger.warning(f"Readability extraction failed: {e}")

        # 2. Always try fallback BeautifulSoup extraction for comparison
        fallback_text = ""
        # Create a copy to not affect the original soup if used elsewhere
        fallback_soup = BeautifulSoup(str(soup), 'lxml')
        
        # Remove only the most obvious non-content blocks
        for script in fallback_soup(['script', 'style', 'nav', 'footer', 'header', 'noscript', 'iframe', 'svg']):
            script.decompose()
        
        # Priority: article > main > body
        main_content = fallback_soup.find('article') or fallback_soup.find('main') or fallback_soup.find('body')
        
        if main_content:
            for img in main_content.find_all('img'):
                alt = img.get('alt', '').strip()
                if alt and len(alt) > 3:
                    img.replace_with(f" [Image: {alt}] ")
                else:
                    img.decompose()
            
            fallback_text = main_content.get_text(separator='\n', strip=True)

        # 3. Selection Logic: Choose the most comprehensive extraction
        # If readability is very short or fallback is significantly longer, favor fallback
        if not readability_text:
            text = fallback_text
        elif len(fallback_text) > (len(readability_text) * 1.5) and len(readability_text) < 1500:
            app_logger.info(f"Readability seems too brief ({len(readability_text)}). Using fallback ({len(fallback_text)}).")
            text = fallback_text
        else:
            text = readability_text

        if not text:
            return ""

        # 4. Post-Extraction Cleaning (Less Aggressive)
        lines = text.split('\n')
        cleaned_lines = []
        
        # Keywords that almost always indicate non-content navigation/UI
        strict_garbage = {
            'sign up', 'sign in', 'log in', 'subscribe', 'privacy policy', 'terms of service',
            'cookie policy', 'sitemap', 'help center', 'careers', 'contact us',
            'follow us', 'share on', 'open in app', 'get the app', 'membership',
            'privacy', 'terms', 'get started', 'sign out', 'notifications'
        }

        for line in lines:
            line_strip = line.strip()
            if not line_strip:
                continue
                
            line_lower = line_strip.lower()
            
            # Filter pure Markdown noise and empty links
            if re.match(r'^\[\s*\]\(.*?\)$', line_strip) or re.match(r'^\[\s*\]$', line_strip):
                continue

            # Filter obvious navigation lines (short lines starting with garbage keywords)
            if len(line_strip) < 30 and any(line_lower == kw or line_lower.startswith(kw) for kw in strict_garbage):
                continue
                
            # Filter social media "follow" lines if they are very short
            if len(line_strip) < 25 and any(kw in line_lower for kw in ['follow', 'share', 'tweet']):
                continue

            # AGGRESSIVE LINK STRIPPING (only for very short links that look like menu items)
            if re.match(r'^\[.*?\]\(.*?\)$', line_strip):
                link_text_match = re.search(r'^\[(.*?)\]', line_strip)
                if link_text_match:
                    inner_text = link_text_match.group(1).strip()
                    inner_text_lower = inner_text.lower()
                    if not inner_text or inner_text_lower in strict_garbage or len(inner_text) < 2:
                        continue
            
            # Filter URLs with no context
            if re.match(r'^https?://\S+$', line_strip) and len(line_strip) < 60:
                continue

            cleaned_lines.append(line_strip)

        # Reconstruct and fix double newlines
        final_text = '\n\n'.join(cleaned_lines)
        final_text = re.sub(r'\n\s*\n+', '\n\n', final_text)
        
        # Sanitize final output
        final_text = self._sanitize_xml_text(final_text)
        
        app_logger.info(f"Final extracted content length: {len(final_text.strip())} characters.")
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
