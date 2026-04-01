from mitmproxy import io
from mitmproxy.exceptions import FlowReadException
import json

def analyze_traffic(file_path):
    print(f"Scanning {file_path} for relationship/compatibility data...\n")
    found_count = 0
    
    with open(file_path, "rb") as logfile:
        freader = io.FlowReader(logfile)
        try:
            for flow in freader.stream():
                if getattr(flow, "response", None) and getattr(flow.response, "content", None):
                    try:
                        body = flow.response.content.decode('utf-8', errors='ignore')
                        body_lower = body.lower()
                        
                        keywords = ["score", "compatibility", "relationship", "match"]
                        # We also want to make sure it's the compatibility endpoint
                        if any(kw in body_lower for kw in keywords) and "sentry" not in flow.request.url.lower():
                            # Let's see if there's a JSON structure
                            if "-1" not in body and "{" in body:
                                try:
                                    data = json.loads(body)
                                    # Very basic filter: if it's a huge dump, we just want to see if "score" is a key
                                    dumped = json.dumps(data, indent=2)
                                    if "score" in dumped.lower() or "compatibility" in dumped.lower():
                                        found_count += 1
                                        print("="*60)
                                        print(f"[MATCH FOUND #{found_count}]")
                                        print(f"URL: {flow.request.url}")
                                        print(f"Snippet:\n{dumped[:1000]}")
                                        print("...\n")
                                except json.JSONDecodeError:
                                    pass
                    except Exception as e:
                        pass
        except FlowReadException as e:
            print(f"Flow file read error: {e}")
            
    print("="*60)
    print(f"Finished. Found {found_count} relationship/compatibility payloads.")

if __name__ == "__main__":
    analyze_traffic("traffic.mitm")
