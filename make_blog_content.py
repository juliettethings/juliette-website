import json, os

BLOG = [
    {"id":"post-1","image":"images/blog/post-1.jpg","caption":"blog photo 1","title":"책장 구경","date":"","text":"사진 설명은 곧 채워질 예정이에요.","color":"#b8564d","textColor":"#faf6f0"},
    {"id":"post-2","image":"images/blog/post-2.jpg","caption":"blog photo 2","title":"파란 비틀","date":"2025-04-19","text":"사진 설명은 곧 채워질 예정이에요.","color":"#92b0b8","textColor":"#faf6f0"},
    {"id":"post-3","image":"images/blog/post-3.jpg","caption":"blog photo 3","title":"핑크 경차","date":"2025-04-19","text":"사진 설명은 곧 채워질 예정이에요.","color":"#99b84d","textColor":"#faf6f0"},
    {"id":"post-4","image":"images/blog/post-4.jpg","caption":"blog photo 4","title":"초록 경차","date":"2025-04-19","text":"사진 설명은 곧 채워질 예정이에요.","color":"#88b7b8","textColor":"#2b2420"},
    {"id":"post-5","image":"images/blog/post-5.jpg","caption":"blog photo 5","title":"밤나무","date":"2024-07-20","text":"사진 설명은 곧 채워질 예정이에요.","color":"#adb873","textColor":"#2b2420"},
    {"id":"post-6","image":"images/blog/post-6.jpg","caption":"blog photo 6","title":"아이스크림","date":"2025-01-20","text":"사진 설명은 곧 채워질 예정이에요.","color":"#b84d4e","textColor":"#faf6f0"},
    {"id":"post-7","image":"images/blog/post-7.jpg","caption":"blog photo 7","title":"가방 패치","date":"2023-04-17","text":"사진 설명은 곧 채워질 예정이에요.","color":"#b87c75","textColor":"#faf6f0"},
    {"id":"post-8","image":"images/blog/post-8.jpg","caption":"blog photo 8","title":"무지개 카페","date":"2025-03-17","text":"사진 설명은 곧 채워질 예정이에요.","color":"#b87f60","textColor":"#faf6f0"},
]

os.makedirs("/home/claude/site-build/content/blog", exist_ok=True)
for i, entry in enumerate(BLOG, start=1):
    entry_out = dict(entry)
    entry_out["order"] = i
    with open(f"/home/claude/site-build/content/blog/{entry['id']}.json", "w") as f:
        json.dump(entry_out, f, ensure_ascii=False, indent=2)
    print(entry['id'], 'ok')
