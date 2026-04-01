import pandas as pd
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Run: pip install supabase pandas python-dotenv
# Ensure you have your .env file with SUPABASE_URL and SUPABASE_SERVICE_KEY

def run_seed():
    load_dotenv()
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in your local .env file.")
        return
        
    print("Connecting to Supabase...")
    supabase: Client = create_client(url, key)
    
    # Read the scraped data
    csv_file = "cue_astrology_data.csv"
    if not os.path.exists(csv_file):
        print(f"❌ Could not find {csv_file}. Make sure you run the extraction script first!")
        return
        
    print(f"Reading {csv_file}...")
    df = pd.read_csv(csv_file)
    
    # The entire row of 66 columns becomes our flexible JSON payload
    profile_data_payload = df.iloc[0].to_dict()
    
    # Structure the SQL row exactly as requested by the user
    insert_data = {
        "lifepath_primary": 3,
        "lifepath_secondary": 9,
        "eastern_sign": "Earth Cat",
        "western_sign": "Scorpio",
        "profile_data": profile_data_payload
    }
    
    target_table = "cue_astrology_profiles"
    print(f"Uploading to {target_table} table...")
    try:
        # Using the service key allows us to bypass RLS and insert securely
        response = supabase.table(target_table).insert(insert_data).execute()
        print("\n✅ Successfully seeded the profile into Supabase!")
        print(f"Generated Record ID: {response.data[0]['id']}")
        print("Data is now safely backed up to the cloud.")
    except Exception as e:
        print(f"\n❌ Failed to insert data: {e}")

if __name__ == "__main__":
    run_seed()
