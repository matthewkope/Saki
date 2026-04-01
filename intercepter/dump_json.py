import os
from mitmproxy import http

# This script runs alongside mitmproxy and automatically saves any JSON responses it sees.

# Directory to save the dumped files
DUMP_DIR = "./intercepted_data"

# Ensure the directory exists
if not os.path.exists(DUMP_DIR):
    os.makedirs(DUMP_DIR)

class JSONDumper:
    def __init__(self):
        self.counter = 1

    def response(self, flow: http.HTTPFlow):
        # We only care about responses that contain JSON
        if "application/json" in flow.response.headers.get("content-type", "").lower():
            # Get the raw HTTP content
            content = flow.response.get_text(strict=False)
            
            # Skip empty responses
            if not content or content.strip() == "":
                return

            # Generate a filename based on the URL and our counter
            url_part = flow.request.path.split("?", 1)[0].replace("/", "_").replace(".", "_")
            if len(url_part) > 30:
                url_part = url_part[-30:] # Keep filename reasonable
            
            filename = f"{self.counter:04d}_{url_part}.json"
            filepath = os.path.join(DUMP_DIR, filename)
            
            # Save the JSON content to a file
            try:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"✅ Saved JSON response to: {filepath}")
                self.counter += 1
            except Exception as e:
                print(f"❌ Failed to save {filepath}: {e}")

addons = [
    JSONDumper()
]
