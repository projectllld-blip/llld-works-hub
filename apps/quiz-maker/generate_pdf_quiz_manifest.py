#!/usr/bin/env python3
"""Generate PDF quiz manifest files from PDF小テストデータ."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


PROBLEM_TOKENS = ("問題",)
ANSWER_TOKENS = ("解答", "答え")


def load_existing(path: Path) -> dict[str, dict]:
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    if text.lstrip().startswith("["):
        records = json.loads(text)
    else:
        match = re.search(r"const records = (\[.*?\]);", text, re.S)
        if not match:
            return {}
        records = json.loads(match.group(1))
    metadata = {}
    for item in records:
        for key in (item.get("problem"), item.get("answer")):
            if key:
                metadata[key] = item
    return metadata


def unit_from_name(path: Path) -> int:
    text = path.stem
    match = re.search(r"第\s*(\d+)\s*回", text)
    if match:
        return int(match.group(1))
    match = re.search(r"(\d+)", text)
    return int(match.group(1)) if match else 0


def strip_kind(stem: str) -> str:
    text = stem
    for token in PROBLEM_TOKENS + ANSWER_TOKENS:
        text = text.replace(token, "")
    return re.sub(r"\s+", " ", text).strip()


def is_problem(path: Path) -> bool:
    return any(token in path.stem for token in PROBLEM_TOKENS)


def is_answer(path: Path) -> bool:
    return any(token in path.stem for token in ANSWER_TOKENS)


def guess_group(title: str) -> str:
    if "中受新演習" in title:
        return "中学受験新演習"
    return title


def build_records(base_dir: Path, existing: dict[str, dict]) -> list[dict]:
    pairs: dict[tuple[str, int, str], dict[str, str]] = {}
    for pdf_path in sorted(base_dir.rglob("*.pdf")):
        rel = pdf_path.relative_to(base_dir).as_posix()
        if any(part.startswith(".") for part in pdf_path.relative_to(base_dir).parts):
            continue
        if not (is_problem(pdf_path) or is_answer(pdf_path)):
            continue
        parts = pdf_path.relative_to(base_dir).parts
        title = parts[0] if len(parts) >= 1 else "PDF小テスト"
        subject = parts[1] if len(parts) >= 2 else "未分類"
        unit = unit_from_name(pdf_path)
        key = (title, subject, strip_kind(pdf_path.stem))
        slot = pairs.setdefault(key, {"title": title, "subject": subject, "unit": unit})
        if is_answer(pdf_path):
            slot["answer"] = rel
        else:
            slot["problem"] = rel

    records = []
    for index, slot in enumerate(sorted(pairs.values(), key=lambda x: (x["title"], x["subject"], x["unit"], x.get("problem", x.get("answer", "")))), start=1):
        source_meta = existing.get(slot.get("problem", "")) or existing.get(slot.get("answer", "")) or {}
        title = source_meta.get("title") or slot["title"]
        subject = source_meta.get("subject") or slot["subject"]
        record = {
            "id": f"pdf_{index:04d}",
            "title": title,
            "subject": subject,
            "group": source_meta.get("group") or guess_group(title),
            "level": source_meta.get("level") or title.replace("中受新演習", "中受新演習"),
            "unit": source_meta.get("unit") or slot["unit"],
            "problem": slot.get("problem", ""),
            "answer": slot.get("answer", ""),
            "source": source_meta.get("source") or "",
            "unitTitle": source_meta.get("unitTitle") or "",
        }
        records.append(record)
    return records


def write_outputs(records: list[dict], out_dir: Path) -> None:
    payload = json.dumps(records, ensure_ascii=False, indent=2)
    (out_dir / "manifest.json").write_text(payload + "\n", encoding="utf-8")
    js = """(() => {
  const base = new URL('.', document.currentScript.src);
  const records = %s;
  records.forEach(record => {
    if (record.problem) record.problem = new URL(record.problem, base).href;
    if (record.answer) record.answer = new URL(record.answer, base).href;
  });
  window.PDF_QUIZ_MANIFEST = records;
})();
""" % payload
    (out_dir / "pdf_quiz_manifest.js").write_text(js, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default="PDF小テストデータ")
    args = parser.parse_args()
    data_dir = Path(args.data_dir).resolve()
    if not data_dir.is_dir():
        raise SystemExit(f"PDF quiz data folder not found: {data_dir}")
    existing = load_existing(data_dir / "manifest.json")
    records = build_records(data_dir, existing)
    write_outputs(records, data_dir)
    print(f"generated {len(records)} PDF quiz records")


if __name__ == "__main__":
    main()
