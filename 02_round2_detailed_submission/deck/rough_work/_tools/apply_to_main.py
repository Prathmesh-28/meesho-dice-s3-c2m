#!/usr/bin/env python3
"""Apply generator changes to the hand-edited main deck, keeping its PowerPoint edits (icons, logos, styling).

usage: apply_to_main.py MAIN.pptx GENERATOR.pptx OUT.pptx [--replace 13] [--report report.md]

1. Slide bodies: removes inline citation tags ([S#] / [A#]) and page pointers ("· p9", "(page 11)", "→ p10")
   from the text, run by run, so every run keeps its own formatting.
2. Footers: sets each slide's footer to the generator's footer for the same slide (sources live only there now,
   en dashes written as hyphens to match the hand-edited deck), then checks that every tag removed from a slide's
   body is named in that slide's footer.
3. Replaces the slides given with --replace wholesale with the generator's version (images, links and notes included)
   and drops media files nothing refers to any more.
Needs lxml (python3 -m pip install lxml).
"""
import argparse, copy, difflib, posixpath, re, sys, zipfile
from lxml import etree

NS = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'rel': 'http://schemas.openxmlformats.org/package/2006/relationships'}
EMU = 914400
RT = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/'

TAG = re.compile(r'\s*\[((?:S|A)\d+[^\]]*)\]')
POINTERS = [
    (re.compile(r'\s*·\s*p\d+(?:\s*,\s*p\d+)*(?=\s|$|[,;:)])'), ''),            # "Price discovery · p9"
    (re.compile(r'\s*\(pages?\s+[^)]*\)'), ''),                                    # "(page 11)", "(pages 5-10)", "(page where …)"
    (re.compile(r'\s*→\s*p\d+(?:\s*,\s*p\d+)*(?:\s*,\s*(Appendix [A-C]))?'),
     lambda m: f' ({m.group(1)})' if m.group(1) else ''),                          # "→ p9, Appendix C" → " (Appendix C)"
]
# Whole phrases the generator rewrote (matched with en dash or hyphen).
SPECIFIC = {
    '4 personas on page 3 (cohorts A, A, C, B)': '4 factory personas: cohorts A, A, C, B',
    'Assumptions (every input carries an [A#] in Appendix B)': 'Assumptions (all registered in Appendix B)',
    'Sources [S#] (publisher · title · date)': 'Sources (publisher · title · date)',
    'Assumption register [A#] (value · source · confidence H/M/L)': 'Assumption register (value · source · confidence H/M/L)',
    'Workings index (formula → page)': 'Workings index (formulas)',
    'pp. 2-12': 'reads the model',  # Appendix B chevron "Every page", added in PowerPoint
    'Every figure in the deck traces to a numbered source [S#] or a registered assumption [A#] in one master model':
        'Every figure in the deck traces to a numbered source (S1–S26) or a registered assumption (A1–A32) in one master model',
    'Detailed benchmarking, compliance by design and the model workings behind pages 3, 9 and 10':
        'Detailed benchmarking, compliance by design, and the workings behind the cohort, cluster and unit-cost numbers',
}


def ids(text):
    out = set()
    for k, a, b in re.findall(r'\b([SA])(\d+)(?:\s*[–-]\s*\1?(\d+))?\b', text):
        out.update(f'{k}{i}' for i in range(int(a), int(b or a) + 1))
    return out


def clean_text(text, removed):
    for old, new in SPECIFIC.items():
        for variant in {old, old.replace('–', '-')}:
            if variant in text:
                text = text.replace(variant, new.replace('–', '-'))  # the hand-edited deck writes ranges with hyphens
    def drop(m):
        removed.update(ids(m.group(1)))
        return ''
    text = TAG.sub(drop, text)
    for rx, rep in POINTERS:
        text = rx.sub(rep, text)
    return text


def set_runs(runs, new):
    """Write `new` back over the a:r runs (in order), keeping each run's formatting."""
    texts = [r.find('a:t', NS).text or '' for r in runs]
    old = ''.join(texts)
    owner = [i for i, t in enumerate(texts) for _ in t]
    parts = [''] * len(runs)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, old, new, autojunk=False).get_opcodes():
        if op == 'equal':
            for k in range(i2 - i1):
                parts[owner[i1 + k]] += new[j1 + k]
        elif op in ('insert', 'replace'):
            o = owner[min(i1, len(owner) - 1)] if owner else 0
            parts[o] += new[j1:j2]
    for r, t in zip(runs, parts):
        r.find('a:t', NS).text = t
    for r, t in list(zip(runs, parts))[1:]:
        if t == '':
            r.getparent().remove(r)


def segments(par):
    """Runs of a paragraph, split at line breaks (a match never crosses a break)."""
    seg = []
    for child in par:
        if child.tag == f'{{{NS["a"]}}}r' and child.find('a:t', NS) is not None:
            seg.append(child)
        elif child.tag == f'{{{NS["a"]}}}br' and seg:
            yield seg
            seg = []
    if seg:
        yield seg


def shape_box(sp):
    off = sp.find('p:spPr/a:xfrm/a:off', NS)
    return (int(off.get('x')) / EMU, int(off.get('y')) / EMU) if off is not None else (None, None)


def footer_shape(root):
    for sp in root.iterfind('.//p:cSld/p:spTree/p:sp', NS):
        x, y = shape_box(sp)
        if x is not None and x < 1 and 7.15 <= y <= 7.4 and sp.find('p:txBody', NS) is not None:
            return sp
    return None


def shape_text(sp):
    return '\n'.join(''.join(t.text or '' for t in p.iterfind('.//a:t', NS)) for p in sp.iterfind('p:txBody/a:p', NS))


def set_shape_text(sp, text):
    body = sp.find('p:txBody', NS)
    pars = body.findall('a:p', NS)
    for extra in pars[1:]:
        body.remove(extra)
    par = pars[0]
    runs = par.findall('a:r', NS)
    for child in list(par):
        if child.tag in (f'{{{NS["a"]}}}br', f'{{{NS["a"]}}}fld') or (child.tag == f'{{{NS["a"]}}}r' and child is not runs[0]):
            par.remove(child)
    runs[0].find('a:t', NS).text = text


def slide_parts(z):
    """Slide part names in presentation order."""
    pres = etree.fromstring(z.read('ppt/presentation.xml'))
    rels = etree.fromstring(z.read('ppt/_rels/presentation.xml.rels'))
    target = {r.get('Id'): r.get('Target') for r in rels}
    return [posixpath.normpath(posixpath.join('ppt', target[s.get(f'{{{NS["r"]}}}id')])) for s in pres.iterfind('p:sldIdLst/p:sldId', NS)]


def rels_name(part):
    d, f = posixpath.split(part)
    return f'{d}/_rels/{f}.rels'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('main'); ap.add_argument('generator'); ap.add_argument('out')
    ap.add_argument('--replace', type=int, nargs='*', default=[13])
    ap.add_argument('--report')
    args = ap.parse_args()

    zm, zg = zipfile.ZipFile(args.main), zipfile.ZipFile(args.generator)
    files = {n: zm.read(n) for n in zm.namelist()}
    order = zm.namelist()
    sm, sg = slide_parts(zm), slide_parts(zg)
    assert len(sm) == len(sg), f'slide counts differ: {len(sm)} vs {len(sg)}'
    report, problems = [], []

    for n, (pm, pg) in enumerate(zip(sm, sg), start=1):
        if n in args.replace:
            continue
        root = etree.fromstring(files[pm])
        groot = etree.fromstring(zg.read(pg))
        foot, gfoot = footer_shape(root), footer_shape(groot)
        removed, edits = set(), 0
        for par in root.iterfind('.//a:p', NS):
            if foot is not None and par.getparent().getparent() is foot:
                continue
            for seg in segments(par):
                old = ''.join(r.find('a:t', NS).text or '' for r in seg)
                new = clean_text(old, removed)
                if new != old:
                    set_runs(seg, new)
                    edits += 1
        new_foot = shape_text(gfoot).replace('–', '-') if gfoot is not None else None
        if foot is not None and new_foot and shape_text(foot) != new_foot:
            set_shape_text(foot, new_foot)
            edits += 1
        named = ids(new_foot or (shape_text(foot) if foot is not None else ''))
        missing = sorted(removed - named, key=lambda t: (t[0], int(t[1:])))
        if missing:
            problems.append(f'slide {n}: footer does not name {", ".join(missing)}')
        files[pm] = etree.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)
        report.append(f'| {n} | {edits} | {", ".join(sorted(removed, key=lambda t: (t[0], int(t[1:])))) or "-"} | {"MISSING " + ", ".join(missing) if missing else "ok"} |')

    for n in args.replace:
        pm, pg = sm[n - 1], sg[n - 1]
        mrels = etree.fromstring(files[rels_name(pm)])
        grels = etree.fromstring(zg.read(rels_name(pg)))
        keep = {r.get('Type').rsplit('/', 1)[-1]: r for r in mrels}
        out = etree.Element(f'{{{NS["rel"]}}}Relationships', nsmap={None: NS['rel']})
        for r in grels:
            kind = r.get('Type').rsplit('/', 1)[-1]
            r2 = copy.deepcopy(r)
            if kind == 'image':
                src = posixpath.normpath(posixpath.join(posixpath.dirname(pg), r.get('Target')))
                dst = f'ppt/media/s{n}_{posixpath.basename(src)}'
                files[dst] = zg.read(src)
                if dst not in order:
                    order.append(dst)
                r2.set('Target', f'../media/{posixpath.basename(dst)}')
            elif kind in ('slideLayout', 'notesSlide'):
                if kind not in keep:
                    continue
                r2.set('Target', keep[kind].get('Target'))
            out.append(r2)
        if 'notesSlide' in keep and not any(r.get('Type').endswith('/notesSlide') for r in grels):
            out.append(copy.deepcopy(keep['notesSlide']))
        files[pm] = zg.read(pg)
        files[rels_name(pm)] = etree.tostring(out, xml_declaration=True, encoding='UTF-8', standalone=True)
        # Notes: carry the generator's speaker notes into the main deck's notes slide.
        if 'notesSlide' in keep:
            gnotes = [r for r in grels if r.get('Type').endswith('/notesSlide')]
            npart = posixpath.normpath(posixpath.join(posixpath.dirname(pm), keep['notesSlide'].get('Target')))
            if gnotes:
                gpart = posixpath.normpath(posixpath.join(posixpath.dirname(pg), gnotes[0].get('Target')))
                gtext = ' '.join(t.text or '' for t in etree.fromstring(zg.read(gpart)).iterfind('.//a:t', NS)).strip()
                nroot = etree.fromstring(files[npart])
                for sp in nroot.iterfind('.//p:sp', NS):
                    ph = sp.find('.//p:nvPr/p:ph', NS)
                    if ph is not None and ph.get('type') == 'body' and sp.find('p:txBody', NS) is not None:
                        body = sp.find('p:txBody', NS)
                        for p_ in body.findall('a:p', NS)[1:]:
                            body.remove(p_)
                        par = body.find('a:p', NS)
                        for c in list(par):
                            if c.tag != f'{{{NS["a"]}}}pPr':
                                par.remove(c)
                        r_ = etree.SubElement(par, f'{{{NS["a"]}}}r')
                        etree.SubElement(r_, f'{{{NS["a"]}}}rPr', lang='en-IN', dirty='0')
                        etree.SubElement(r_, f'{{{NS["a"]}}}t').text = gtext
                files[npart] = etree.tostring(nroot, xml_declaration=True, encoding='UTF-8', standalone=True)
        report.append(f'| {n} | replaced with the generator slide | - | ok |')

    # Drop media nothing refers to any more (the replaced slide's old pictures).
    used = set()
    for name, data in files.items():
        if name.endswith('.rels'):
            base = posixpath.dirname(posixpath.dirname(name))
            for r in etree.fromstring(data):
                if r.get('TargetMode') != 'External':
                    used.add(posixpath.normpath(posixpath.join(base, r.get('Target'))))
    dropped = [n for n in files if n.startswith('ppt/media/') and n not in used]
    for n in dropped:
        del files[n]
    order = [n for n in order if n in files]

    with zipfile.ZipFile(args.out, 'w', zipfile.ZIP_DEFLATED) as zo:
        for n in order:
            zo.writestr(n, files[n])

    lines = ['| Slide | Text edits | Tags taken out of the body | Footer names them |', '|---|---|---|---|', *report]
    summary = '\n'.join(lines) + f'\n\nUnused media dropped: {len(dropped)}\n'
    if args.report:
        open(args.report, 'w').write(summary)
    print(summary)
    if problems:
        print('\n'.join(problems), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
