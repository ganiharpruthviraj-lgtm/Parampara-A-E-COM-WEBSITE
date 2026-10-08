import glob
import re

html_files = glob.glob("*.html")
print("Processing HTML files:", html_files)

for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all <img> tags
    def replace_img(match):
        tag = match.group(0)
        # Skip if already has loading= attribute
        if "loading=" in tag:
            return tag
        # Skip top logo images or hero brand logo
        if 'class="hero-logo"' in tag or 'alt="Parampara Heritage"' in tag or 'class="logo"' in tag:
            return tag
        
        # Insert loading="lazy" before closing bracket or end of img tag
        if tag.endswith("/>"):
            return tag[:-2].rstrip() + ' loading="lazy"/>'
        elif tag.endswith(">"):
            return tag[:-1].rstrip() + ' loading="lazy">'
        return tag

    new_content = re.sub(r'<img\s+[^>]*?>', replace_img, content, flags=re.IGNORECASE)

    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {file_path} with loading=\"lazy\"")
    else:
        print(f"No changes needed for {file_path}")
