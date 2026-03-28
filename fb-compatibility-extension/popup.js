document.getElementById('scrapeBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Scraping...';
    statusDiv.className = '';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes("facebook.com")) {
        statusDiv.textContent = 'Please navigate to facebook.com/events/birthdays first.';
        statusDiv.className = 'error';
        return;
    }

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    }, (results) => {
        if (chrome.runtime.lastError) {
            statusDiv.textContent = 'Script error: ' + chrome.runtime.lastError.message;
            statusDiv.className = 'error';
            return;
        }

        const data = results?.[0]?.result;

        if (!data || data.length === 0) {
            statusDiv.textContent = 'No birthdays found. Make sure you are on facebook.com/events/birthdays and the page has loaded.';
            statusDiv.className = 'error';
            return;
        }

        statusDiv.textContent = `Found ${data.length} friends. Sending to app...`;

        fetch("http://localhost:3000/api/compatibility/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ friends: data })
        })
        .then(res => res.json())
        .then(json => {
            if (json.id) {
                chrome.tabs.create({ url: `http://localhost:3000/compatibility/friends?id=${json.id}` });
            } else {
                statusDiv.textContent = 'Server error: ' + (json.error || 'No session ID returned');
                statusDiv.className = 'error';
            }
        })
        .catch(() => {
            statusDiv.textContent = 'Connection error — make sure your Next.js app is running on localhost:3000.';
            statusDiv.className = 'error';
        });
    });
});