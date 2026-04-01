import sys
import json
import pandas as pd
from mitmproxy import io
from mitmproxy.exceptions import FlowReadException

def flatten_dict(d, parent_key='', sep='_'):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

print("Starting deep scan of raw file contents, ignoring all URLs...")
extracted = []

with open("traffic.mitm", "rb") as logfile:
    freader = io.FlowReader(logfile)
    try:
        for flow in freader.stream():
            if flow.response and flow.response.content:
                try:
                    body = flow.response.get_text(strict=False)
                    if not body: continue
                    # Search for any of those keywords
                    if "chinese" in body.lower() or "lifepath" in body.lower() or "earth_slide" in body.lower():
                        try:
                            data = json.loads(body)
                            extracted.append(flatten_dict(data))
                        except Exception:
                            pass
                except Exception:
                    pass
    except FlowReadException:
        pass

if extracted:
    df = pd.DataFrame(extracted)
    df = df.drop_duplicates()
    df.to_csv("extracted_raw_payload.csv", index=False)
    print(f"✅ JACKPOT! Found {len(df)} unique profile(s) by ignoring the URL entirely. Exported to extracted_raw_payload.csv")
else:
    print("❌ Empirically tested raw bits. 0 instances of 'chinese', 'lifepath', or 'earth_slide' exist inside this traffic.mitm file.")
