import os
import json
import hashlib

JSON_FILE = "games_data.json"
TORRENTS_DIR = "files"

# =========================
# BENCODE DECODER / ENCODER
# =========================

def bdecode(data, i=0):
    if data[i:i+1] == b'i':
        i += 1
        j = data.index(b'e', i)
        return int(data[i:j]), j + 1

    if data[i:i+1].isdigit():
        j = data.index(b':', i)
        length = int(data[i:j])
        j += 1
        return data[j:j+length], j + length

    if data[i:i+1] == b'l':
        i += 1
        lst = []
        while data[i:i+1] != b'e':
            val, i = bdecode(data, i)
            lst.append(val)
        return lst, i + 1

    if data[i:i+1] == b'd':
        i += 1
        dct = {}
        while data[i:i+1] != b'e':
            key, i = bdecode(data, i)
            val, i = bdecode(data, i)
            dct[key] = val
        return dct, i + 1

    raise ValueError("Błąd bencode")


def bencode(value):
    if isinstance(value, int):
        return b'i' + str(value).encode() + b'e'

    if isinstance(value, bytes):
        return str(len(value)).encode() + b':' + value

    if isinstance(value, str):
        b = value.encode()
        return str(len(b)).encode() + b':' + b

    if isinstance(value, list):
        return b'l' + b''.join(bencode(v) for v in value) + b'e'

    if isinstance(value, dict):
        out = b'd'
        for k in sorted(value):
            out += bencode(k)
            out += bencode(value[k])
        return out + b'e'

    raise TypeError("Nieobsługiwany typ")


# =========================
# TORRENT → MAGNET
# =========================

def torrent_to_magnet(path):
    with open(path, "rb") as f:
        data = f.read()

    decoded, _ = bdecode(data)
    info = decoded[b'info']
    info_encoded = bencode(info)

    infohash = hashlib.sha1(info_encoded).hexdigest()
    name = info.get(b'name', b'').decode(errors="ignore")

    return f"magnet:?xt=urn:btih:{infohash}&dn={name}"


# =========================
# HELPERS
# =========================

def normalize(name):
    return (
        name.lower()
        .replace(" ", "")
        .replace("-", "")
        .replace(":", "")
        .replace(".", "")
    )


# =========================
# MAIN
# =========================

with open(JSON_FILE, "r", encoding="utf-8") as f:
    games = json.load(f)

torrent_map = {}
for file in os.listdir(TORRENTS_DIR):
    if file.endswith(".torrent"):
        key = normalize(file.replace(".torrent", ""))
        torrent_map[key] = file

missing = 0
broken = 0

for game in games:
    name = game.get("name", "")
    key = normalize(name)

    if key not in torrent_map:
        print(f"❌ Brak torrenta: {name}")
        missing += 1
        continue

    torrent_file = torrent_map[key]
    torrent_path = os.path.join(TORRENTS_DIR, torrent_file)

    try:
        magnet = torrent_to_magnet(torrent_path)
    except Exception:
        print(f"⚠️ Uszkodzony torrent: {name}")
        broken += 1
        continue

    game["magnet"] = magnet
    game["torrentFile"] = torrent_file

    print(f"✔ {name}")

with open("games_with_magnets.json", "w", encoding="utf-8") as f:
    json.dump(games, f, indent=2, ensure_ascii=False)

print("\n==============================")
print(f"✅ Gotowe")
print(f"❌ Brak torrenta: {missing}")
print(f"⚠️ Uszkodzone: {broken}")
print("==============================")
