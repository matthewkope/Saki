import os
import json
from mitmproxy import io
from mitmproxy.exceptions import FlowReadException

def run():
    print("Dumping all raw payloads containing 'lifepath' exactly as they came from the network...")
    found_payloads = []
    
    with open("traffic.mitm", "rb") as logfile:
        freader = io.FlowReader(logfile)
        try:
            for flow in freader.stream():
                if flow.response and flow.response.content:
                    try:
                        body = flow.response.get_text(strict=False)
                        if not body: continue
                        if "lifepath" in body.lower() or "traits" in body.lower():
                            try:
                                jdata = json.loads(body)
                                found_payloads.append(jdata)
                            except Exception:
                                pass
                    except Exception:
                        pass
        except FlowReadException:
            pass
            
    with open("all_raw_json_dumps.json", "w", encoding="utf-8") as f:
        json.dump(found_payloads, f, indent=4)
        
    print(f"Dumped {len(found_payloads)} total raw JSON payloads to all_raw_json_dumps.json")

if __name__ == "__main__":
    run()
