const REFERENCE_KEY = 'cueReferenceBirthday';
const PENDING_SCAN_KEY = 'cuePendingProfileScan';

const statusDiv = document.getElementById('status');
const profileBtn = document.getElementById('profileBtn');
const scrapeBtn = document.getElementById('scrapeBtn');
const pageHint = document.getElementById('pageHint');
const refMonth = document.getElementById('refMonth');
const refDay = document.getElementById('refDay');
const refYear = document.getElementById('refYear');

let activeTab = null;

function setStatus(message, className = '') {
    statusDiv.textContent = message;
    statusDiv.className = className;
}

function normalizeDateInput(input, maxLength) {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, maxLength);
        persistReferenceDate();
    });
}

function persistReferenceDate() {
    chrome.storage.local.set({
        [REFERENCE_KEY]: {
            month: refMonth.value,
            day: refDay.value,
            year: refYear.value,
        }
    });
}

function setPendingProfileScan(payload) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [PENDING_SCAN_KEY]: payload }, resolve);
    });
}

function clearPendingProfileScan() {
    return new Promise((resolve) => {
        chrome.storage.local.remove(PENDING_SCAN_KEY, resolve);
    });
}

function loadReferenceDate() {
    return new Promise((resolve) => {
        chrome.storage.local.get([REFERENCE_KEY], (result) => {
            const saved = result[REFERENCE_KEY] || {};
            refMonth.value = saved.month || '';
            refDay.value = saved.day || '';
            refYear.value = saved.year || '';
            resolve();
        });
    });
}

function getReferenceDate() {
    const month = refMonth.value.trim();
    const day = refDay.value.trim();
    const year = refYear.value.trim();

    if (!month || !day || !year) {
        throw new Error('Enter the full reference date first.');
    }

    const m = Number(month);
    const d = Number(day);
    const y = Number(year);

    if (!Number.isInteger(m) || !Number.isInteger(d) || !Number.isInteger(y) || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2099) {
        throw new Error('Use a valid reference date in MM/DD/YYYY format.');
    }

    return { month, day, year };
}

function ensureFacebookTab(tab) {
    if (!tab?.url || !tab.url.includes('facebook.com')) {
        throw new Error('Open a Facebook page first.');
    }
}

function injectContentScript(tabId) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            resolve();
        });
    });
}

function sendTabMessage(tabId, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            resolve(response);
        });
    });
}

function openCompatibilityPage(tabId, referenceDate, targetDate, metadata = {}) {
    const params = new URLSearchParams({
        p1m: referenceDate.month,
        p1d: referenceDate.day,
        p1y: referenceDate.year,
        p2m: String(targetDate.month),
        p2d: String(targetDate.day),
        p2y: String(targetDate.year),
    });

    if (metadata.referenceLabel) params.set('p1label', metadata.referenceLabel);
    if (metadata.targetLabel) params.set('p2label', metadata.targetLabel);
    if (metadata.profileUrl) params.set('source', metadata.profileUrl);

    chrome.tabs.update(tabId, { url: `${BASE_URL}/compatibility?${params.toString()}` });
}

function updateProfileButton(context) {
    if (!activeTab?.url || !activeTab.url.includes('facebook.com')) {
        profileBtn.textContent = 'Scan Current Profile';
        profileBtn.disabled = false;
        pageHint.textContent = 'Open a Facebook profile to scan it.';
        return;
    }

    if (context?.isScannableProfilePage) {
        profileBtn.textContent = 'Scan Current Profile';
        pageHint.textContent = `Ready to scan${context.profileName ? ` ${context.profileName}` : ' this profile'} from the current page.`;
        return;
    }

    if (context?.canOpenScanPage) {
        profileBtn.textContent = 'Open Scan Page';
        pageHint.textContent = 'This profile needs the Contact and Basic Info page open before scanning. The button will take you there.';
        return;
    }

    if (context?.isFacebook) {
        profileBtn.textContent = 'Scan Current Profile';
        pageHint.textContent = 'Open someone’s Facebook profile to scan compatibility.';
        return;
    }

    profileBtn.textContent = 'Scan Current Profile';
    pageHint.textContent = 'Open a Facebook profile to scan it.';
}

async function refreshPageContext() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tab;

    if (!tab?.id) {
        updateProfileButton(null);
        return;
    }

    if (!tab.url || !tab.url.includes('facebook.com')) {
        updateProfileButton(null);
        return;
    }

    try {
        await injectContentScript(tab.id);
        const response = await sendTabMessage(tab.id, { action: 'getPageContext' });
        updateProfileButton(response?.success ? response.data : null);
    } catch (error) {
        updateProfileButton({ isFacebook: true, canOpenScanPage: false, isScannableProfilePage: false });
        setStatus(`Page scan unavailable: ${error.message}`, 'error');
    }
}

profileBtn.addEventListener('click', async () => {
    try {
        const referenceDate = getReferenceDate();
        ensureFacebookTab(activeTab);
        await injectContentScript(activeTab.id);
        setStatus('Checking current Facebook page...');

        const response = await sendTabMessage(activeTab.id, { action: 'scanProfile' });
        if (!response?.success) {
            throw new Error(response?.error || 'Unable to scan this profile.');
        }

        if (response.data?.mode === 'redirect') {
            await setPendingProfileScan({
                referenceDate,
                profileUrl: response.data.profileUrl || activeTab.url,
                createdAt: Date.now(),
            });
            setStatus(response.data.message || 'Opening the Contact and Basic Info page for this profile. The extension will finish the scan automatically after the page loads.', 'success');
            chrome.tabs.update(activeTab.id, { url: response.data.url });
            return;
        }

        if (!response.data?.birthday?.year) {
            throw new Error('This Facebook profile does not expose a full birth year, so a complete compatibility reading cannot be calculated.');
        }

        await clearPendingProfileScan();
        openCompatibilityPage(activeTab.id, referenceDate, response.data.birthday, {
            referenceLabel: 'Reference Date',
            targetLabel: response.data.profileName || 'Facebook Profile',
            profileUrl: response.data.profileUrl || activeTab.url,
        });

        setStatus(`Opened compatibility for ${response.data.profileName || 'this Facebook profile'}.`, 'success');
    } catch (error) {
        setStatus(error.message, 'error');
    }
});

scrapeBtn.addEventListener('click', async () => {
    try {
        ensureFacebookTab(activeTab);
        await clearPendingProfileScan();
        setStatus('Authenticating with Facebook API...');

        await injectContentScript(activeTab.id);
        const response = await sendTabMessage(activeTab.id, { action: 'scrape' });

        if (!response || !response.success) {
            throw new Error(response ? response.error : 'Unknown fault');
        }

        const data = response.data;
        if (!data || data.length === 0) {
            throw new Error('No birthdays found in API response.');
        }

        setStatus(`Success! Fetched ${data.length} friends. Opening Calculator...`, 'success');

        const nextjsUrl = `${BASE_URL}/compatibility/friends`;
        const payload = { friends: data };

        const ingestResponse = await fetch(`${BASE_URL}/api/compatibility/ingest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': INGEST_API_KEY,
            },
            body: JSON.stringify(payload)
        });
        const json = await ingestResponse.json();

        if (!json.id) {
            throw new Error('Safe portal did not return a session ID');
        }

        chrome.tabs.update(activeTab.id, { url: `${nextjsUrl}?id=${json.id}` });
    } catch (error) {
        console.error('Facebook scrape error:', error);
        setStatus(error.message.includes('Failed to fetch')
            ? 'Connection Error: Make sure your Next.js app is available at the configured BASE_URL.'
            : error.message, 'error');
    }
});

normalizeDateInput(refMonth, 2);
normalizeDateInput(refDay, 2);
normalizeDateInput(refYear, 4);

loadReferenceDate().then(() => refreshPageContext());
