#!/usr/bin/env python3
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PORT = 8765


def load_routes():
    config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
    return {
        rewrite["source"]: rewrite["destination"]
        for rewrite in config.get("rewrites", [])
    }


ROUTES = load_routes()


class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = urlsplit(self.path).path
        route = path.rstrip("/") or "/"
        if route in ROUTES:
            self.path = ROUTES[route]
        return super().send_head()


if __name__ == "__main__":
    handler = partial(PreviewHandler, directory=PUBLIC)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    print(f"Spector preview: http://localhost:{PORT}", flush=True)
    server.serve_forever()
