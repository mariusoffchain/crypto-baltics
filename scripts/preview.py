"""Local preview without PWA caching; use --pwa to test offline support."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--directory', default='public-baltics')
parser.add_argument('--port', type=int, default=8775)
parser.add_argument('--pwa', action='store_true')
args = parser.parse_args()
root = Path(args.directory).resolve()
if not (root / 'index.html').is_file():
    parser.error('Build the site before starting the preview.')

class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if not args.pwa and self.path.split('?')[0] == '/pwa.js':
            # Keep safe-area behaviour, but omit release-only SW registration.
            source = (root / 'pwa.js').read_text()
            source = source.split('// Register only in the release build')[0]
            body = source.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

print(f'Preview: http://127.0.0.1:{args.port}/ (PWA cache: {args.pwa})', flush=True)
ThreadingHTTPServer(('127.0.0.1', args.port), partial(PreviewHandler, directory=str(root))).serve_forever()
