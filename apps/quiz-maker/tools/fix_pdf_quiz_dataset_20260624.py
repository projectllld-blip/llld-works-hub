#!/usr/bin/env python3
"""Fix PDF quiz scan orientation and answer pairing.

The 2026-06-24 inbox scans contain image-only PDFs with rotation metadata.
Using PDF crop coordinates directly can swap visual quadrants after rotation.
This script renders each source page as it appears on screen, crops the visual
area, and writes app-ready single-page PDF files from that rendered image.
"""

from __future__ import annotations

import json
import shutil
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

import fitz
from PIL import Image


APP_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = APP_DIR.parents[1]
DATA_DIR = APP_DIR / "PDF小テストデータ"
SOURCE_PROJECT = (
    REPO_ROOT.parents[2]
    / "03_塾事業"
    / "02_カリキュラム教材"
    / "01_教材開発"
    / "小テスト作成システム"
)
RAW_DIR = SOURCE_PROJECT / "01_DB" / "元データ" / "PDF小テスト_スキャン原本" / "2026-06-24_受信箱追加"
SOURCE_DATA_DIR = SOURCE_PROJECT / "01_DB" / "変換済み教材DB" / "PDF小テストデータ"
SOURCE_DIST_DIR = SOURCE_PROJECT / "00_製品版_配布用" / "小テスト作成システム_配布用" / "PDF小テストデータ"

Crop = tuple[float, float, float, float]

TL: Crop = (0.0, 0.0, 0.5, 0.5)
TR: Crop = (0.5, 0.0, 1.0, 0.5)
BL: Crop = (0.0, 0.5, 0.5, 1.0)
BR: Crop = (0.5, 0.5, 1.0, 1.0)


@dataclass(frozen=True)
class AnswerPage:
    page: int
    units: list[int]
    crops: list[Crop]


@dataclass(frozen=True)
class Plan:
    filename: str
    title: str
    subject: str
    group: str
    level: str
    problem_count: int
    answer_pages: list[AnswerPage] = field(default_factory=list)
    extra_answer_file: str | None = None
    extra_answer_page: int | None = None
    extra_answer_unit: int | None = None
    extra_answer_crop: Crop | None = None
    unit_titles: dict[int, str] = field(default_factory=dict)
    rotate_visual: int = 0


STANDARD_SOCIAL_TITLES = {
    ("標準新演習小5", "社会"): {
        1: "世界と日本の国土",
        2: "くらしと地形",
        3: "くらしと気候",
        4: "米づくりと農業のさかんな地域",
        5: "米づくりのくふうとこれから",
        6: "野菜・くだもの・畜産",
        7: "いも類・豆類・工芸作物",
        8: "とる漁業",
        9: "つくり育てる漁業",
        10: "これからの食料生産",
        11: "自動車をつくる工業",
        12: "工業のようす",
        13: "工業のさかんな地域",
        14: "運輸",
        15: "貿易",
        16: "情報を伝える",
        17: "情報を役立てる",
        18: "災害と自然を守る活動",
        19: "くらしと森林",
        20: "公害と環境問題",
    },
    ("標準新演習小6", "社会"): {
        1: "日本国憲法",
        2: "国の政治のしくみ",
        3: "身近なくらしと政治",
        4: "結びつきが深まる世界",
        5: "平城京と平安京",
        6: "武士の力と江戸幕府",
        7: "武士の世から江戸幕府",
        8: "室町幕府と室町文化",
        9: "3人の武将と全国統一",
        10: "江戸幕府の制度と鎖国",
        11: "都市・文化・学問の発達",
        12: "開国と明治維新",
        13: "日清・日露戦争",
        14: "中国との戦争・太平洋戦争",
        15: "世界の動きから現代の日本へ",
        16: "いろいろな国とのつながり",
        17: "国際連合と日本",
        18: "現代の日本と国際社会",
    },
}


CHUJUKEN_SOCIAL_TITLES = {
    "中受新演習小4上": {
        1: "わたしたちのくらしと水",
        2: "わたしたちのまわりの環境",
        3: "わたしたちのまわりの道具",
        4: "地図の見方",
        5: "第1回～第4回のまとめ",
        6: "日本の地方区分と都道府県",
        7: "日本の気候と地形",
        8: "寒さのきびしい地域の特色",
        9: "一年中あたたかい地域の特色",
        10: "第6回～第9回のまとめ",
        11: "雪の多い地域の特色",
        12: "雨の多い地域の特色",
        13: "雨の少ない地域の特色",
        14: "低い土地のようす",
        15: "第11回～第14回のまとめ",
        16: "高い土地のようす",
        17: "盆地のようす",
        18: "海辺のようす",
        19: "日本の災害・防災",
        20: "第16回～第19回のまとめ",
    },
    "中受新演習小4下": {
        1: "日本の自然環境(1)",
        2: "日本の自然環境(2)",
        3: "北海道・東北地方",
        4: "関東地方",
        5: "第1回～第4回のまとめ",
        6: "中部地方",
        7: "近畿地方",
        8: "中国・四国地方",
        9: "九州地方",
        10: "第6回～第9回のまとめ",
        11: "米づくり",
        12: "穀物・いも類づくり",
        13: "野菜づくり",
        14: "くだものづくり",
        15: "第11回～第14回のまとめ",
        16: "畜産・工芸作物",
        17: "農業生産を高める工夫",
        18: "第16回～第17回のまとめ",
    },
    "中受新演習小5上": {
        1: "日本のすがた",
        2: "日本の水産業",
        3: "日本の資源と林業",
        4: "交通と情報",
        5: "第1回～第4回のまとめ",
        6: "工業の種類",
        7: "工業の発達と工業地域",
        8: "工業のさかんな地域",
        9: "日本の工業の課題",
        10: "第6回～第9回のまとめ",
        11: "日本の貿易",
        12: "地形図のよみとり",
        13: "九州地方",
        14: "中国・四国地方",
        15: "第11回～第14回のまとめ",
        16: "近畿地方",
        17: "中部地方",
        18: "関東地方",
        19: "東北地方・北海道地方",
        20: "第16回～第19回のまとめ",
    },
    "中受新演習小5下": {
        1: "大昔のくらしとくにの成り立ち",
        2: "国の統一と天皇中心の政治",
        3: "律令政治と奈良の都",
        4: "貴族による政治・武士の台頭",
        5: "第1回～第4回のまとめ",
        6: "武士の世の中と鎌倉幕府",
        7: "南北朝と室町幕府",
        8: "戦乱の世から天下の統一へ",
        9: "江戸幕府の成立と鎖国",
        10: "第6回～第9回のまとめ",
        11: "江戸幕府の政治改革",
        12: "産業・交通・都市の発達",
        13: "開国から明治維新へ",
        14: "文明開化と立憲国家への道",
        15: "第11回～第14回のまとめ",
        16: "条約改正と日清・日露戦争 産業の発展",
        17: "大正デモクラシーと第一次世界大戦",
        18: "第16回～第17回のまとめ",
    },
    "中受新演習小6上": {
        1: "アジア・太平洋に広がる戦争",
        2: "平和で豊かな日本をめざして",
        3: "各時代の文化(1)",
        4: "各時代の文化(2)",
        5: "第1回～第4回のまとめ",
        6: "日本国憲法と基本的人権",
        7: "日本の国会",
        8: "日本の内閣・裁判所",
        9: "三権分立・選挙",
        10: "第6回～第9回のまとめ",
        11: "地方自治・社会保障",
        12: "日本の財政・経済",
        13: "地球環境と日本の自然・文化遺産",
        14: "世界のすがた",
        15: "第11回～第14回のまとめ",
        16: "世界の国々",
        17: "国際連合・国際組織",
        18: "国際紛争・戦争と国際社会の課題",
        19: "現在の日本と世界",
        20: "第16回～第19回のまとめ",
    },
    "中受新演習小6下": {
        1: "日本のすがたと産業",
        2: "九州地方，中国・四国地方，近畿地方",
        3: "中部地方，関東地方，東北地方・北海道地方",
        4: "古代・中世・近世の歴史",
        5: "近代の歴史",
        6: "近代・現代の歴史",
        7: "国の政治のしくみ",
        8: "身近な社会のしくみ，国際社会",
        9: "データ資料を読み取る問題(1)―地理",
        10: "データ資料を読み取る問題(2)―歴史",
        11: "データ資料を読み取る問題(3)―公民",
        12: "文章を読み取る問題(1)―地理",
        13: "文章を読み取る問題(2)―歴史",
        14: "文章を読み取る問題(3)―公民",
        15: "3分野(地理・歴史・公民)総合問題",
        16: "入試頻出直前対策(1)",
        17: "入試頻出直前対策(2)",
        18: "入試頻出直前対策(3)",
    },
}


def load_manifest() -> list[dict]:
    return json.loads((DATA_DIR / "manifest.json").read_text(encoding="utf-8"))


def write_manifest(records: list[dict]) -> None:
    records = sorted(
        records,
        key=lambda r: (
            r.get("group", ""),
            r.get("title", ""),
            r.get("subject", ""),
            r.get("unit", 0),
            r.get("problem", ""),
        ),
    )
    for i, record in enumerate(records, start=1):
        record["id"] = f"pdf_{i:04d}"
    payload = json.dumps(records, ensure_ascii=False, indent=2)
    (DATA_DIR / "manifest.json").write_text(payload + "\n", encoding="utf-8")
    (DATA_DIR / "pdf_quiz_manifest.js").write_text(
        "(() => {\n"
        "  const base = new URL('.', document.currentScript.src);\n"
        f"  const records = {payload};\n"
        "  records.forEach(record => {\n"
        "    if (record.problem) record.problem = new URL(record.problem, base).href;\n"
        "    if (record.answer) record.answer = new URL(record.answer, base).href;\n"
        "  });\n"
        "  window.PDF_QUIZ_MANIFEST = records;\n"
        "})();\n",
        encoding="utf-8",
    )


def render_visual_page(src: Path, page_no: int, zoom: float = 2.4) -> Image.Image:
    doc = fitz.open(src)
    page = doc[page_no - 1]
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    doc.close()
    return image


def crop_image(image: Image.Image, crop: Crop | None) -> Image.Image:
    if crop is None:
        return image
    x0, y0, x1, y1 = crop
    w, h = image.size
    return image.crop((round(w * x0), round(h * y0), round(w * x1), round(h * y1)))


def save_image_pdf(image: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        image.save(tmp_path, "JPEG", quality=92, optimize=True)
        w, h = image.size
        doc = fitz.open()
        page = doc.new_page(width=w, height=h)
        page.insert_image(fitz.Rect(0, 0, w, h), filename=str(tmp_path))
        doc.save(dest)
        doc.close()
    finally:
        tmp_path.unlink(missing_ok=True)


def write_visual_pdf(src: Path, dest: Path, page_no: int, crop: Crop | None = None, rotate_visual: int = 0) -> None:
    image = crop_image(render_visual_page(src, page_no), crop)
    if rotate_visual:
        image = image.rotate(rotate_visual, expand=True)
    save_image_pdf(image, dest)


def rel(path: Path) -> str:
    return path.relative_to(DATA_DIR).as_posix()


def answer_blocks(page: int, units: list[int], mode: str) -> AnswerPage:
    if mode == "social":
        return AnswerPage(page, units, [TR, TL, BR, BL][: len(units)])
    if mode == "standard":
        return AnswerPage(page, units, [TL, BL, TR, BR][: len(units)])
    if mode == "halves":
        return AnswerPage(page, units, [TL, BL][: len(units)])
    raise ValueError(mode)


def build_plans() -> list[Plan]:
    social_plans = [
        Plan("中学受験新演習小４上　社会.pdf", "中受新演習小4上", "社会", "中学受験新演習", "小4上", 20, [
            answer_blocks(21, [1, 2, 3, 4], "social"),
            answer_blocks(22, [9, 10, 11, 12], "social"),
            answer_blocks(23, [17, 18, 19, 20], "social"),
        ], unit_titles=CHUJUKEN_SOCIAL_TITLES["中受新演習小4上"], rotate_visual=90),
        Plan("中学受験新演習小４下　社会.pdf", "中受新演習小4下", "社会", "中学受験新演習", "小4下", 18, [
            answer_blocks(19, [1, 2, 3, 4], "social"),
            answer_blocks(20, [9, 10, 11, 12], "social"),
        ], extra_answer_file="中学受験新演習小４下　社会　答え.pdf", extra_answer_page=1, extra_answer_unit=18, extra_answer_crop=TL, unit_titles=CHUJUKEN_SOCIAL_TITLES["中受新演習小4下"], rotate_visual=90),
        Plan("中学受験新演習小5上　社会.pdf", "中受新演習小5上", "社会", "中学受験新演習", "小5上", 20, [
            answer_blocks(21, [1, 2, 3, 4], "social"),
            answer_blocks(22, [9, 10, 11, 12], "social"),
            answer_blocks(23, [17, 18, 19, 20], "social"),
        ], unit_titles=CHUJUKEN_SOCIAL_TITLES["中受新演習小5上"], rotate_visual=90),
        Plan("中学受験新演習小5下　社会.pdf", "中受新演習小5下", "社会", "中学受験新演習", "小5下", 18, [], unit_titles=CHUJUKEN_SOCIAL_TITLES["中受新演習小5下"], rotate_visual=90),
        Plan("中学受験新演習小6上　社会.pdf", "中受新演習小6上", "社会", "中学受験新演習", "小6上", 20, [
            answer_blocks(21, [1, 2, 3, 4], "social"),
            answer_blocks(22, [9, 10, 11, 12], "social"),
            answer_blocks(23, [17, 18, 19, 20], "social"),
        ], unit_titles=CHUJUKEN_SOCIAL_TITLES["中受新演習小6上"], rotate_visual=90),
        Plan("中学受験新演習小6下　社会.pdf", "中受新演習小6下", "社会", "中学受験新演習", "小6下", 18, [
            answer_blocks(19, [1, 2], "halves"),
            answer_blocks(20, [5, 6], "halves"),
            answer_blocks(21, [9, 10], "halves"),
            answer_blocks(22, [13, 14], "halves"),
            answer_blocks(23, [17, 18], "halves"),
        ], unit_titles=CHUJUKEN_SOCIAL_TITLES["中受新演習小6下"], rotate_visual=90),
    ]

    standard_specs = [
        ("標準新演習小４　算数.pdf", "標準新演習小4", "算数", "小4", 34, [(35, [1, 2, 3, 4]), (36, [9, 10, 11, 12]), (37, [17, 18, 19, 20]), (38, [25, 26, 27, 28]), (39, [29, 30, 31, 32])]),
        ("標準新演習小５　算数.pdf", "標準新演習小5", "算数", "小5", 31, [(32, [1, 2, 3, 4]), (33, [9, 10, 11, 12]), (34, [17, 18, 19, 20]), (35, [25, 26, 27, 28]), (36, [29, 30, 31])]),
        ("標準新演習小５　理科.pdf", "標準新演習小5", "理科", "小5", 17, [(18, [1, 2, 3, 4]), (19, [9, 10, 11, 12]), (20, [17])]),
        ("標準新演習小５　社会.pdf", "標準新演習小5", "社会", "小5", 20, [(21, [1, 2, 3, 4]), (22, [9, 10, 11, 12]), (23, [17, 18, 19, 20])]),
        ("標準新演習小6　理科.pdf", "標準新演習小6", "理科", "小6", 16, [(17, [1, 2, 3, 4]), (18, [9, 10, 11, 12])]),
        ("標準新演習小6　社会.pdf", "標準新演習小6", "社会", "小6", 18, [(19, [1, 2, 3, 4]), (20, [9, 10, 11, 12]), (21, [17, 18])]),
    ]
    standard_plans = [
        Plan(
            filename,
            title,
            subject,
            "標準新演習",
            level,
            problem_count,
            [answer_blocks(page, units, "standard") for page, units in answer_specs],
            unit_titles=STANDARD_SOCIAL_TITLES.get((title, subject), {}),
        )
        for filename, title, subject, level, problem_count, answer_specs in standard_specs
    ]
    return social_plans + standard_plans


def existing_unit_titles(records: list[dict]) -> dict[tuple[str, str, str, int], str]:
    titles = {}
    for record in records:
        key = (record.get("group", ""), record.get("title", ""), record.get("subject", ""), int(record.get("unit", 0)))
        title = record.get("unitTitle", "")
        if title:
            titles[key] = title
    return titles


def make_record(plan: Plan, unit: int, problem: str, answer: str, source: str, title_lookup: dict[tuple[str, str, str, int], str]) -> dict:
    key = (plan.group, plan.title, plan.subject, unit)
    unit_title = plan.unit_titles.get(unit) or title_lookup.get(key) or f"第{unit}回"
    return {
        "id": "",
        "title": plan.title,
        "subject": plan.subject,
        "group": plan.group,
        "level": plan.level,
        "unit": unit,
        "problem": problem,
        "answer": answer,
        "source": source,
        "unitTitle": unit_title,
    }


def generate_plan(plan: Plan, title_lookup: dict[tuple[str, str, str, int], str]) -> list[dict]:
    src = RAW_DIR / plan.filename
    if not src.exists():
        raise FileNotFoundError(src)

    folder = DATA_DIR / plan.title / plan.subject
    folder.mkdir(parents=True, exist_ok=True)
    records = []
    answer_map: dict[int, str] = {}

    for block in plan.answer_pages:
        for unit, crop in zip(block.units, block.crops):
            answer_dest = folder / f"{plan.title} {plan.subject} 第{unit}回 解答.pdf"
            write_visual_pdf(src, answer_dest, block.page, crop, plan.rotate_visual)
            answer_map[unit] = rel(answer_dest)

    if plan.extra_answer_file and plan.extra_answer_unit and plan.extra_answer_page and plan.extra_answer_crop:
        extra_src = RAW_DIR / plan.extra_answer_file
        answer_dest = folder / f"{plan.title} {plan.subject} 第{plan.extra_answer_unit}回 解答.pdf"
        write_visual_pdf(extra_src, answer_dest, plan.extra_answer_page, plan.extra_answer_crop, plan.rotate_visual)
        answer_map[plan.extra_answer_unit] = rel(answer_dest)

    for unit in range(1, plan.problem_count + 1):
        problem_dest = folder / f"{plan.title} {plan.subject} 第{unit}回 問題.pdf"
        write_visual_pdf(src, problem_dest, unit, rotate_visual=plan.rotate_visual)
        source = plan.filename
        if unit == plan.extra_answer_unit and plan.extra_answer_file:
            source += f" / {plan.extra_answer_file}"
        records.append(make_record(plan, unit, rel(problem_dest), answer_map.get(unit, ""), source, title_lookup))
    return records


def sync_source_project() -> None:
    if SOURCE_DATA_DIR.exists():
        shutil.rmtree(SOURCE_DATA_DIR)
    shutil.copytree(DATA_DIR, SOURCE_DATA_DIR)
    if SOURCE_DIST_DIR.exists():
        shutil.rmtree(SOURCE_DIST_DIR)
    shutil.copytree(DATA_DIR, SOURCE_DIST_DIR)


def remove_unpublished_dirs() -> None:
    for folder in DATA_DIR.glob("定期テスト対策ワーク*"):
        if folder.is_dir():
            shutil.rmtree(folder)


def main() -> None:
    records = load_manifest()
    title_lookup = existing_unit_titles(records)
    plans = build_plans()
    plan_keys = {(p.group, p.title, p.subject) for p in plans}
    remove_unpublished_dirs()

    kept = [
        r
        for r in records
        if r.get("group") != "定期テスト対策ワーク"
        and (r.get("group"), r.get("title"), r.get("subject")) not in plan_keys
    ]
    generated: list[dict] = []
    for plan in plans:
        generated.extend(generate_plan(plan, title_lookup))
    kept.extend(generated)
    write_manifest(kept)
    sync_source_project()
    print(f"manifest records: {len(kept)}")
    print(f"generated records: {len(generated)}")
    print("removed group: 定期テスト対策ワーク")


if __name__ == "__main__":
    main()
