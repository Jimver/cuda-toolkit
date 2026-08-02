---
name: update-cuda-links
description:
  'Updates CUDA download URL maps for new patch releases in
  src/links/windows-links.ts and src/links/linux-links.ts.'
user-invocable: true
---

# Update CUDA Link Mappings

Use this skill when new CUDA patch releases need to be added to the toolkit URL
mapping tables and verified.

## Use when

- adding new CUDA versions to the Windows and Linux download maps
- updating `src/links/windows-links.ts` and `src/links/linux-links.ts`
- validating NVIDIA URL patterns before committing
- keeping version keys sorted and tests passing
- checking all non-preview CUDA releases from the last year that are missing
  from the link files

## What to do

1. Download the NVIDIA archive metadata from the public archive markdown:
   - `curl -sS https://developer.nvidia.com/cuda-toolkit-archive.md > /tmp/cuda-toolkit-archive.md`
2. Run the helper discovery script below to find versions released in the last
   365 days, skip preview/RC releases, and compare them against the current link
   files.
3. For each missing non-preview patch release:
   - add local Windows entries to `cudaVersionToURL` in
     `src/links/windows-links.ts`
   - add network Windows entries to `cudaVersionToNetworkUrl` in
     `src/links/windows-links.ts`
   - add local Linux entries to `src/links/linux-links.ts`
   - add SBSA Linux entries when NVIDIA provides `cuda_<version>_linux_sbsa.run`
4. Preserve the existing map ordering and formatting in both files.
5. Validate candidate URLs with the URL check script below.
6. Run the link tests and confirm the new versions are covered:
   - `npm test -- __tests__/links/windows-links.test.ts`
   - `npm test -- __tests__/links/linux-links.test.ts`
7. Commit the change with a message listing the added versions.

## Discovery and validation scripts

### 1. Extract last-year CUDA patch releases and missing versions

```bash
curl -sS https://developer.nvidia.com/cuda-toolkit-archive.md > /tmp/cuda-toolkit-archive.md
python3 <<'PY'
import re
from datetime import datetime, timedelta
from pathlib import Path

archive = Path('/tmp/cuda-toolkit-archive.md').read_text(encoding='utf-8')

# Match release lines containing a version plus optional date or release note text.
release_regex = re.compile(
    r'CUDA Toolkit\s+(?P<version>\d+\.\d+\.\d+)(?:[^\n\r]*?\((?P<date>[^\)]+)\))?',
    re.IGNORECASE,
)

# Parse common date formats from the archive markdown.
date_formats = [
    '%B %d, %Y',
    '%b %d, %Y',
    '%Y-%m-%d',
    '%d %B %Y',
    '%d %b %Y',
]


def parse_date(value: str):
    for fmt in date_formats:
        try:
            return datetime.strptime(value.strip(), fmt)
        except ValueError:
            continue
    return None

matches = []
for match in release_regex.finditer(archive):
    version = match.group('version')
    date_text = match.group('date')
    release_date = parse_date(date_text) if date_text else None
    matches.append((version, release_date, date_text or ''))

# Normalize and deduplicate.
seen = {}
for version, release_date, date_text in matches:
    if any(tag in version.lower() for tag in ['preview', 'rc', 'beta']):
        continue
    if release_date is None:
        # Keep versions with unknown dates as candidates, but note them.
        seen.setdefault(version, {}).update(date_text=date_text or 'unknown')
    else:
        seen.setdefault(version, {}).update(release_date=release_date, date_text=date_text)

one_year_ago = datetime.utcnow() - timedelta(days=365)

current_versions = set()
for path in [
    Path('src/links/windows-links.ts'),
    Path('src/links/linux-links.ts'),
]:
    content = path.read_text(encoding='utf-8')
    current_versions |= set(re.findall(r"['\"](\d+\.\d+\.\d+)['\"]", content))

print('Found current versions:', sorted(current_versions))
print('\nReleases in the last year:')
missing = []
for version, info in sorted(seen.items(), key=lambda item: tuple(map(int, item[0].split('.'))), reverse=True):
    release_date = info.get('release_date')
    if release_date and release_date < one_year_ago:
        continue
    if version in current_versions:
        continue
    missing.append((version, info.get('release_date'), info.get('date_text')))

if not missing:
    print('No missing non-preview patch releases found for the last year.')
else:
    print('Missing releases:')
    for version, release_date, date_text in missing:
        print(f'- {version}: {release_date.date() if release_date else date_text}')
PY
```

### 2. Validate candidate NVIDIA URLs

```bash
python3 <<'PY'
import urllib.request
import urllib.error

candidates = [
    # Replace with versions discovered by the previous script.
    '13.3.0',
    '13.2.2',
    '13.2.1',
]

for version in candidates:
    linux_local = f'https://developer.download.nvidia.com/compute/cuda/{version}/local_installers/cuda_{version}_linux.run'
    linux_sbsa = f'https://developer.download.nvidia.com/compute/cuda/{version}/local_installers/cuda_{version}_linux_sbsa.run'
    win_local = f'https://developer.download.nvidia.com/compute/cuda/{version}/local_installers/cuda_{version}_windows.exe'
    win_net = f'https://developer.download.nvidia.com/compute/cuda/{version}/network_installers/cuda_{version}_windows_network.exe'

    for name, url in [
        ('linux_local', linux_local),
        ('linux_sbsa', linux_sbsa),
        ('win_local', win_local),
        ('win_net', win_net),
    ]:
        try:
            req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'curl/7.88.1'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                print('OK', version, name, resp.status, url)
        except urllib.error.HTTPError as e:
            print('HTTP', version, name, e.code, url)
        except Exception as e:
            print('ERR', version, name, type(e).__name__, e, url)
PY
```

## Notes

- The archive source is the public markdown at
  `https://developer.nvidia.com/cuda-toolkit-archive.md`.
- Skip any preview, RC, or beta entries; only add stable patch releases.
- If a release has no explicit date in the markdown, treat it as a candidate but
  verify by checking the NVIDIA download page or release notes.

## Tests

- `npm test -- __tests__/links/windows-links.test.ts`
- `npm test -- __tests__/links/linux-links.test.ts`
