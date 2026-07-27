#!/usr/bin/env python3
"""
topics/ 内のトピックJSONを走査して topics/index.json を自動生成する。
トピックを追加・更新したら、このスクリプトを1回実行するだけで一覧が更新される。

使い方:
    python3 build_index.py
"""
import json
import glob
import os

BASE = os.path.dirname(os.path.abspath(__file__))
TDIR = os.path.join(BASE, "topics")


def main():
    topics = []
    for path in sorted(glob.glob(os.path.join(TDIR, "*.json"))):
        name = os.path.basename(path)
        # index.json 自身と、_ で始まるテンプレ等は除外
        if name == "index.json" or name.startswith("_"):
            continue
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        # 読むのは同梱の <id>.learn.html が主。
        # notion は「元ページを直したいとき」の二次動線（learn.html が無ければ直接開く）
        learn = data["id"] + ".learn.html"
        topics.append({
            "id": data["id"],
            "title": data["title"],
            "file": name,
            "count": len(data.get("questions", [])),
            "provisional": data.get("provisional", False),
            "category": data.get("category", ""),
            "tags": data.get("tags", []),
            "notion": data.get("notion", ""),
            "learn": learn if os.path.exists(os.path.join(TDIR, learn)) else "",
        })

    out = os.path.join(TDIR, "index.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump({"topics": topics}, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"index.json を更新しました：{len(topics)} トピック")
    for t in topics:
        flag = "（仮）" if t["provisional"] else ""
        if t["learn"]:
            learn = "＋学習ページ" + ("／Notionリンクあり" if t["notion"] else "")
        elif t["notion"]:
            learn = "＋学習ページ(Notionを直接開く)"
        else:
            learn = "学習ページなし"
        print(f"  - {t['id']}: {t['title']} … {t['count']}問 {learn} {flag}")


if __name__ == "__main__":
    main()
