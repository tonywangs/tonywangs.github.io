"""Refresh the locally served chart only after validating the complete response."""
from pathlib import Path
from urllib.request import urlopen
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
with urlopen('https://ghchart.rshah.org/555e79/tonywangs', timeout=30) as response:
    data = response.read(1_000_000)
svg = ET.fromstring(data)
assert svg.tag == '{http://www.w3.org/2000/svg}svg'
assert len(svg.findall('{http://www.w3.org/2000/svg}rect')) > 300
assert not svg.findall('.//{http://www.w3.org/2000/svg}script')
for target in ('images/github-contributions.svg', 'dist/client/images/github-contributions.svg'):
    (root / target).write_bytes(data)
