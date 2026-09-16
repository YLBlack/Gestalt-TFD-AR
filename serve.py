"""Dev server for the GESTALT fan site — like `python -m http.server 8123`
but sends strict no-cache headers, so font/CSS/JS edits show up on a plain
refresh (fixes stale-font bugs caused by browser heuristic caching)."""
import http.server
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("0.0.0.0", 8123), NoCacheHandler).serve_forever()
