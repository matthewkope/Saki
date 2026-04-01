# Cue App Data Interception & Scraping Workflow

This document provides a highly detailed, end-to-end operational manual for successfully intercepting, capturing, and extracting hidden JSON astrology/numerology data from the iOS Cue app. It is written to be easily readable by both human developers and LLMs that may need to replicate or build upon this process.

## 🎯 Objective
To capture deep, nested json profile data (containing highly-detailed astrological and numerological logic) that the Cue app fetches from its API, and safely format it into uniquely named CSVs for local database seeding. 

Because the app's API endpoints can be unpredictable, this workflow relies on a **Man-In-The-Middle (MITM) raw byte scan**—bypassing the need to target specific API URLs and instead scraping matching JSON payloads directly out of the binary network traffic stream.

---

## 🛠️ Phase 1: Prerequisites & Environment Setup

Before data can be pulled, your computer must be configured to act as a traffic inspector for your phone.

**1. Install MITM Proxy**
Open your Mac's terminal and install the proxy tool:
```bash
brew install mitmproxy
```

**2. Create the Python Environment**
We use a specialized Conda environment called `mitm_env` to run the parsing scripts.
```bash
conda create -n mitm_env python=3.10 -y
conda run -n mitm_env pip install mitmproxy pandas supabase python-dotenv
```

**3. Find Your Mac's IP Address**
Hold the `Option` (`⌥`) key and click the Wi-Fi icon in your Mac's menu bar. Write down your IP Address (e.g., `10.0.0.222`).

---

## 🔒 Phase 2: Live Data Interception

Since we verified Cue does **not** use SSL Pinning, intercepting the encrypted HTTPS payload is straightforward as long as you strictly follow the iOS caching rules.

**1. Start the Proxy Server**
In your Mac terminal, navigate to your workspace folder:
```bash
cd "Desktop/Saki Website"
```
Start dumping all traffic into a binary file titled `traffic.mitm`:
*(We use `rm -f` to clear any old captures before starting a fresh one)*
```bash
conda run -n mitm_env rm -f traffic.mitm && mitmdump -w traffic.mitm
```
*(Leave this terminal window open and running).*

**2. Configure Your iPhone**
* **Turn OFF Cellular Data:** (Crucial! If you do not do this, iOS will secretly bypass the proxy to load the app using 5G/LTE if it feels the proxy is too slow).
* Go to **Settings > Wi-Fi**, hit the `(i)` next to your network.
* Scroll down to **Configure Proxy**, choose **Manual**.
* Enter your Mac's IP address (e.g., `10.0.0.222`) and Port `8080`. Hit Save.

**3. Install & Trust the Certificate (First time only)**
* Open Safari, go to `http://mitm.it`.
* Click the Apple logo to download the configuration profile.
* Go to your iPhone Settings -> **Profile Downloaded** (at the top), and Install it.
* Go to **Settings > General > About > Certificate Trust Settings** (at the very bottom) and toggle **mitmproxy** ON to fully trust it.

---

## 🎣 Phase 3: Bypassing the App Cache & Capturing
The Cue app aggressively uses **Disk Caching**—if you have looked at a profile recently, the app will load it from the iPhone's offline memory, which means the proxy cannot catch it. 

To ensure the proxy catches the data:
1. **Force Close Cue:** Swipe up on the Cue app in your task manager to completely kill it.
2. Open the app and navigate to new/unread profiles.
3. If a previously-tapped profile refuses to trigger a network request, **log out of the Cue App and log back in** to flush the local disk memory completely.
4. Every profile you tap will now be secretly captured in the `traffic.mitm` binary file on your Mac.

---

## ⚙️ Phase 4: Extraction & Parsing

Once you are done tapping through profiles, use the custom Python parser (`data_parser.py`) to scan the heavy binary file and extract the data automatically.

**Run the Command:**
```bash
conda run -n mitm_env python intercepter/data_parser.py
```

This script does the following automatically:
1. Scanning through millions of bytes to isolate JSON payloads containing `chinese` and `traits`/`lifepath`.
2. Flattening deep nested JSON dictionaries securely (and stringifying Python lists to prevent pandas `unhashable type` errors).
3. Utilizing Regex tailored specifically to the Cue payload to extract the Primary Lifepath, Secondary Lifepath, Eastern Zodiac (Earth), and Western Zodiac strings.
4. Saving each unique profile as a formatted spreadsheet inside the intercepted data folder.

---

## 🗄️ Phase 5: Supabase Seeding (Optional)
To permanently store the extracted profile in a cloud Postgres database with queryable top-level filters.

**1. Push the SQL Migration (First time only)**
Ensure you have the Supabase CLI running. Push the created schema which builds the `user_astrology_profiles` table using a flexible `jsonb` column for the 66-attribute payload.
```bash
supabase db push
```

**2. Upload the Row**
Ensure you have a `.env` file containing `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.
Run the seeder script:
```bash
conda run -n mitm_env python seed_to_supabase.py
```

---

## 🛑 Phase 6: Safely Disengaging
When you are completely finished scraping for the day, your phone will **not have internet access** unless the proxy on your Mac is running. To restore your phone to normal:

1. **Stop the Proxy:** Go to your Mac terminal and hit `Ctrl+C` where `mitmdump` is running.
2. **Turn off the iPhone Proxy Setting:**
   - Go back to **Settings > Wi-Fi**, hit the `(i)`.
   - Scroll down to **Configure Proxy** and switch it from `Manual` back to **`Off`**.
3. **Turn Cellular Data Back On:** Don't forget to re-enable Cellular Data so you have a signal when you leave Wi-Fi!

---

## 📂 Repository File Breakdown

The following files are actively maintained to facilitate this workflow.

### 1. `traffic.mitm`
**Type**: Binary Dump File
**Purpose:** This is the raw encrypted data stream actively generated by `mitmdump`. It contains thousands of app requests and responses. It is the "source of truth" that our scraper reads from. You can safely delete this file whenever you want to start a fresh recording session.

### 2. `intercepter/data_parser.py`
**Type**: Python Script *(The core extraction engine)*
**Purpose:** This is the primary parsing brain. It bypasses the need to filter by dynamic API endpoints by raw body scanning the `.mitm` file. It flattens the JSON, filters out duplicate fetches so we don't end up with redundant files, names them using a `PX_SY_Z_ZZ` Regex convention, and outputs them seamlessly into the intercepted data folder.

### 3. `intercepter/intercepted_data/` (The Intercepted Data Directory)
**Type**: Output Directory
**Purpose:** This is the destination folder where `data_parser.py` saves the captured profiles. All files dumped here will be uniformly named using the regex extraction logic (e.g., `P9_S17_Cat_Virgo.csv`). This serves as our clean dataset, completely isolated from the raw, messy MITM payload dumps.

### 4. `intercepter/dump_raw_all.py`
**Type**: Python Script *(Diagnostic)*
**Purpose:** Built to debug aggressive iPhone caching. It bypasses all pandas logic and simply dumps every unmodified JSON payload from the proxy directly into `all_raw_json_dumps.json`. Useful for verifying if the iOS app actually fetched the data over the network.

### 5. `intercepter/deep_scan_json.py`
**Type**: Python Script *(Diagnostic)*
**Purpose:** A lightweight predecessor to `intercepter/data_parser.py` used to print raw-byte data directly to terminal during testing to confirm SSL payload visibility.

### 6. `intercepter/seed_to_supabase.py`
**Type**: Python Script
**Purpose:** The seeding script that takes the CSVs from the intercepted data folder and pushes them into the Supabase Postgres target table.

---

## 🛑 Security & Privacy (.gitignore)

To ensure absolutely zero personal or sensitive data from your iPhone ever accidentally leaks out onto the internet when you push this code to a public repository (like GitHub), we maintain a strict `.gitignore` policy for this workflow.

### 1. The Proxy Dumps & Payloads
- `*.mitm` / `traffic.mitm`: The massive binary files that the proxy writes. These files contain *every single piece of internet traffic* your phone made while the proxy was running (which could include background apps checking your email, text messages syncing, passwords, etc.). It is highly critical this is completely ignored.
- `all_raw_json_dumps.json`: The raw text file containing the unedited JSON responses from the Cue API.

### 2. The Intercepted Data Folders
- `intercepter/intercepted_data/`: The folders where your raw CSV profiles are sitting. The data inside these files technically belongs to Cue and contains their proprietary paragraph text and logic, so making this public could cause legal or copyright issues. 

### 3. Server Keys & Local Environments
- `.env` & `.env.*`: Crucial so you never accidentally upload your Supabase Service Key, which would allow anyone to delete your cloud database.
- `.venv/` & `mitm_env/`: Your local machine's python installations do not need to be uploaded.
