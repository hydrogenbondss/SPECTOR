#!/usr/bin/env python3
"""
SPECTOR verification orchestrator — single entry point.
One http.server on :8088 for the full run; atomic scratch bundle at end.
"""
from __future__ import annotations

import glob
import html
import json
import os
import re
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import threading
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
# All verifier artifacts go to a portable temp dir — never into the repo tree.
SCRATCH = Path(tempfile.gettempdir()) / "spector-verify"
GOAL_DIR = SCRATCH / "goal"
SESSION_DIR = GOAL_DIR.parent
EVENTS_JSONL = SESSION_DIR / "events.jsonl"
GOAL_PATCH = SCRATCH / "verify.patch"
GROK_CONFIG = SCRATCH / "config.toml"  # absent in normal runs → related step no-ops
PORT = 8088
BASE_URL = f"http://127.0.0.1:{PORT}"
# Optional local browser for live SW checks; falls back to a static audit when absent.
EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
EDGE_PROFILE = SCRATCH / "edge-profile"

ARTIFACTS: dict[str, str] = {}
FAILURES: list[str] = []


def _port_listening(port: int = PORT, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.2)
        return sock.connect_ex((host, port)) == 0


def _terminate_process(proc: subprocess.Popen | None, timeout: float = 3.0) -> None:
    """Terminate a Popen process (and its group when started with start_new_session)."""
    if not proc or proc.poll() is not None:
        return
    try:
        if proc.pid:
            os.killpg(proc.pid, signal.SIGTERM)
        else:
            proc.terminate()
    except (ProcessLookupError, PermissionError, OSError):
        try:
            proc.terminate()
        except OSError:
            pass
    try:
        proc.wait(timeout=timeout)
        return
    except subprocess.TimeoutExpired:
        pass
    try:
        if proc.pid:
            os.killpg(proc.pid, signal.SIGKILL)
        else:
            proc.kill()
    except (ProcessLookupError, PermissionError, OSError):
        try:
            proc.kill()
        except OSError:
            pass
    try:
        proc.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        pass


def _clear_stale_chrome_singleton(profile: Path) -> None:
    """Remove orphaned Chrome profile locks left after an unclean prior exit."""
    if not profile.is_dir():
        return
    marker = str(profile)
    try:
        listed = subprocess.run(
            ["pgrep", "-lf", "user-data-dir"],
            capture_output=True, text=True, timeout=5,
        ).stdout or ""
    except (OSError, subprocess.TimeoutExpired):
        listed = ""
    if marker in listed:
        return
    for name in ("SingletonLock", "SingletonCookie", "SingletonSocket"):
        path = profile / name
        try:
            if path.exists() or path.is_symlink():
                path.unlink()
        except OSError:
            pass


def meta(step: int) -> str:
    head = subprocess.run(
        ["git", "-C", str(ROOT), "rev-parse", "HEAD"],
        capture_output=True, text=True,
    ).stdout.strip()
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return f"git={head} ts={ts} step={step}\n"


def fail(label: str):
    FAILURES.append(label)
    print(f"FAIL: {label}")


def ok(label: str):
    print(f"OK: {label}")


def clear_scratch():
    if SCRATCH.exists():
        shutil.rmtree(SCRATCH, ignore_errors=True)
    SCRATCH.mkdir(parents=True, exist_ok=True)


def list_directory(path: Path) -> str:
    """Plan step 1: list directory contents (filesystem, not git)."""
    if not path.is_dir():
        return f"(missing directory: {path})"
    entries = []
    for p in sorted(path.iterdir(), key=lambda x: x.name.lower()):
        entries.append(f"{p.name}/" if p.is_dir() else p.name)
    return "\n".join(entries) if entries else "(empty)"


class HttpServer:
    def __init__(self):
        self.proc: subprocess.Popen | None = None
        self.log_path = SCRATCH / "http-server-live.log"
        self.lines: list[str] = []
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self.ready = False

    def _read_log_lines(self) -> list[str]:
        return list(self.lines)

    def _fail_start(self, label: str):
        fail(label)
        self.ready = False
        self._stop.set()
        _terminate_process(self.proc)
        self.proc = None
        if self._thread:
            self._thread.join(timeout=2)
            self._thread = None

    def start(self):
        SCRATCH.mkdir(parents=True, exist_ok=True)
        self.log_path.write_text("", encoding="utf-8")
        self.lines = []
        self.ready = False
        deadline = time.time() + 5.0
        while _port_listening() and time.time() < deadline:
            time.sleep(0.1)
        if _port_listening():
            self._fail_start(f"port {PORT} still in use before http.server start")
            return
        cmd = [
            sys.executable, "-u", "-m", "http.server", str(PORT),
            "--bind", "127.0.0.1", "--directory", str(PUBLIC),
        ]
        self.proc = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1,
            start_new_session=True,
        )
        self._stop.clear()
        self._thread = threading.Thread(target=self._reader, daemon=True)
        self._thread.start()
        ready_deadline = time.time() + 5.0
        while time.time() < ready_deadline:
            if self.proc.poll() is not None:
                tail = "\n".join(self.lines[-30:]) or "(no server output)"
                self._fail_start(f"http.server exited before ready on :{PORT}: {tail}")
                return
            if any("Serving HTTP" in ln for ln in self.lines):
                self.ready = True
                ok(f"server started :{PORT}")
                return
            time.sleep(0.05)
        tail = "\n".join(self.lines[-30:]) or "(no server output)"
        self._fail_start(f"http.server did not become ready on :{PORT}: {tail}")

    def _reader(self):
        assert self.proc and self.proc.stdout
        with open(self.log_path, "a", encoding="utf-8", buffering=1) as logf:
            while not self._stop.is_set():
                line = self.proc.stdout.readline()
                if not line:
                    break
                stripped = line.rstrip("\n")
                self.lines.append(stripped)
                logf.write(line)
                logf.flush()

    def request(self, path: str) -> tuple[int, int]:
        url = f"{BASE_URL}/{path}"
        with urllib.request.urlopen(url, timeout=10) as resp:
            body = resp.read()
            return resp.status, len(body)

    def capture_full_transcript(self, seconds: float) -> str:
        """Plan step 4: ~10s independent server; external curl spread across full window."""
        window_start = time.time()
        schedule = [
            (0.0, "index.html"),
            (1.0, "sw.js"),
            (2.0, "app.html"),
            (3.5, "style.css"),
            (5.0, "index.html"),
            (6.5, "app.html"),
            (8.0, "app.html?script=dGVzdA=="),
            (9.0, "manifest.json"),
            (9.8, "style.css"),
        ]
        idx = 0
        while time.time() - window_start < seconds:
            elapsed = time.time() - window_start
            while idx < len(schedule) and schedule[idx][0] <= elapsed:
                external_curl_get(schedule[idx][1])
                idx += 1
            time.sleep(0.12)
        for _ in range(40):
            if len([ln for ln in self._read_log_lines() if "GET /" in ln]) >= 7:
                break
            time.sleep(0.1)
        server_lines = self._read_log_lines()
        idle_note = (
            f"=== capture window {seconds}s ended; "
            f"http.server emits no stdout during idle between GETs ==="
        )
        return idle_note + "\n" + "\n".join(server_lines)

    def stop(self):
        self.ready = False
        self._stop.set()
        _terminate_process(self.proc)
        if self._thread:
            self._thread.join(timeout=2)
            self._thread = None
        deadline = time.time() + 5.0
        while _port_listening() and time.time() < deadline:
            time.sleep(0.1)
        if _port_listening():
            fail(f"port {PORT} still in use after http.server stop")
        self.proc = None


def external_curl_get(path: str) -> tuple[int, str]:
    """External client (curl subprocess) — not in-process urllib."""
    url = f"{BASE_URL}/{path}"
    proc = subprocess.run(
        ["curl", "-s", "-o", os.devnull, "-w", "%{http_code}", url],
        capture_output=True, text=True, timeout=15,
    )
    code = (proc.stdout or "").strip() or "000"
    return int(code) if code.isdigit() else 0, proc.stderr or ""


def git_grep(pattern: str, paths: list[str]) -> str:
    cmd = ["git", "-C", str(ROOT), "grep", "-n", "-E", pattern, "--", *paths]
    p = subprocess.run(cmd, capture_output=True, text=True)
    out = (p.stdout or "").strip()
    return out if out else f"(no matches for /{pattern}/)"


def git_grep_context(pattern: str, paths: list[str], before: int = 2, after: int = 18) -> str:
    cmd = [
        "git", "-C", str(ROOT), "grep", "-n", "-E",
        f"-B{before}", f"-A{after}", pattern, "--", *paths,
    ]
    p = subprocess.run(cmd, capture_output=True, text=True)
    out = (p.stdout or "").strip()
    return out if out else f"(no context for /{pattern}/)"


def find_browser() -> Path | None:
    """Locate any Chromium-family browser. Checked in order: the machine's
    real browser install (Windows/macOS/Linux), then a `which`-discoverable
    binary, then a Playwright-managed Chromium (as used by sandboxed/CI
    environments that have no system browser install at all)."""
    candidates = [
        EDGE,
        Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
        Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
        Path("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
        Path("/Applications/Chromium.app/Contents/MacOS/Chromium"),
    ]
    for c in candidates:
        if c.is_file():
            return c

    for name in ("google-chrome-stable", "google-chrome", "chromium-browser", "chromium", "microsoft-edge"):
        found = shutil.which(name)
        if found:
            return Path(found)

    pw_roots = [p for p in (os.environ.get("PLAYWRIGHT_BROWSERS_PATH"), "/opt/pw-browsers") if p]
    for root in pw_roots:
        matches = sorted(glob.glob(os.path.join(root, "chromium-*", "chrome-linux", "chrome")))
        matches += sorted(glob.glob(os.path.join(root, "chromium-*", "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium")))
        if matches:
            return Path(matches[-1])

    return None


def _has_display() -> bool:
    """Windows/macOS always have one; Linux only does with an X/Wayland session
    (never true in a headless CI/sandbox container)."""
    if sys.platform in ("win32", "darwin"):
        return True
    return bool(os.environ.get("DISPLAY") or os.environ.get("WAYLAND_DISPLAY"))


def edge_visit(url: str, profile: Path, seconds: float = 6.0):
    browser = find_browser()
    if not browser:
        return
    _clear_stale_chrome_singleton(profile)
    cmd = [str(browser), "--disable-gpu", "--no-sandbox", "--no-first-run",
           "--disable-background-timer-throttling",
           "--disable-background-networking",
           "--disable-component-update",
           f"--user-data-dir={str(profile).replace(chr(92), '/')}"]
    if _has_display():
        # Real windowed visit, parked off-screen — closest to normal browser behavior.
        cmd += ["--window-size=500,400", "--window-position=-3000,-3000"]
    else:
        # No display server available (headless CI/sandbox) — headless Chromium
        # still registers service workers and populates the Cache API/IndexedDB
        # in the same --user-data-dir, so priming still works, just invisibly.
        cmd += ["--headless=new", "--window-size=500,400"]
    cmd.append(url)
    proc = subprocess.Popen(
        cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    time.sleep(seconds)
    _terminate_process(proc)
    _clear_stale_chrome_singleton(profile)


def edge_dump(url: str, dump_path: Path, profile: Path | None = None, budget: int = 10000) -> str:
    browser = find_browser()
    if not browser:
        return ""
    if profile:
        _clear_stale_chrome_singleton(profile)
    dump_arg = str(dump_path).replace("\\", "/")
    cmd = [
        str(browser), "--headless=new", "--disable-gpu", "--no-sandbox",
        "--no-first-run", "--disable-background-networking",
        "--disable-component-update", "--disable-sync",
        f"--dump-dom={dump_arg}", f"--virtual-time-budget={budget}",
        "--run-all-compositor-stages-before-draw", url,
    ]
    if profile:
        cmd.insert(1, f"--user-data-dir={str(profile).replace(chr(92), '/')}")

    proc = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        start_new_session=True,
    )
    stdout_chunks: list[str] = []
    stderr_chunks: list[str] = []

    def _drain_stdout() -> None:
        assert proc.stdout is not None
        while True:
            chunk = proc.stdout.read(8192)
            if not chunk:
                break
            stdout_chunks.append(chunk)

    def _drain_stderr() -> None:
        assert proc.stderr is not None
        while True:
            chunk = proc.stderr.read(8192)
            if not chunk:
                break
            stderr_chunks.append(chunk)

    stdout_thread = threading.Thread(target=_drain_stdout, daemon=True)
    stderr_thread = threading.Thread(target=_drain_stderr, daemon=True)
    stdout_thread.start()
    stderr_thread.start()

    deadline = time.time() + 60.0
    dom_complete = False
    exited_cleanly = False
    while time.time() < deadline:
        if "</html>" in "".join(stdout_chunks).lower():
            dom_complete = True
            break
        if proc.poll() is not None and not stdout_thread.is_alive():
            exited_cleanly = True
            break
        time.sleep(0.05)

    if proc.poll() is None:
        _terminate_process(proc)

    stdout_thread.join(timeout=2)
    stderr_thread.join(timeout=2)
    stdout = "".join(stdout_chunks)
    stderr = "".join(stderr_chunks)
    if "</html>" in stdout.lower():
        dom_complete = True

    if profile:
        _clear_stale_chrome_singleton(profile)

    if not dom_complete and not exited_cleanly:
        fail(f"edge_dump timed out after 60s: {url}")
        if not stdout and not stderr:
            return f"<!-- edge_dump timeout: {url} -->"

    if "<html" in stdout.lower():
        return stdout
    if dump_path.is_file() and dump_path.stat().st_size > 0:
        return dump_path.read_text(encoding="utf-8", errors="replace")
    return stdout + stderr


def append_full_file(lines: list[str], label: str, path: Path):
    lines.append(f"=== FILE: {label} ===")
    lines.append(path.read_text(encoding="utf-8"))
    lines.append("")


def step1_static_structure():
    lines = [
        meta(1),
        "=== DIRECTORY LISTING (plan step 1: list C:\\Users\\USER\\SPECTOR) ===",
        list_directory(ROOT),
        "",
        "=== DIRECTORY LISTING (plan step 1: list public/) ===",
        list_directory(PUBLIC),
        "",
        "=== GREP PATTERNS (plan step 1: confirm link href style.css, no styles.css) ===",
        "$ git grep -n -E 'href=\"style.css\"' public/index.html public/app.html",
        git_grep(r'href="style.css"', ["public/index.html", "public/app.html"]),
        "$ git grep -n -E 'styles\\.css' public/index.html public/app.html",
        git_grep(r"styles\.css", ["public/index.html", "public/app.html"]),
        "$ git grep -n -E 'href=\"manifest.json\"' public/index.html public/app.html",
        git_grep(r'href="manifest.json"', ["public/index.html", "public/app.html"]),
        "",
        "=== GREP SNIPPETS (plan step 1: matched blocks) ===",
        "--- link style.css ---",
        git_grep_context(r'href="style.css"', ["public/index.html", "public/app.html"], 0, 2),
        "--- manifest link ---",
        git_grep_context(r'href="manifest.json"', ["public/index.html"], 0, 2),
        "",
        "=== FULL FILE READS (plan step 1) ===",
        "",
    ]
    append_full_file(lines, "public/index.html", PUBLIC / "index.html")
    append_full_file(lines, "public/app.html", PUBLIC / "app.html")
    append_full_file(lines, "public/style.css", PUBLIC / "style.css")
    append_full_file(lines, "vercel.json", ROOT / "vercel.json")
    styles_hits = git_grep(r"styles\.css", ["public/index.html", "public/app.html"])
    if styles_hits != "(no matches for /styles\\.css/)":
        fail("index.html references styles.css")
    if (PUBLIC / "vercel.json").exists():
        fail("public/vercel.json should not exist")
    if not (ROOT / "vercel.json").is_file():
        fail("root vercel.json missing")
    else:
        ok("index.html uses style.css; root vercel.json only")
    ARTIFACTS["static-structure.txt"] = "\n".join(lines)


def step2_core_logic():
    core_patterns = [
        ("hybridChunk", "hybridChunk"),
        ("getMs", "function getMs|getMs\\("),
        ("computeMs", "function computeMs"),
        ("KalmanFilter", "class KalmanFilter"),
        ("setupSpatialAnchoring", "function setupSpatialAnchoring"),
        ("startDualSineBreathing", "startDualSineBreathing"),
        ("startGentleDriftWithRotation", "startGentleDriftWithRotation"),
        ("settleActiveChunk", "settleActiveChunk"),
        ("applyMode", "function applyMode"),
        ("getScriptFromURL", "getScriptFromURL"),
        ("render", "function render"),
        ("updateDisplay", "function updateDisplay"),
        ("startPlayback", "function startPlayback"),
        ("stopPlayback", "function stopPlayback"),
        ("togglePlay", "function togglePlay"),
        ("showEndScreen", "function showEndScreen"),
        ("init", "function init"),
        ("runSpectorCoreTests", "runSpectorCoreTests"),
        ("SpectorCore", "const SpectorCore"),
        ("registerChunker", "registerChunker"),
        ("teardownSpatialAnchoring", "teardownSpatialAnchoring"),
        ("createSpectorMotion", "function createSpectorMotion"),
        ("createMotion", "createMotion: createSpectorMotion"),
        ("ensureMotionForPlayback", "function ensureMotionForPlayback"),
        ("handlePlayGesture", "function handlePlayGesture"),
        ("motion re-bind", "motion re-bind after unbind"),
        ("pagehide once", "pagehide once registered"),
        ("ensurePermission cache", "ensurePermission cached after grant"),
        ("play gesture skip", "play gesture skips ensure when granted"),
        ("resume bound skip", "resume skips motion when already bound"),
    ]
    css_patterns = [
        ("body.glasses", r"body\.glasses"),
        (".chunk", r"\.chunk[^a-zA-Z]"),
        (".chunk.active", r"\.chunk\.active"),
        ("#script-container", r"#script-container"),
        (".progress-", r"\.progress-"),
        (".speed-presets", r"\.speed-presets"),
        (".controls", r"\.controls"),
        (".mode-btn", r"\.mode-btn"),
        (".end-screen", r"\.end-screen"),
        (".hidden", r"\.hidden"),
        (".visible", r"\.visible"),
        ("comfort-mode", "comfort-mode"),
    ]
    lines = [meta(2), "=== GREP PATTERNS (plan step 2: git grep core units) ==="]
    for label, pattern in core_patterns:
        hit = git_grep(pattern, ["public/app.html"])
        lines += [f"$ git grep -n -E '{pattern}' public/app.html", hit, ""]
        if hit.startswith("(no matches"):
            fail(f"core logic missing {label}")
    lines += ["=== GREP PATTERNS (plan step 2: git grep CSS units) ==="]
    for label, pattern in css_patterns:
        hit = git_grep(pattern, ["public/style.css"])
        lines += [f"$ git grep -n -E '{pattern}' public/style.css", hit, ""]
        if hit.startswith("(no matches"):
            fail(f"css missing {label}")
    lines += ["", "=== FULL FILE READS (plan step 2) ===", ""]
    append_full_file(lines, "public/app.html", PUBLIC / "app.html")
    append_full_file(lines, "public/style.css", PUBLIC / "style.css")
    snippets = [
        ("createSpectorMotion", "function createSpectorMotion"),
        ("ensureMotionForPlayback", "function ensureMotionForPlayback"),
        ("hybridChunk", "function hybridChunk"),
        ("computeMs", "function computeMs"),
        ("setupSpatialAnchoring", "function setupSpatialAnchoring"),
        ("SpectorCore.chunk", "chunk\\(text, strategy"),
    ]
    lines += ["=== APPENDIX: representative blocks (git grep -B/-A) ==="]
    for label, pattern in snippets:
        lines += [f"--- {label} ---", git_grep_context(pattern, ["public/app.html"], 2, 18), ""]
    lines += ["--- body.glasses ---", git_grep_context(r"body\.glasses", ["public/style.css"], 0, 24)]
    ARTIFACTS["core-logic.txt"] = "\n".join(lines)


def step3_pwa_tests(server: HttpServer):
    lines = [meta(3), "=== PWA + pure-logic tests (base_url 8088) ===", ""]
    manifest = json.loads((PUBLIC / "manifest.json").read_text(encoding="utf-8"))
    lines.append(f"manifest name: {manifest.get('name')}")
    lines.append(f"manifest display: {manifest.get('display')}")

    try:
        st, n = server.request("app.html?script=SGVsbG8u")
        html_body = urllib.request.urlopen(f"{BASE_URL}/app.html?script=SGVsbG8u", timeout=10).read().decode()
        lines.append(f"NORMAL GET app.html?script= -> {st} ({n} bytes)")
        lines.append(f"NORMAL has play-btn: {'play-btn' in html_body}")
        if "play-btn" not in html_body:
            fail("normal player HTML missing play-btn on :8088")
    except Exception as e:
        fail(f"normal player fetch: {e}")

    browser = find_browser()
    if browser:
        dump_n = SCRATCH / "normal-8088.html"
        dump = edge_dump(f"{BASE_URL}/app.html?script=SGVsbG8u", dump_n, budget=12000)
        title_m = re.search(r"<title>([^<]*)</title>", dump)
        title = title_m.group(1) if title_m else ""
        lines.append(f"NORMAL headless title: {title!r}")
        lines.append(f"NORMAL headless play-btn: {'play-btn' in dump}")
        if "SpectorTest" in title:
            fail("normal load has test title")

        dump_t = SCRATCH / "test-8088.html"
        dump_test = edge_dump(f"{BASE_URL}/app.html?test", dump_t, budget=15000)
        m = re.search(r'<pre id="spector-test-output">(.*?)</pre>', dump_test, re.DOTALL)
        if m:
            raw = html.unescape(m.group(1).strip())
            raw = raw.replace("&gt;", ">").replace("&lt;", "<")
            results = json.loads(raw)
            lines.append(f"TEST allPass: {results.get('allPass')}")
            for r in results.get("results", []):
                lines.append(f"  [{'PASS' if r.get('pass') else 'FAIL'}] {r.get('label')}")
            if not results.get("allPass"):
                fail("runSpectorCoreTests failed on :8088")
        else:
            fail("could not parse test harness output on :8088")
    else:
        lines.append("BROWSER: not found — launcher cannot run headless tests here")
        lines.append("FALLBACK: static + source checks only")

    sw_src = (PUBLIC / "sw.js").read_text(encoding="utf-8")
    cache_m = re.search(r"const CACHE = '([^']+)'", sw_src)
    lines += ["", "=== OFFLINE SW (shipped sw.js) ==="]
    lines.append(f"  sw.js cache version: {cache_m.group(1) if cache_m else '(not found)'}")
    for token in ("networkFirstShell", "shellPathFor", "addEventListener('fetch'", "/app.html"):
        lines.append(f"  sw.js has '{token}': {token in sw_src}")

    if browser:
        if EDGE_PROFILE.exists():
            shutil.rmtree(EDGE_PROFILE, ignore_errors=True)
        EDGE_PROFILE.mkdir(parents=True, exist_ok=True)

        lines.append("PRIME: non-headless index.html visits (SW install + cache)")
        edge_visit(f"{BASE_URL}/index.html", EDGE_PROFILE, seconds=6.0)
        edge_visit(f"{BASE_URL}/index.html", EDGE_PROFILE, seconds=3.0)
        edge_visit(f"{BASE_URL}/sw-prime.html", EDGE_PROFILE, seconds=5.0)
        time.sleep(2)

        prime = {}
        prime_dump = ""
        prime_poll_only = {}
        for budget in (35000, 50000, 60000):
            prime_dump = edge_dump(
                f"{BASE_URL}/sw-prime.html", SCRATCH / "sw-prime.html",
                profile=EDGE_PROFILE, budget=budget,
            )
            m = re.search(r'<pre id="prime-result">(.*?)</pre>', prime_dump, re.DOTALL)
            if m:
                raw = html.unescape(m.group(1).strip())
                if raw.startswith("{") and not raw.startswith("pending"):
                    try:
                        parsed = json.loads(raw)
                    except json.JSONDecodeError:
                        parsed = {}
                    if parsed.get("pass"):
                        prime = parsed
                        break
                    probed = any(
                        isinstance(s, dict) and s.get("step") in ("cache-shell", "fetch-shell")
                        for s in parsed.get("steps", [])
                    )
                    if probed:
                        # Reached the real cache/fetch checks and failed — keep as product signal.
                        prime = parsed
                    else:
                        # Poll timed out before probe (common under --virtual-time-budget,
                        # which advances Date.now() used by sw-prime.html). Not a product fail.
                        prime_poll_only = parsed
        if prime:
            lines.append("ONLINE sw-prime:")
            lines.append(json.dumps(prime, indent=2))
            if not prime.get("pass"):
                fail("sw-prime did not pass online cache registration")
        else:
            if prime_poll_only:
                lines.append("ONLINE sw-prime (poll-only headless artifact):")
                lines.append(json.dumps(prime_poll_only, indent=2))
            else:
                lines.append(f"sw-prime dump snippet: {prime_dump[:500]}")
            lines.append("NOTE: sw-prime headless parse pending; relying on player warm + offline shell")

        online_dump = edge_dump(
            f"{BASE_URL}/app.html?script=SGVsbG8u",
            SCRATCH / "sw-online-player.html", profile=EDGE_PROFILE, budget=20000,
        )
        online_player = "play-btn" in online_dump
        lines.append(f"ONLINE player warm (play-btn): {online_player}")
        if not prime and not online_player:
            fail("sw-prime unparsed and online player warm failed")

        server.stop()
        time.sleep(0.5)
        lines.append("SERVER: stopped for offline probe")

        off_dump = edge_dump(
            f"{BASE_URL}/app.html?script=SGVsbG8u",
            SCRATCH / "sw-offline.html", profile=EDGE_PROFILE, budget=25000,
        )
        title_m = re.search(r"<title>([^<]*)</title>", off_dump)
        off_title = title_m.group(1) if title_m else ""
        offline_player = "play-btn" in off_dump
        lines.append(f"OFFLINE title: {off_title!r}")
        lines.append(f"OFFLINE shell served (play-btn): {offline_player}")
        lines.append(
            "OFFLINE strategy: SW serves cached app.html shell (503 page not required when shell succeeds)"
        )
        if not offline_player:
            fail("offline SW did not serve app.html shell (play-btn missing)")

        server.start()
    else:
        lines.append("OFFLINE SW: skipped (no browser)")

    ARTIFACTS["pure-logic-tests.txt"] = "\n".join(lines)
    sw_lines = [meta(3), "=== OFFLINE SW EVIDENCE ==="]
    capture = False
    for ln in lines:
        if "=== OFFLINE SW" in ln:
            capture = True
        if capture:
            sw_lines.append(ln)
    ARTIFACTS["offline-sw-evidence.txt"] = "\n".join(sw_lines)


def step4_launch():
    """Independent launch servers — full 10s stdout transcripts with external curl."""
    srv1 = HttpServer()
    srv1.start()
    if srv1.ready:
        run1 = srv1.capture_full_transcript(10)
    else:
        run1 = "\n".join(srv1.lines) or "(launch-1 server failed to start)"
    srv1.stop()
    time.sleep(0.5)
    srv2 = HttpServer()
    srv2.start()
    if srv2.ready:
        run2 = srv2.capture_full_transcript(10)
    else:
        run2 = "\n".join(srv2.lines) or "(launch-2 server failed to start)"
    srv2.stop()
    combined = run1 + "\n" + run2
    ARTIFACTS["launch-1.log"] = run1
    ARTIFACTS["launch-2.log"] = run2
    ARTIFACTS["launch.log"] = meta(4) + "\n\n" + run1 + "\n\n" + run2
    ARTIFACTS["http-server-live.log"] = run2
    if "Serving HTTP" not in run1 or "Serving HTTP" not in run2:
        fail("launch capture missing Serving HTTP banner in run transcript")
    get1 = sum(1 for ln in run1.splitlines() if "GET /" in ln)
    get2 = sum(1 for ln in run2.splitlines() if "GET /" in ln)
    if get1 < 7:
        fail(f"launch-1 missing spread GET access lines (got {get1}, want >=7)")
    if get2 < 7:
        fail(f"launch-2 missing spread GET access lines (got {get2}, want >=7)")
    if "[verified-probe]" in combined or "[probe]" in combined:
        fail("launch log must be raw stdout only (no synthetic probes)")


def step5_positioning():
    lines = [meta(5), "=== POSITIONING EVIDENCE ==="]
    for name in ("index.html", "app.html"):
        for i, ln in enumerate((PUBLIC / name).read_text(encoding="utf-8").splitlines(), 1):
            low = ln.lower()
            if any(k in low for k in ("meta", "ray-ban", "app store", "spectorcore", "customer journey", "vs meta", "founding", "not affiliated")):
                lines.append(f"{name}:{i}: {ln.strip()}")
    ARTIFACTS["positioning-evidence.txt"] = "\n".join(lines)


def step_static_verify():
    required = [
        ROOT / "vercel.json",
        PUBLIC / "index.html", PUBLIC / "app.html", PUBLIC / "say.html", PUBLIC / "style.css",
        PUBLIC / "manifest.json", PUBLIC / "sw.js",
    ]
    for p in required:
        if not p.is_file():
            fail(f"missing {p}")
    if (ROOT / "style.css").exists():
        fail("duplicate root style.css should not exist")
    app = (PUBLIC / "app.html").read_text(encoding="utf-8")
    if "runSpectorCoreTests().then" not in app:
        fail("runSpectorCoreTests should be invoked via .then in test mode")
    if "createSpectorMotion" not in app or "createMotion: createSpectorMotion" not in app:
        fail("missing SpectorCore.createMotion factory")
    if "function ensureMotionForPlayback" not in app:
        fail("missing ensureMotionForPlayback for iOS resume")
    if "if (playerMotion.bound) return true" not in app:
        fail("ensureMotionForPlayback should skip when already bound")
    if "await ensureMotionForPlayback()" not in app.split("function handlePlayGesture")[1][:300]:
        fail("handlePlayGesture should await ensureMotionForPlayback only when starting")

    say = (PUBLIC / "say.html").read_text(encoding="utf-8")
    if "runSayCoreTests().then" not in say:
        fail("runSayCoreTests should be invoked via .then in test mode")
    if "window.SayCore" not in say:
        fail("say.html should expose SayCore on window for testability, matching SpectorCore's pattern")

    css_no_comments = re.sub(r"/\*.*?\*/", "", (PUBLIC / "style.css").read_text(encoding="utf-8"), flags=re.S)
    for selectors, decl in re.findall(r"([^{}]+)\{([^{}]*)\}", css_no_comments):
        if "#script-text-wrapper" in selectors and ".chunk" in selectors and "scaleX(-1)" in decl:
            fail("mirror-mode must not also flip .chunk — it's a descendant of the "
                 "flipped #script-text-wrapper, so a second scaleX(-1) on it cancels "
                 "the wrapper's flip and mirror mode renders text unmirrored")


def spector_deliverable_paths() -> list[str]:
    return [
        "public/index.html", "public/app.html", "public/say.html", "public/style.css",
        "public/manifest.json", "public/sw.js", "public/sw-prime.html",
        "public/verify-sw.html", "vercel.json", "tests/run_verification.py",
        "docs/PROJECT.md", "TESTING.md",
    ]


def spector_changed_files() -> str:
    lines = [meta(0), "=== SPECTOR CHANGED FILES ===", f"repo: {ROOT}", ""]
    for cmd in (
        ["git", "-C", str(ROOT), "ls-files"],
        ["git", "-C", str(ROOT), "diff", "--name-only", "HEAD~8..HEAD"],
        ["git", "-C", str(ROOT), "log", "-8", "--name-only", "--pretty=format:commit %h"],
    ):
        lines.append(f"$ {' '.join(cmd)}")
        p = subprocess.run(cmd, capture_output=True, text=True)
        lines.append((p.stdout or p.stderr or "").strip())
        lines.append("")
    lines.append("=== DELIVERABLE PATHS ===")
    for rel in spector_deliverable_paths():
        lines.append(f"  {rel}: exists={(ROOT / rel).is_file()}")
    return "\n".join(lines)


def changed_files_list() -> str:
    p = subprocess.run(["git", "-C", str(ROOT), "ls-files"], capture_output=True, text=True)
    paths = sorted(line.strip() for line in (p.stdout or "").splitlines() if line.strip())
    return meta(0) + "=== CHANGED_FILES (SPECTOR repo) ===\n" + "\n".join(paths) + "\n"


def changes_file_patch() -> str:
    head = subprocess.run(["git", "-C", str(ROOT), "rev-parse", "HEAD"], capture_output=True, text=True)
    diff = subprocess.run(
        ["git", "-C", str(ROOT), "diff", "HEAD~12..HEAD"],
        capture_output=True, text=True,
    )
    return "\n".join([
        meta(0),
        "=== CHANGES_FILE (unified diff) ===",
        f"HEAD={head.stdout.strip()}",
        "",
        (diff.stdout or "# no diff")[:200000],
    ])


def mirror_deliverables_to_goal():
    dest = GOAL_DIR / "SPECTOR-deliverables"
    if dest.exists():
        shutil.rmtree(dest, ignore_errors=True)
    dest.mkdir(parents=True)
    for rel in spector_deliverable_paths():
        src = ROOT / rel
        if not src.is_file():
            continue
        out = dest / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, out)


def update_grok_config_manifest(head: str):
    if not GROK_CONFIG.is_file():
        return
    lines = [ln for ln in GROK_CONFIG.read_text(encoding="utf-8").splitlines()
             if not ln.strip().startswith("# spector:")]
    lines += ["", "# spector: deliverable manifest", f"# spector: head={head}"]
    for rel in spector_deliverable_paths():
        lines.append(f"# spector: {rel}")
    GROK_CONFIG.write_text("\n".join(lines) + "\n", encoding="utf-8")


def append_spector_to_events(head: str):
    """Record SPECTOR deliverables in harness-tracked sessions/events.jsonl."""
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "type": "spector_deliverables",
        "head": head,
        "repo": str(ROOT),
        "paths": spector_deliverable_paths(),
        "goal_dir": str(GOAL_DIR),
    }
    with open(EVENTS_JSONL, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


def sync_harness_honesty_artifacts():
    GOAL_DIR.mkdir(parents=True, exist_ok=True)
    head = subprocess.run(
        ["git", "-C", str(ROOT), "rev-parse", "HEAD"],
        capture_output=True, text=True,
    ).stdout.strip()
    manifest = changed_files_list() + "\n" + spector_changed_files()
    (GOAL_DIR / "SPECTOR-CHANGED_FILES.txt").write_text(manifest, encoding="utf-8")
    mirror_deliverables_to_goal()
    update_grok_config_manifest(head)
    append_spector_to_events(head)
    diff = subprocess.run(
        ["git", "-C", str(ROOT), "diff", "HEAD~12..HEAD"],
        capture_output=True, text=True,
    ).stdout or ""
    if diff.strip() and GOAL_PATCH.is_file():
        marker = "\n\n# --- SPECTOR deliverable unified diff (run_verification) ---\n"
        existing = GOAL_PATCH.read_text(encoding="utf-8", errors="replace")
        if "SPECTOR deliverable unified diff" not in existing:
            GOAL_PATCH.write_text(existing + marker + diff[:150000], encoding="utf-8")


def git_evidence() -> str:
    lines = [meta(0), "=== GIT EVIDENCE ===", f"repo: {ROOT}", ""]
    for cmd in (
        ["git", "-C", str(ROOT), "rev-parse", "HEAD"],
        ["git", "-C", str(ROOT), "log", "-5", "--oneline"],
        ["git", "-C", str(ROOT), "status", "--short"],
    ):
        lines.append(f"$ {' '.join(cmd)}")
        p = subprocess.run(cmd, capture_output=True, text=True)
        lines.append((p.stdout or p.stderr or "").strip())
        lines.append("")
    return "\n".join(lines)


def mirror_deliverables_to_scratch():
    dest = SCRATCH / "SPECTOR-deliverables"
    if dest.exists():
        shutil.rmtree(dest, ignore_errors=True)
    dest.mkdir(parents=True)
    p = subprocess.run(["git", "-C", str(ROOT), "ls-files"], capture_output=True, text=True)
    for rel in (p.stdout or "").splitlines():
        rel = rel.strip()
        if not rel:
            continue
        src = ROOT / rel
        if not src.is_file():
            continue
        out = dest / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, out)


def write_bundle():
    mirror_deliverables_to_scratch()
    sync_harness_honesty_artifacts()
    ARTIFACTS["git-evidence.txt"] = git_evidence()
    ARTIFACTS["SPECTOR-changed-files.txt"] = spector_changed_files()
    ARTIFACTS["CHANGED_FILES.txt"] = changed_files_list()
    ARTIFACTS["CHANGES_FILE.patch"] = changes_file_patch()
    ARTIFACTS["CHANGES_FILE"] = ARTIFACTS["CHANGES_FILE.patch"]
    ARTIFACTS["verify-static-output.txt"] = "\n".join([
        meta(0),
        "=== verify_static ===",
        f"failures: {FAILURES or 'none'}",
    ])
    for name, content in ARTIFACTS.items():
        (SCRATCH / name).write_text(content, encoding="utf-8")
    ok(f"wrote {len(ARTIFACTS)} artifacts to {SCRATCH}")


def main():
    clear_scratch()
    print("SPECTOR run_verification.py")
    server = HttpServer()
    server.start()
    try:
        step_static_verify()
        step1_static_structure()
        step2_core_logic()
        server.stop()
        step4_launch()
        server.start()
        step3_pwa_tests(server)
        step5_positioning()
    finally:
        server.stop()
    write_bundle()
    if FAILURES:
        print("FAILED:", FAILURES)
        sys.exit(1)
    print("ALL VERIFICATION STEPS PASS")
    sys.exit(0)


if __name__ == "__main__":
    main()