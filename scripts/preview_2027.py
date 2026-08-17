#!/usr/bin/env python3
"""Render and serve the KCSE 2027 Jekyll pages without external packages."""

from __future__ import annotations

import argparse
from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import webbrowser


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
PAGE_DIRECTORY = REPOSITORY_ROOT / "2027"
LAYOUT_PATH = REPOSITORY_ROOT / "_layouts" / "kcse-2027.html"
INCLUDE_DIRECTORY = REPOSITORY_ROOT / "_includes"

FRONT_MATTER_PATTERN = re.compile(
    r"\A---[ \t]*\r?\n(.*?)^---[ \t]*\r?\n",
    re.DOTALL | re.MULTILINE,
)
INCLUDE_PATTERN = re.compile(r"{%\s*include\s+([^\s%]+)\s*%}")
CONDITIONAL_PATTERN = re.compile(
    r"{%\s*if\s+page\.(\w+)\s*==\s*'([^']+)'\s*%}(.*?){%\s*endif\s*%}",
    re.DOTALL,
)
RELATIVE_URL_PATTERN = re.compile(
    r"{{\s*'([^']+)'\s*\|\s*relative_url\s*}}"
)


def parse_document(path: Path) -> tuple[dict[str, str], str]:
    source = path.read_text(encoding="utf-8")
    match = FRONT_MATTER_PATTERN.match(source)
    if not match:
        raise ValueError(f"YAML front matter가 없습니다: {path}")

    metadata: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if not line.strip():
            continue
        key, separator, value = line.partition(":")
        if not separator:
            raise ValueError(f"잘못된 front matter 항목: {line}")
        metadata[key.strip()] = value.strip()

    return metadata, source[match.end() :]


def expand_includes(source: str) -> str:
    def replace_include(match: re.Match[str]) -> str:
        include_path = (INCLUDE_DIRECTORY / match.group(1)).resolve()
        if INCLUDE_DIRECTORY.resolve() not in include_path.parents:
            raise ValueError(f"허용되지 않은 include 경로: {match.group(1)}")
        return include_path.read_text(encoding="utf-8")

    previous = None
    while previous != source:
        previous = source
        source = INCLUDE_PATTERN.sub(replace_include, source)
    return source


def render_page(page_path: Path) -> str:
    metadata, content = parse_document(page_path)
    _, layout = parse_document(LAYOUT_PATH)
    rendered = expand_includes(layout).replace("{{ content }}", content)
    rendered = rendered.replace("{{ page.title }}", metadata.get("title", "KCSE 2027"))

    def replace_conditional(match: re.Match[str]) -> str:
        key, expected, body = match.groups()
        return body if metadata.get(key) == expected else ""

    rendered = CONDITIONAL_PATTERN.sub(replace_conditional, rendered)
    rendered = RELATIVE_URL_PATTERN.sub(lambda match: match.group(1), rendered)

    if "{{" in rendered or "{%" in rendered:
        raise ValueError(f"처리되지 않은 Liquid 문법이 있습니다: {page_path}")
    return rendered


class MarkupCheck(HTMLParser):
    """Use the standard parser to catch malformed tokenization."""


def check_pages() -> int:
    pages = [
        path
        for path in sorted(PAGE_DIRECTORY.rglob("*.html"))
        if path.read_text(encoding="utf-8").startswith("---\n")
    ]

    for page in pages:
        rendered = render_page(page)
        parser = MarkupCheck(convert_charrefs=True)
        parser.feed(rendered)
        parser.close()

    print(f"미리보기 렌더링 확인 완료: {len(pages)}개 페이지")
    return 0


class PreviewRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 - inherited HTTP method name
        request_path = self.path.split("?", 1)[0].split("#", 1)[0]
        if request_path in {"/2027", "/2027/"}:
            request_path = "/2027/index.html"

        candidate = (REPOSITORY_ROOT / request_path.lstrip("/")).resolve()
        is_2027_page = (
            candidate.suffix == ".html"
            and PAGE_DIRECTORY.resolve() in candidate.parents
            and candidate.is_file()
        )

        if is_2027_page:
            try:
                response = render_page(candidate).encode("utf-8")
            except (OSError, ValueError) as error:
                self.send_error(500, str(error))
                return

            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(response)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(response)
            return

        super().do_GET()


def serve(bind: str, port: int, open_browser: bool) -> int:
    handler = partial(PreviewRequestHandler, directory=str(REPOSITORY_ROOT))
    server = ThreadingHTTPServer((bind, port), handler)
    preview_url = f"http://{bind}:{port}/2027/"

    print("KCSE 2027 미리보기 서버가 실행 중입니다.")
    print(f"Preview URL: {preview_url}")
    print("종료하려면 Ctrl+C를 누르세요.")

    if open_browser:
        webbrowser.open(preview_url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n미리보기 서버를 종료합니다.")
    finally:
        server.server_close()
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="127.0.0.1", help="바인딩 주소")
    parser.add_argument("--port", default=8765, type=int, help="서버 포트")
    parser.add_argument(
        "--open",
        action="store_true",
        help="서버 시작 후 기본 브라우저를 엽니다.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="페이지를 렌더링해 확인한 뒤 서버를 시작하지 않고 종료합니다.",
    )
    arguments = parser.parse_args()

    if arguments.check:
        return check_pages()
    return serve(arguments.bind, arguments.port, arguments.open)


if __name__ == "__main__":
    raise SystemExit(main())
