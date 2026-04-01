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
        elif isinstance(v, list):
            items.append((new_key, ", ".join(map(str, v))))
        else:
            items.append((new_key, v))
    return dict(items)

def extract_data():
    print("Extracting Cue Profile Data deeply from raw MITM bytes...")
    extracted_profiles = []

    try:
        with open("traffic.mitm", "rb") as logfile:
            freader = io.FlowReader(logfile)
            for flow in freader.stream():
                if flow.response and flow.response.content:
                    try:
                        # Auto-decompresses and decodes the byte payload into a string
                        body = flow.response.get_text(strict=False)
                        if not body: continue
                        
                        # Aggressively check ONLY for the presence of the data, ignoring URLs and Headers
                        if "chinese" in body.lower() and ("lifepath" in body.lower() or "traits" in body.lower()):
                            try:
                                data = json.loads(body)
                                flat_data = flatten_dict(data)
                                extracted_profiles.append(flat_data)
                            except json.JSONDecodeError:
                                pass
                    except Exception:
                        pass
    except FileNotFoundError:
        print("❌ Could not find traffic.mitm. Make sure you run mitmdump -w traffic.mitm first!")
        sys.exit(1)
    except FlowReadException as e:
        print(f"⚠️ Warning: Encountered an error reading part of the MITM file: {e}")

    if not extracted_profiles:
        print("❌ No matching profile data found in the dump. Please check your proxy settings and ensure Cellular Data is OFF.")
        sys.exit(1)

    # Convert to standard CSV table
    df = pd.DataFrame(extracted_profiles)
    df = df.drop_duplicates()  # Removes duplicate profile scrapes!
    # Split into individual correctly-named files
    import os
    import re
    
    # We will output them directly to the intercepter/intercepted_data directory
    output_dir = "intercepter/intercepted_data"
    os.makedirs(output_dir, exist_ok=True)
    
    saved_files = []
    
    for idx, row in df.iterrows():
        x = "Unknown"
        if "numerology_Numerology_Slide1" in row and pd.notna(row["numerology_Numerology_Slide1"]):
            m = re.search(r"(\d+)\s*Lifepath", str(row["numerology_Numerology_Slide1"]), re.IGNORECASE)
            if m: x = m.group(1)
            
        y = "Unknown"
        if "numerology_DayOfMonth_Core_traits1" in row and pd.notna(row["numerology_DayOfMonth_Core_traits1"]):
            m = re.search(r"he\s+(\d+)(?:st|nd|rd|th):", str(row["numerology_DayOfMonth_Core_traits1"]), re.IGNORECASE)
            if m: y = m.group(1)
            
        zz = "Unknown"
        if "western_Western_Slide1" in row and pd.notna(row["western_Western_Slide1"]):
            m = re.search(r"^([A-Za-z]+)", str(row["western_Western_Slide1"]))
            if m: zz = m.group(1).capitalize()
            
        z = "Unknown"
        eastern_key = next((k for k in row.keys() if str(k).startswith("chinese_") and str(k).endswith("_Slide1")), None)
        if eastern_key and pd.notna(row[eastern_key]):
            text = str(row[eastern_key]).lower()
            for animal in ["rat", "ox", "tiger", "cat", "dragon", "snake", "horse", "goat", "monkey", "rooster", "dog", "pig"]:
                if animal in text:
                    z = animal.capitalize()
                    break

        filename = f"P{x}_S{y}_{z}_{zz}.csv"
        filepath = os.path.join(output_dir, filename)
        
        single_row_df = pd.DataFrame([row])
        single_row_df.to_csv(filepath, index=False)
        saved_files.append(filepath)

    print(f"\n✅ Success! Exported {len(saved_files)} perfectly named files into '{output_dir}/'")
    for f in saved_files:
        print(f"  -> {f}")

if __name__ == "__main__":
    extract_data()
