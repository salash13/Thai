#!/usr/bin/env bash
# Lance l'application sur le premier port libre (8123, 8124, …) et l'ouvre dans le navigateur.
cd "$(dirname "$0")/.." || exit 1
PORT=$(python3 - <<'PY'
import socket
for p in range(8123, 8199):
    s = socket.socket()
    try:
        s.bind(("127.0.0.1", p)); print(p); break
    except OSError:
        continue
    finally:
        s.close()
PY
)
echo "→ http://localhost:$PORT"
(sleep 1 && open "http://localhost:$PORT") 2>/dev/null &
python3 -m http.server "$PORT"
