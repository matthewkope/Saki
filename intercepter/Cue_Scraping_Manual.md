# Cue App Astrology Scraping Manual
*A complete guide to extracting hidden JSON data from the Cue app using MITM proxying on macOS and iOS, and storing it safely in Supabase.*

---

## Phase 1: Preparation & Setup
Before you can pull any data, your computer needs to act as a traffic inspector for your phone.

**1. Install Required Software**
Open your Mac's terminal and run:
`brew install mitmproxy`

**2. Create the Python Environment (Once)**
We created a specialized Conda environment called `mitm_env` to run the parsing scripts. If you ever need to rebuild it:
`conda create -n mitm_env python=3.10 -y`
`conda run -n mitm_env pip install mitmproxy pandas supabase python-dotenv`

**3. Find Your Mac's IP Address**
Hold the `Option` key and click the Wi-Fi icon in your Mac's menu bar. Write down your IP Address (e.g., `10.0.0.222`).

---

## Phase 2: Live Data Interception
Since we verified Cue does **not** use SSL Pinning, intercepting the exact payload is incredibly straightforward as long as you strictly follow cache-clearing rules.

**1. Start the Proxy Server**
In your Mac terminal, navigate to your workspace folder:
`cd "Desktop/Saki Website"`

Start dumping all traffic into a binary file titled `traffic.mitm`:
`rm -f traffic.mitm && mitmdump -w traffic.mitm`
*(Leave this terminal window open and running).*

**2. Configure Your iPhone**
* **Turn OFF Cellular Data:** (Crucial! If you don't do this, your phone will secretly bypass the proxy to load the app).
* Go to **Settings > Wi-Fi**, hit the `(i)` next to your network.
* Scroll down to **Configure Proxy**, choose **Manual**.
* Enter your Mac's IP address (e.g., `10.0.0.222`) and Port `8080`. Hit Save.

**3. Install & Trust the Certificate (First time only)**
* Open Safari, go to `http://mitm.it`.
* Click the Apple logo to download the configuration profile.
* Go to your iPhone Settings -> Profile Downloaded at the top, and Install it.
* Go to **Settings > General > About > Certificate Trust Settings** (at the very bottom) and toggle **mitmproxy** ON to fully trust it.

**4. Capture The Target Profile**
* **Force Close Cue:** Swipe up on the Cue app in your task manager to completely kill it. This wipes its temporary cache.
* Open Cue and navigate to the astrology profile you want to scrape. You must wait for the text to appear on the screen!
* Go back to your Mac terminal and hit `Ctrl+C` to stop the proxy.

*(If you are done scraping, remember to turn your iPhone's Proxy setting back to OFF).*

---

## Phase 3: Extraction & Parsing
Now that we have the raw dump file (`traffic.mitm`), we use our custom script to find the specific `api/v3/profile` endpoint, flatten its 66 nested attributes, and generate a spreadsheet.

**1. Extract the CSV**
Run the parser script through your conda environment:
`conda run -n mitm_env python data_parser.py`

If successful, the script will output `✅ Success! Exported your astrology/lifepath data into 'cue_astrology_data.csv'`.

**2. Rename the Export (Optional)**
Rename `cue_astrology_data.csv` to something specific (e.g., `CSV/P3_S9_Cat_Scorpio.csv`) so it isn't overwritten the next time you extract a profile!

---

## Phase 4: Supabase Seeding
To permanently store the extracted profile in an indestructible cloud database with queryable top-level filters (Lifepath, Signs).

**1. Push the SQL Migration (First time only)**
Ensure you have the Supabase CLI running. Push our created schema which builds the `user_astrology_profiles` table using a flexible `jsonb` column for the 66-attribute payload.
`supabase db push` 

**2. Upload the Row**
Ensure you have a `.env` file containing `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.
Run the seeder script:
`conda run -n mitm_env python seed_to_supabase.py`

*(Note: The current seeder script is hardcoded with `lifepath_primary: 3, eastern_sign: Earth Cat`, etc. If you are uploading a completely different friend's profile, you must open `seed_to_supabase.py` and change line 29-32 to match their actual signs before running it!)*

---

## Phase 5: Safely Disengaging
When you are completely finished scraping for the day, your phone will **not have internet access** unless the proxy on your Mac is running. To restore your phone to normal:

1. **Stop the Proxy:** Go to your Mac terminal and hit `Ctrl+C` if `mitmdump` is still running.
2. **Turn off the iPhone Proxy Setting:**
   - Go back to **Settings > Wi-Fi**, hit the `(i)` next to your network.
   - Scroll down to **Configure Proxy**.
   - Switch it from `Manual` back to **`Off`**.
3. **Turn Cellular Data Back On:** Don't forget to re-enable your Cellular Data in the iPhone settings so you have signal when you leave the house!
