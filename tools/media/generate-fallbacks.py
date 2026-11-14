"""Rebuild autoplay-independent artwork. Requires ffmpeg; originals are untouched.
Full source dimensions and duration; fallback WebP at 10 fps, quality 90. These larger
files are fetched only when video fails, and only for a focused/visible cover.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import re
import subprocess

root = Path(__file__).resolve().parents[2]
public = root / 'apps/web/public'
media = re.findall(r"media: '([^']+)'", (root / 'apps/web/src/components/journey/catalog.ts').read_text()) + ['circle']
(public / 'animations').mkdir(exist_ok=True)

def generate(name):
    source = public / f'{name}.mp4'
    output = public / f'animations/{name}.webp'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(source), '-vf', 'fps=10', '-c:v', 'libwebp_anim', '-quality', '90', '-compression_level', '4', '-loop', '0', str(output)], check=True)
    data = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height,avg_frame_rate,nb_frames', '-show_entries', 'format=duration', '-of', 'json', str(source)]))
    print(name, output.stat().st_size, flush=True)
    return {'media': name, 'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'bytes': output.stat().st_size, 'stream': data['streams'][0], 'duration': data['format']['duration']}

with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(generate, media))
(root / 'tools/media/fallback-manifest.json').write_text(json.dumps({'quality': 90, 'fallback_fps': 10, 'resize': False, 'sources': results}, indent=2) + '\n')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(public / 'circle.mp4'), '-frames:v', '1', '-c:v', 'libwebp', '-lossless', '1', str(public / 'images/preloader-circle.webp')], check=True)
