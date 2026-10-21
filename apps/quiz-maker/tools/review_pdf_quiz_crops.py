#!/usr/bin/env python3
"""Regenerate visually audited crops, keeping IDs and unrelated records intact.

Coordinates are normalized AFTER the source page is made upright. Bounds are
measured at the printed unit headings, independently for each column. Original
scans are never modified. Requires PyMuPDF and Pillow; no network services.
"""
from __future__ import annotations
import argparse
import io
import json
import shutil
from pathlib import Path
import fitz
from PIL import Image

ZOOM = 2.4


def layouts():
    plans = []
    def add(title, subject, filename, rotate, pages):
        p = dict(title=title, subject=subject, filename=filename, rotate=rotate, pages=pages)
        plans.append(p)
        return p
    # page, column divider, lower heading boundaries (left/right), units in
    # reading order: upper left, lower left, upper right, lower right.
    def grid(rows):
        return [(page, units, [(0,top,x,yl),(0,yl,x,1),(x,top,1,yr),(x,yr,1,1)])
                for page,x,top,yl,yr,units in rows]
    add('中受新演習小4上','社会','中学受験新演習小４上　社会.pdf',90,grid([
        (21,.512,.164,.551,.553,[1,2,3,4]),(22,.498,.09,.517,.515,[9,10,11,12]),(23,.494,.09,.516,.515,[17,18,19,20])]))
    p=add('中受新演習小4下','社会','中学受験新演習小４下　社会.pdf',90,grid([
        (19,.494,.164,.552,.552,[1,2,3,4]),(20,.495,.09,.515,.515,[9,10,11,12])]))
    p['extra']=[('中学受験新演習小４下　社会　答え.pdf',1,18,(0,.509,.50,1))]
    add('中受新演習小5上','社会','中学受験新演習小5上　社会.pdf',90,grid([
        (21,.492,.165,.553,.553,[1,2,3,4]),(22,.493,.09,.517,.516,[9,10,11,12]),(23,.494,.09,.516,.516,[17,18,19,20])]))
    add('中受新演習小6上','社会','中学受験新演習小6上　社会.pdf',90,grid([
        (21,.493,.164,.516,.518,[1,2,3,4]),(22,.502,.09,.516,.518,[9,10,11,12]),(23,.492,.09,.498,.500,[17,18,19,20])]))
    add('中受新演習小6下','社会','中学受験新演習小6下　社会.pdf',90,
        [(p,[u,u+1],[(0,.164 if p==19 else .09,x,1),(x,.164 if p==19 else .09,1,1)])
         for p,u,x in [(19,1,.496),(20,5,.495),(21,9,.499),(22,13,.497),(23,17,.500)]])
    add('標準新演習小5','理科','標準新演習小５　理科.pdf',0,grid([
        (18,.463,.145,.517,.498,[1,2,3,4]),(19,.466,.07,.447,.559,[9,10,11,12])])+
        [(20,[17],[(0,.065,.478,1)])])
    add('標準新演習小5','社会','標準新演習小５　社会.pdf',0,grid([
        (21,.479,.136,.527,.528,[1,2,3,4]),(22,.478,.06,.491,.492,[9,10,11,12]),(23,.484,.06,.487,.493,[17,18,19,20])]))
    add('標準新演習小6','理科','標準新演習小6　理科.pdf',0,grid([
        (17,.477,.15,.559,.558,[1,2,3,4]),(18,.476,.075,.467,.448,[9,10,11,12])]))
    p=add('標準新演習小6','社会','標準新演習小6　社会.pdf',0,grid([
        (19,.479,.142,.551,.550,[1,2,3,4]),(20,.480,.065,.495,.495,[9,10,11,12]),(21,.480,.065,.495,.497,[17,18,19,20])]))
    # Scans omit printed units 5 and 12. Do not identify units by page index.
    p['problem_units']=[1,2,3,4,6,7,8,9,10,11,13,14,15,16,17,18,19,20]
    p['titles']=['日本国憲法','国の政治のしくみ','身近なくらしと政治','狩りや漁から米づくりへ','平城京と平安京','武士のおこりと鎌倉幕府','室町幕府と室町文化','3人の武将と全国統一','江戸幕府の制度と鎖国','都市・文化・学問の発達','明治維新','国会の開設','日清・日露戦争','中国との戦争・太平洋戦争','戦後の復興から現代の日本へ','いろいろな国とのつながり','国際連合と日本','現代の日本と国際社会']
    # Arithmetic has variable-length explanations, often continuing at the
    # top of the next column. Repeated units produce one multi-page PDF.
    add('標準新演習小4','算数','標準新演習小４　算数.pdf',90,[
        (35,[1,2,2],[(0,.138,.505,.637),(0,.637,.505,1),(.505,.138,1,1)]),
        (36,[6,7,7],[(0,.270,.496,.786),(0,.786,.496,1),(.496,0,1,.787)]),
        (37,[11,11,12],[(0,.563,.508,1),(.508,0,1,.232),(.508,.232,1,1)]),
        (38,[15,16,16,17],[(0,.065,.503,.565),(0,.565,.503,1),(.503,0,1,.362),(.503,.362,1,1)]),
        (39,[24,24,25],[(0,.434,.502,1),(.502,0,1,.416),(.502,.416,1,1)])])
    p=add('標準新演習小5','算数','標準新演習小５　算数.pdf',90,[
        (32,[1,2,2,3],[(0,.138,.518,.711),(0,.711,.518,1),(.518,.138,1,.452),(.518,.452,1,1)]),
        (33,[8,9,9,10],[(0,.380,.511,.821),(0,.821,.511,1),(.511,0,1,.490),(.511,.490,1,1)]),
        (34,[15,16],[(0,.325,.520,1),(.520,.065,1,.655)]),
        (35,[21,22,22,23],[(0,.239,.518,.808),(0,.808,.518,1),(.518,0,1,.402),(.518,.402,1,1)]),
        (36,[27,28,28,29],[(0,.071,.509,.642),(0,.642,.509,1),(.509,0,1,.236),(.509,.236,1,1)])])
    p['problem_units']=list(range(1,31))+[32]
    return plans


def render(src, page_no, rotate):
    with fitz.open(src) as doc:
        pix=doc[page_no-1].get_pixmap(matrix=fitz.Matrix(ZOOM,ZOOM),alpha=False)
        image=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
    return image.rotate(rotate,expand=True) if rotate else image


def cut(image, bounds):
    x0,y0,x1,y1=bounds
    if not (0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1):
        raise ValueError(bounds)
    return image.crop(tuple(round(v*n) for v,n in zip(bounds,(image.width,image.height,image.width,image.height))))


def save_parts(parts, dest):
    dest.parent.mkdir(parents=True,exist_ok=True)
    with fitz.open() as doc:
        for im in parts:
            # Preserve source print scale rather than using pixel counts as points.
            stream=io.BytesIO();im.save(stream,'JPEG',quality=95)
            page=doc.new_page(width=im.width/ZOOM,height=im.height/ZOOM)
            page.insert_image(page.rect,stream=stream.getvalue())
        doc.save(dest,deflate=True)


def apply_review(data_dir, raw_dir, records):
    """Write only reviewed datasets; keep all existing record IDs unchanged."""
    affected=[]
    for plan in layouts():
        items=sorted([r for r in records if r['title']==plan['title'] and r['subject']==plan['subject']],key=lambda r:r['unit'])
        if not items:
            raise ValueError('Missing dataset: '+plan['title']+plan['subject'])
        old_paths={r[k] for r in items for k in ('problem','answer') if r.get(k)}
        unit_numbers=plan.get('problem_units',[r['unit'] for r in items])
        assert len(items)==len(unit_numbers) and len(set(unit_numbers))==len(items)
        folder=Path(plan['title'])/plan['subject']
        answers={}
        for page,units,boxes in plan['pages']:
            assert len(units)==len(boxes)
            im=render(raw_dir/plan['filename'],page,plan['rotate'])
            for u,box in zip(units,boxes):
                answers.setdefault(u,[]).append(cut(im,box))
        for filename,page,unit,box in plan.get('extra',[]):
            answers.setdefault(unit,[]).append(cut(render(raw_dir/filename,page,plan['rotate']),box))
        for i,(record,unit) in enumerate(zip(items,unit_numbers)):
            record['unit']=unit
            if 'titles' in plan:record['unitTitle']=plan['titles'][i]
            if plan['title']=='標準新演習小5' and plan['subject']=='算数' and unit==32:
                record['unitTitle']='正多角形の性質'
            if plan['subject']=='算数':
                # All arithmetic problems were also stored sideways.
                path=folder/f"{plan['title']} {plan['subject']} 第{unit}回 問題.pdf"
                save_parts([render(raw_dir/plan['filename'],i+1,plan['rotate'])],data_dir/path)
                record['problem']=path.as_posix();affected.append(path.as_posix())
            elif 'problem_units' in plan:
                path=folder/f"{plan['title']} {plan['subject']} 第{unit}回 問題.pdf"
                save_parts([render(raw_dir/plan['filename'],i+1,plan['rotate'])],data_dir/path)
                record['problem']=path.as_posix();affected.append(path.as_posix())
            if unit in answers:
                path=folder/f"{plan['title']} {plan['subject']} 第{unit}回 解答.pdf"
                save_parts(answers[unit],data_dir/path)
                record['answer']=path.as_posix();affected.append(path.as_posix())
            else:
                # An incomplete continuation or another unit is not an answer.
                record['answer']=''
        live={r[k] for r in records for k in ('problem','answer') if r.get(k)}
        for obsolete in old_paths-live:
            (data_dir/obsolete).unlink(missing_ok=True)
    return affected


def write_manifest(data,records):
    payload=json.dumps(records,ensure_ascii=False,indent=2)
    (data/'manifest.json').write_text(payload+'\n',encoding='utf-8')
    (data/'pdf_quiz_manifest.js').write_text("(() => {\n  const base = new URL('.', document.currentScript.src);\n  const records = "+payload+";\n  records.forEach(record => {\n    if (record.problem) record.problem = new URL(record.problem, base).href;\n    if (record.answer) record.answer = new URL(record.answer, base).href;\n  });\n  window.PDF_QUIZ_MANIFEST = records;\n})();\n",encoding='utf-8')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--app-dir',type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument('--source-project',type=Path,required=True)
    parser.add_argument('--backup-dir',type=Path,required=True)
    args=parser.parse_args()
    data=args.app_dir/'PDF小テストデータ'
    if args.backup_dir.exists():raise FileExistsError('Use a new backup directory')
    shutil.copytree(data,args.backup_dir)
    records=json.loads((data/'manifest.json').read_text(encoding='utf-8'))
    raw=args.source_project/'01_DB/元データ/PDF小テスト_スキャン原本/2026-06-24_受信箱追加'
    # Validate all source files before writing.
    for p in layouts():
        assert (raw/p['filename']).is_file()
        for name,*_ in p.get('extra',[]):assert (raw/name).is_file()
    affected=apply_review(data,raw,records)
    assert len(records)==len({r['id'] for r in records})
    for r in records:
        for k in ('problem','answer'):
            if r.get(k):
                with fitz.open(data/r[k]) as doc:assert len(doc)>0
    write_manifest(data,records)
    print(json.dumps(dict(records=len(records),written=len(affected),backup=str(args.backup_dir)),ensure_ascii=False))

if __name__=='__main__':main()
