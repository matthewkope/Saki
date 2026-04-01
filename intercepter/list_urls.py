from mitmproxy import io
from mitmproxy.exceptions import FlowReadException

def print_urls(file_path):
    print("Scanning exactly what your phone sent to the internet...")
    urls = set()
    
    with open(file_path, "rb") as logfile:
        freader = io.FlowReader(logfile)
        try:
            for flow in freader.stream():
                if "sentry" not in flow.request.url and "apple" not in flow.request.url and "icloud" not in flow.request.url:
                    urls.add(flow.request.url.split("?")[0]) # ignore query params for clean output
        except FlowReadException as e:
            print(f"Flow file parse error: {e}")
            
    print(f"\nFound {len(urls)} unique app requests in your dump:")
    for url in sorted(urls):
        print(f"  - {url}")

if __name__ == "__main__":
    print_urls("traffic.mitm")
