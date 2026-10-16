import http.server
import socketserver
import os
import sys
import urllib.parse

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def translate_path(self, path):
        # Normalize and strip query string
        parsed = urllib.parse.urlsplit(path)
        clean_path = parsed.path
        if clean_path in ('/', '/design', '/design.html'):
            path = '/design.html'
        elif clean_path in ('/figma', '/figma-ui', '/figma-ui.html'):
            path = '/figma-ui.html'
        elif clean_path in ('/site', '/home', '/website'):
            path = '/index.html'
        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), CustomHandler) as httpd:
        print(f"UI Design Preview Server running on http://0.0.0.0:{PORT} (dir: {DIRECTORY})")
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

if __name__ == '__main__':
    run()
