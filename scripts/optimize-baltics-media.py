"""Create bounded, metadata-free WebP derivatives; keep all source files unchanged.
Run with Python 3 + Pillow: python3 scripts/optimize-baltics-media.py
"""
from pathlib import Path
from PIL import Image, ImageOps
import json
root=Path(__file__).resolve().parents[1]
base=json.loads((root/'data/site.json').read_text())['gallery']
regional=json.loads((root/'profiles/baltics/site.json').read_text())['gallery']
# Interleave countries near the start, retaining every Lithuanian photo.
items=[base[0],regional[0],regional[1],base[1],regional[2],*base[2:]]
out=[]; stats=[]
for item in items:
 src=root/item['src']; stem=src.stem
 im=ImageOps.exif_transpose(Image.open(src)).convert('RGB')
 entry={**item,'country':item.get('country','LT')}
 for size,label,quality in [(480,'thumb',76),(1600,'view',82)]:
  resized=im.copy();resized.thumbnail((size,size),Image.Resampling.LANCZOS)
  dest=root/f'assets/events/{stem}-{label}.webp'
  resized.save(dest,'WEBP',quality=quality,method=6)
  entry['thumbSrc' if label=='thumb' else 'src']=str(dest.relative_to(root))
  if label=='view':entry.update(width=resized.width,height=resized.height)
 stats.append({'source':item['src'],'originalBytes':src.stat().st_size,'thumbBytes':(root/entry['thumbSrc']).stat().st_size,'viewBytes':(root/entry['src']).stat().st_size})
 entry['originalSource']=item['src'];out.append(entry)
(root/'profiles/baltics/gallery-optimized.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
(root/'profiles/baltics/media-sizes.json').write_text(json.dumps(stats,indent=2)+'\n')
for k in ['originalBytes','thumbBytes','viewBytes']:print(k,sum(x[k] for x in stats))
