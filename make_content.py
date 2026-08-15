import json, os, re

META = [
    ("88 Cups of Tea", "88-cups-of-tea", "#d65038", "#faf6f0", ["Branding","Illustration"]),
    ("CPR for Dogs", "cpr-for-dogs", "#f2b6c8", "#7b3713", ["Illustration"]),
    ("Dercent", "dercent", "#dce4e1", "#6cc4ea", ["Branding","Packaging"]),
    ("Jaranada Identity & Packaging", "jaranada", "#49b670", "#faf6f0", ["Branding","Illustration","Packaging"]),
    ("HYAAH!", "hyaah", "#d7342d", "#faf6f0", ["Branding","Packaging"]),
    ("Studio Juliette Store", "studio-juliette-store", "#f5e7cc", "#e0321f", ["Branding","Illustration"]),
    ("Kyochon Rangers", "kyochon-rangers", "#bddeec", "#e82626", ["Branding"]),
    ("Logofolio & Branding Collection", "logofolio", "#89d1f0", "#feffd1", ["Branding","Illustration"]),
    ("Tiny Organics Baby Food Packaging", "tiny-organics", "#f7c455", "#faf6f0", ["Packaging"]),
    ("Dear Sweet Lab", "dear-sweet-lab", "#fbc8cb", "#faf6f0", ["Branding","Packaging"]),
    ("Shore Soap Co.", "shore-soap-co", "#e0eef5", "#667a93", ["Branding","Packaging","Illustration"]),
    ("With Bling London", "with-bling-london", "#7d402c", "#faf6f0", ["Branding","Packaging"]),
]

# parse behance_images.txt into slug -> [urls]
images_by_slug = {}
current = None
with open("/home/claude/site-build/behance_images.txt") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        if line.startswith("##"):
            # "## 88-cups-of-tea (gallery/82722219)"
            m = re.match(r"##\s+(\S+)\s+\(gallery/(\d+)\)", line)
            current = m.group(1)
            images_by_slug[current] = []
        elif line.startswith("http"):
            images_by_slug[current].append(line)

os.makedirs("/home/claude/site-build/content/projects", exist_ok=True)

for order, (title, slug, color, textColor, tags) in enumerate(META, start=1):
    urls = images_by_slug.get(slug, [])
    data = {
        "order": order,
        "title": title,
        "slug": slug,
        "color": color,
        "textColor": textColor,
        "tags": tags,
        "images": urls,
        "description": ""
    }
    with open(f"/home/claude/site-build/content/projects/{slug}.json", "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(slug, len(urls))
