document.getElementById('scrapeBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Authenticating with Facebook API...';
    statusDiv.className = '';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes("facebook.com")) {
        statusDiv.textContent = 'Error: You must be actively logged into Facebook.com to fetch your friends!';
        statusDiv.className = 'error';
        return;
    }

    // Step 1: Inject the engine into the page
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    }, () => {
        if (chrome.runtime.lastError) {
            statusDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
            statusDiv.className = 'error';
            return;
        }

        // Step 2: Command the engine to fire the secure background API request
        chrome.tabs.sendMessage(tab.id, { action: "scrape" }, (response) => {
            if (chrome.runtime.lastError) {
                statusDiv.textContent = 'Error connecting to engine: ' + chrome.runtime.lastError.message;
                statusDiv.className = 'error';
                return;
            }

            if (!response || !response.success) {
                statusDiv.textContent = 'API Error: ' + (response ? response.error : 'Unknown fault');
                statusDiv.className = 'error';
                return;
            }

            const data = response.data;
            if (!data || data.length === 0) {
                statusDiv.textContent = 'No birthdays found in API response!';
                statusDiv.className = 'error';
                return;
            }
            
            statusDiv.textContent = `Success! Fetched ${data.length} friends. Opening Calculator...`;

            // Step 3: Pass to Next.js securely
            const nextjsUrl = `${BASE_URL}/compatibility/friends`;
            const payload = { friends: data };

            fetch(`${BASE_URL}/api/compatibility/ingest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(json => {
                if (json.id) {
                    chrome.tabs.create({ url: `${nextjsUrl}?id=${json.id}` });
                } else {
                    statusDiv.textContent = 'Error: Safe portal did not return a session ID';
                    statusDiv.className = 'error';
                }
            })
            .catch(err => {
                console.error("Fetch error:", err);
                statusDiv.textContent = 'Connection Error: Make sure your Next.js app is running on localhost:3000!';
                statusDiv.className = 'error';
            });
        });
    });
});