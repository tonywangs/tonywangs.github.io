"""Refresh the chart; keep the last valid snapshot if the provider is unavailable."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
targets = [root / path for path in (
    'images/github-contributions.svg',
    'dist/client/images/github-contributions.svg',
)]

def validate(data):
    svg = ET.fromstring(data)
    ns = '{http://www.w3.org/2000/svg}'
    if (svg.tag != ns + 'svg'
            or len(svg.findall('.//' + ns + 'rect')) <= 300
            or svg.findall('.//' + ns + 'script')):
        raise ValueError('Invalid contribution chart')

try:
    request = Request('https://ghchart.rshah.org/555e79/tonywangs',
                      headers={'User-Agent': 'TonyWang-ChartRefresh/1.0'})
    with urlopen(request, timeout=30) as response:
        data = response.read(1_000_001)
    if len(data) > 1_000_000:
        raise ValueError('Chart response is too large')
    validate(data)
except (URLError, TimeoutError, ET.ParseError, ValueError) as error:
    # An external outage is recoverable only when both saved charts are valid.
    for target in targets:
        validate(target.read_bytes())
    print(f'Chart provider unavailable ({error}); keeping the saved chart.')
else:
    for target in targets:
        target.write_bytes(data)
    print('Contribution chart refreshed.')
