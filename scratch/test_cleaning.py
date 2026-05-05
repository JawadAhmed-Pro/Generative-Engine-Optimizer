import re

def clean_text(text):
    lines = text.split('\n')
    cleaned_lines = []
    
    garbage_keywords = {
        'sign up', 'sign in', 'log in', 'subscribe', 'privacy policy', 'terms of service',
        'cookie policy', 'sitemap', 'help center', 'careers', 'about us', 'contact us',
        'follow us', 'share on', 'open in app', 'get the app', 'membership', 'write for us',
        'status', 'blog', 'privacy', 'terms', 'about medium', 'verified', 'follower',
        'listen', 'share', 'bookmark', 'claps', 'responses', '5 min read', '2 days ago', '1 day ago'
    }

    for line in lines:
        line_strip = line.strip()
        if not line_strip:
            continue
            
        line_lower = line_strip.lower()
        
        if re.match(r'^\[\s*\]\(.*?\)$', line_strip) or re.match(r'^\[\s*\]$', line_strip):
            continue

        if len(line_strip) < 30 and any(line_lower == kw for kw in garbage_keywords):
            continue
            
        if len(line_strip) < 20 and any(kw in line_lower for kw in ['follow', 'share', 'tweet', 'listen']):
            continue
        
        if line_lower.startswith('written by') and len(line_strip) < 100:
            continue

        if re.match(r'^\[.*?\]\(.*?\)$', line_strip):
            link_text = re.search(r'^\[(.*?)\]', line_strip)
            if link_text:
                inner_text = link_text.group(1).lower().strip()
                if not inner_text or inner_text in garbage_keywords or any(kw in inner_text for kw in ['sitemap', 'help', 'app', 'sign']):
                    continue
            
        if re.match(r'^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}$', line_strip):
            continue

        cleaned_lines.append(line_strip)

    return '\n\n'.join(cleaned_lines)

input_text = """
# Review of Deep Learning Algorithms for Image Classification | by Beyalpha | May, 2026 | Medium

[](https://medium.com/?source=post_page---top_nav_layout_nav-----------------------------------------)

Get app

[Write](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2Fnew-story&source=---top_nav_layout_nav-----------------------new_post_topnav------------------)

[Search](https://medium.com/search?source=post_page---top_nav_layout_nav-----------------------------------------)

![Image 3](https://miro.medium.com/v2/resize:fill:32:32/1*dmbNkD5D-u45r44go_cf0g.png)

# Review of Deep Learning Algorithms for Image Classification

[![Image 4: Beyalpha](https://miro.medium.com/v2/da:true/resize:fill:32:32/0*BcoTM9RUa3kTIEJa)](https://medium.com/@beyalpha88?source=post_page---byline--f9dbdfe4a01d---------------------------------------)

[Beyalpha](https://medium.com/@beyalpha88?source=post_page---byline--f9dbdfe4a01d---------------------------------------)

5 min read

·

2 days ago

[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fvote%2Fp%2Ff9dbdfe4a01d&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40beyalpha88%2Freview-of-deep-learning-algorithms-for-image-classification-f9dbdfe4a01d&user=Beyalpha&userId=45bc30127df2&source=---header_actions--f9dbdfe4a01d---------------------clap_footer------------------)

[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2Ff9dbdfe4a01d&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40beyalpha88%2Freview-of-deep-learning-algorithms-for-image-classification-f9dbdfe4a01d&source=---header_actions--f9dbdfe4a01d---------------------bookmark_footer------------------)

[Listen](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2Fplans%3Fdimension%3Dpost_audio_button%26postId%3Df9dbdfe4a01d&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40beyalpha88%2Freview-of-deep-learning-algorithms-for-image-classification-f9dbdfe4a01d&source=---header_actions--f9dbdfe4a01d---------------------post_audio_button------------------)

Deep learning algorithms have revolutionized the field of image classification...
"""

cleaned = clean_text(input_text)
print("CLEANED CONTENT:")
print("-" * 20)
print(cleaned)
print("-" * 20)
