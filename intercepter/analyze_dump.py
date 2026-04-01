from mitmproxy import io
from mitmproxy.exceptions import FlowReadException
import json

def analyze_traffic(file_path):
    print(f"Scanning {file_path} for astrology/lifepath data...\n")
    found_count = 0
    
    with open(file_path, "rb") as logfile:
        freader = io.FlowReader(logfile)
        try:
            for flow in freader.stream():
                if getattr(flow, "response", None) and flow.response.content:
                    try:
                        # Decode as utf-8, ignoring binary garbage 
                        body = flow.response.content.decode('utf-8', errors='ignore')
                        body_lower = body.lower()
                        
                        # Look for our keywords
                        keywords = ["lifepath", "astrology", "western", "eastern", "numerology"]
                        if any(kw in body_lower for kw in keywords) and "sentry" not in flow.request.url:
                            found_count += 1
                            print("="*60)
                            print(f"[MATCH FOUND #{found_count}]")
                            print(f"URL: {flow.request.url}")
                            print(f"Content-Type: {flow.response.headers.get('content-type', 'Missing!')}")
                            
                            # If it's pure json, let's pretty print the first few keys, else just print a snippet
                            if "json" in flow.response.headers.get('content-type', '').lower():
                                try:
                                    data = json.loads(body)
                                    print("Type: VALID JSON STRUCT")
                                    # Print snippet securely
                                    snippet = json.dumps(data, indent=2)
                                    print(f"Snippet:\n{snippet[:400]}...")
                                except Exception:
                                    print(f"Snippet:\n{body[:400]}...\n")
                            else:
                                print("Type: NON-JSON TEXT/HTML")
                                print(f"Snippet:\n{body[:400]}...\n")
                    except Exception as e:
                        pass
        except FlowReadException as e:
            print(f"Flow file read error: {e}")
            
    print("="*60)
    if found_count == 0:
        print("❌ No matching lifepath/astrology data was found in any format.")
        print("This strongly suggests SSL Pinning blocked the data request entirely.")
    else:
        print(f"✅ Found {found_count} matching payloads! The data is successfully captured.")

if __name__ == "__main__":
    analyze_traffic("traffic.mitm")
