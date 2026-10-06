import os
import re
from bs4 import BeautifulSoup

HTML_FILES = [
    'index.html',
    'states.html',
    'masterpiece.html',
    'collection.html',
    'artisans.html',
    'login.html',
    'register.html',
    'search.html',
    'about.html',
    'saathi.html',
    'dynamic-homepage.html',
    'hero-mosaic.html',
    'state_categories.html',
    'product-jaipur-pottery.html',
    'stitch-preview.html'
]

os.makedirs('css', exist_ok=True)

def process_html_file(filename):
    if not os.path.exists(filename):
        return

    print(f"Processing {filename}...")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove inlined FontAwesome CSS if present and replace with FontAwesome CDN link
    has_fa = False
    if 'fa-kit-upload' in content or 'fa-v4-font-face' in content or 'font-awesome' in content.lower():
        has_fa = True
        content = re.sub(r'<style[^>]*id="fa-kit-upload"[^>]*>.*?</style>', '', content, flags=re.DOTALL)
        content = re.sub(r'<style[^>]*id="fa-v4-font-face"[^>]*>.*?</style>', '', content, flags=re.DOTALL)

    # 2. Extract remaining inline <style> content into page-specific CSS file
    style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, flags=re.DOTALL)
    custom_css = [s.strip() for s in style_blocks if len(s.strip()) > 0]

    # Remove all <style> blocks from HTML
    content_clean = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL)

    base_name = os.path.splitext(filename)[0]
    css_filename = f"css/{base_name}.css"

    if custom_css:
        with open(css_filename, 'w', encoding='utf-8') as f:
            f.write(f"/* Custom Styles extracted from {filename} */\n\n")
            f.write('\n\n'.join(custom_css))
        print(f"  Extracted {len(custom_css)} style block(s) to {css_filename}")

    # 3. Parse HTML and inject stylesheets into <head>
    soup = BeautifulSoup(content_clean, 'html.parser')

    if soup.head:
        # Inject FontAwesome CDN link if needed and not already present
        fa_cdn = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
        existing_fa = soup.find('link', href=lambda h: h and 'font-awesome' in h)
        if has_fa and not existing_fa:
            fa_link = soup.new_tag('link', rel='stylesheet', href=fa_cdn)
            soup.head.append(fa_link)

        # Inject page-specific CSS link if extracted
        existing_page_css = soup.find('link', href=lambda h: h and css_filename in h)
        if custom_css and not existing_page_css:
            page_css_link = soup.new_tag('link', rel='stylesheet', href=css_filename)
            soup.head.append(page_css_link)

    # 4. Format HTML cleanly with indentations
    formatted_html = soup.prettify()

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(formatted_html)

    print(f"  Successfully formatted {filename} ({os.path.getsize(filename)} bytes)")

if __name__ == '__main__':
    for html_file in HTML_FILES:
        process_html_file(html_file)
    print("HTML & CSS Refactoring Complete!")
