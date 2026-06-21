#!/usr/bin/env python3
"""Generate exam_data.js and manifest files from the distribution data folder."""

from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path


SUBJECT_ORDER = {
    "国語": "01",
    "数学": "02",
    "算数": "02",
    "英語": "03",
    "理科": "04",
    "社会": "05",
    "適性検査I": "06",
    "適性検査II": "07",
    "適性検査Ⅲ": "08",
    "その他": "99",
    "配点表": "90",
}

CSV_FIELDS = [
    "id",
    "prefecture",
    "exam",
    "year",
    "era",
    "examType",
    "subject",
    "docType",
    "title",
    "sourceName",
    "originalRelativePath",
    "file",
    "archivePath",
    "bytes",
    "school",
]


def era_for_year(year: str) -> str:
    value = int(year)
    if value >= 2019:
        return f"R{value - 2018}"
    if value >= 1989:
        return f"H{value - 1988}"
    return str(value)


def normalize_subject(dirname: str) -> str:
    return re.sub(r"^\d+_", "", dirname)


def subject_code(subject: str) -> str:
    return SUBJECT_ORDER.get(subject, "99")


def slug_exam_type(exam_type: str) -> str:
    if "特別" in exam_type:
        return "special"
    if "推薦" in exam_type:
        return "recommendation"
    if "A" in exam_type or "Ａ" in exam_type:
        return "general-a"
    if "B" in exam_type or "Ｂ" in exam_type:
        return "general-b"
    return "general"


def parse_school_root(root_name: str) -> tuple[str, str, str]:
    parts = root_name.split("_")
    prefecture = parts[0] if parts else ""
    exam = parts[-1] if len(parts) >= 2 else ""
    exam = re.sub(r"問題$", "", exam)
    school = "_".join(parts[1:-1]) if len(parts) >= 3 else prefecture
    if school in {"高校入試問題", "中学入試問題", ""}:
        school = f"{prefecture}公立高校" if "高校" in exam else prefecture
    return prefecture, school, exam


def doc_type_from_name(path: Path) -> str:
    stem = path.stem
    if "問題・解答用紙" in stem:
        return "問題・解答用紙"
    if "問題_解答" in stem or "問題・解答" in stem:
        return "問題・解答"
    if "解答用紙" in stem:
        return "解答用紙"
    if "解答・解説" in stem:
        return "解答・解説"
    if "解説" in stem:
        return "解説"
    if "解答" in stem:
        return "解答"
    if "配点" in stem:
        return "配点表"
    if "問題" in stem:
        return "問題"
    return "その他"


def build_record(pdf_path: Path, data_dir: Path) -> dict[str, str]:
    rel = pdf_path.relative_to(data_dir)
    parts = rel.parts
    if len(parts) < 5:
        raise ValueError(f"Unexpected exam PDF path: {rel}")
    root_name, year, exam_type, subject_dir = parts[:4]
    prefecture, school, exam = parse_school_root(root_name)
    subject = normalize_subject(subject_dir)
    doc_type = doc_type_from_name(pdf_path)
    era = era_for_year(year)
    identifier = f"{year}-{slug_exam_type(exam_type)}-{subject_code(subject)}-{subject_code(doc_type)}"
    title = f"{era} {exam_type} {subject} {doc_type}"
    file_rel = rel.as_posix()
    return {
        "id": identifier,
        "prefecture": prefecture,
        "exam": exam,
        "year": year,
        "era": era,
        "examType": exam_type,
        "subject": subject,
        "docType": doc_type,
        "title": title,
        "sourceName": pdf_path.name,
        "originalRelativePath": "/".join(parts[1:]),
        "file": f"data/{file_rel}",
        "archivePath": "",
        "bytes": str(pdf_path.stat().st_size),
        "school": school,
    }


def record_sort_key(record: dict[str, str]) -> tuple:
    return (
        record["prefecture"],
        record["school"],
        int(record["year"]),
        record["examType"],
        subject_code(record["subject"]),
        record["docType"],
        record["file"],
    )


def write_outputs(records: list[dict[str, str]], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(records, ensure_ascii=False, indent=2)
    (out_dir / "exam_data.js").write_text(f"window.EXAM_PDF_DATA = {payload};\n", encoding="utf-8")
    (out_dir / "exam_manifest.json").write_text(payload + "\n", encoding="utf-8")
    with (out_dir / "exam_manifest.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(records)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default="data", help="Folder containing exam PDFs.")
    parser.add_argument("--out-dir", default=".", help="Folder for generated data files.")
    args = parser.parse_args()

    data_dir = Path(args.data_dir).resolve()
    out_dir = Path(args.out_dir).resolve()
    if not data_dir.is_dir():
        raise SystemExit(f"data folder not found: {data_dir}")

    records = []
    for pdf_path in sorted(data_dir.rglob("*.pdf")):
        if any(part.startswith(".") for part in pdf_path.relative_to(data_dir).parts):
            continue
        records.append(build_record(pdf_path, data_dir))
    records.sort(key=record_sort_key)
    write_outputs(records, out_dir)
    print(f"generated {len(records)} exam records")


if __name__ == "__main__":
    main()
