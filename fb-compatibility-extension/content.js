// content.js
if (!window.__fbExtensionInjected) {
    window.__fbExtensionInjected = true;

const PENDING_SCAN_KEY = 'cuePendingProfileScan';

function getFbDtsg() {
    const input = document.querySelector('input[name="fb_dtsg"]');
    if (input) return input.value;
    
    const scripts = document.querySelectorAll('script');
    for (let script of scripts) {
        const text = script.innerText;
        // Method 1: DTSGInitialData
        const match = text.match(/"DTSGInitialData",\[\],{"token":"([^"]+)"}/);
        if (match) return match[1];
        
        // Method 2: fb_dtsg plain key
        const match2 = text.match(/"fb_dtsg":"([^"]+)"/);
        if (match2) return match2[1];
    }
    return null;
}

function getUserId() {
    const match = document.cookie.match(/c_user=(\d+)/);
    if (match) return match[1];

    const scripts = document.querySelectorAll('script');
    for (let script of scripts) {
        const text = script.innerText;
        const uMatch = text.match(/"USER_ID":"(\d+)"/);
        if (uMatch) return uMatch[1];
    }
    return '0';
}

async function fetchFacebookBirthdays() {
    const fbDtsg = getFbDtsg();
    const userId = getUserId();

    if (!fbDtsg) {
        throw new Error("Could not find secure Facebook tokens. Are you fully logged in to facebook.com?");
    }

    const DOC_ID = "26347570848226687";
    let allFriends = [];

    // Loop through 12 months offset to grab the entire year of birthdays
    for (let offset = 0; offset < 12; offset++) {
        const variables = JSON.stringify({"count":500,"cursor":null,"offset_month":offset,"scale":2,"stream_birthday_months":false});

        const formData = new URLSearchParams();
        formData.append("__a", "1");
        formData.append("__user", userId);
        formData.append("fb_dtsg", fbDtsg);
        formData.append("fb_api_caller_class", "RelayModern");
        formData.append("fb_api_req_friendly_name", "BirthdayCometMonthlyBirthdaysRefetchQuery");
        formData.append("variables", variables);
        formData.append("doc_id", DOC_ID);

        try {
            const response = await fetch("https://www.facebook.com/api/graphql/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            });

            const text = await response.text();
            const cleanText = text.replace("for (;;);", "");
            
            try {
                const json = JSON.parse(cleanText);
                allFriends = [...allFriends, ...parseGraphQLResponse(json)];
            } catch(e) {
                // Streamed JSON via newlines
                const lines = cleanText.split('\n');
                for (let line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const parsed = JSON.parse(line);
                        allFriends = [...allFriends, ...parseGraphQLResponse(parsed)];
                    } catch (pe) {}
                }
            }
        } catch (e) {
            console.error("GraphQL Request Failed on offset " + offset + ":", e.message);
        }
    }

    // Deduplicate by name just in case Facebook returns overlapping windows
    const dedup = [];
    const seen = new Set();
    for (const f of allFriends) {
        if (!seen.has(f.name)) {
            seen.add(f.name);
            dedup.push(f);
        }
    }

    if (dedup.length === 0) {
        throw new Error("API call succeeded but 0 friends were found. The parser logic may need adjustment for this specific GraphQL payload.");
    }
    
    return dedup;
}

function cleanText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
}

function getPageText() {
    return cleanText(document.body?.innerText || '');
}

function parseBirthdayText(rawText) {
    const text = cleanText(rawText);
    if (!text) return null;

    const monthPattern = '(January|February|March|April|May|June|July|August|September|October|November|December)';

    const fullMonthMatch = text.match(new RegExp(`${monthPattern}\\s+(\\d{1,2})(?:,\\s*|\\s+)(\\d{4})`, 'i'));
    if (fullMonthMatch) {
        return {
            month: monthNameToNumber(fullMonthMatch[1]),
            day: Number(fullMonthMatch[2]),
            year: Number(fullMonthMatch[3]),
            raw: `${fullMonthMatch[1]} ${fullMonthMatch[2]}, ${fullMonthMatch[3]}`
        };
    }

    const monthDayMatch = text.match(new RegExp(`${monthPattern}\\s+(\\d{1,2})(?!\\d)`, 'i'));
    if (monthDayMatch) {
        return {
            month: monthNameToNumber(monthDayMatch[1]),
            day: Number(monthDayMatch[2]),
            year: null,
            raw: `${monthDayMatch[1]} ${monthDayMatch[2]}`
        };
    }

    const numericMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
    if (numericMatch) {
        return {
            month: Number(numericMatch[1]),
            day: Number(numericMatch[2]),
            year: Number(numericMatch[3]),
            raw: `${numericMatch[1]}/${numericMatch[2]}/${numericMatch[3]}`
        };
    }

    return null;
}

function monthNameToNumber(name) {
    const months = {
        january: 1,
        february: 2,
        march: 3,
        april: 4,
        may: 5,
        june: 6,
        july: 7,
        august: 8,
        september: 9,
        october: 10,
        november: 11,
        december: 12
    };
    return months[name.toLowerCase()] || null;
}

function getProfileName() {
    const heading = document.querySelector('h1');
    if (heading) {
        const text = cleanText(heading.textContent);
        if (text) return text;
    }

    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle?.content) return cleanText(metaTitle.content);

    return null;
}

function normalizeFacebookUrl(url) {
    try {
        const parsed = new URL(url, window.location.origin);
        parsed.search = '';
        parsed.hash = '';
        return parsed.toString().replace(/\/+$/, '');
    } catch {
        return window.location.href;
    }
}

function getProfileBaseUrl() {
    const current = new URL(window.location.href);
    const path = current.pathname.replace(/\/+$/, '');
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    if (segments[0] === 'profile.php') {
        const id = current.searchParams.get('id');
        return id ? `${current.origin}/profile.php?id=${id}` : null;
    }

    const blocked = new Set(['friends', 'events', 'marketplace', 'groups', 'watch', 'gaming', 'reel', 'reels', 'stories', 'bookmarks', 'birthdays', 'login', 'messages', 'notifications', 'settings']);
    if (blocked.has(segments[0])) return null;

    return `${current.origin}/${segments[0]}`;
}

function buildScanPageUrl(baseUrl) {
    if (!baseUrl) return null;
    if (baseUrl.includes('profile.php')) {
        return `${baseUrl}&sk=about_contact_and_basic_info`;
    }
    return `${baseUrl}/about?section=contact_basic_info`;
}

function isScannableProfilePage() {
    const current = new URL(window.location.href);
    const section = (current.searchParams.get('section') || '').toLowerCase();

    if (current.pathname === '/profile.php') {
        return current.searchParams.get('sk') === 'about_contact_and_basic_info';
    }

    return current.pathname.endsWith('/about_contact_and_basic_info')
        || (current.pathname.endsWith('/about') && (
            section === 'contact_basic_info'
            || section === 'contact-info'
            || section === 'basic-info'
        ));
}

function extractBirthdayFromDom() {
    const selectors = [
        '[aria-label*="Birthday"]',
        '[data-overviewsection="contact_basic_info"]',
        '[data-pagelet*="ProfileTilesFeed"]',
        '[data-pagelet*="ProfileAppSection"]',
        '[role="main"]'
    ];

    for (const selector of selectors) {
        const nodes = document.querySelectorAll(selector);
        for (const node of nodes) {
            const text = cleanText(node.textContent);
            if (!/birthday|born/i.test(text)) continue;

            const labeledMatch = text.match(/(?:Birthday|Born)\s*:?\s*([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{1,2}\/\d{1,2}\/\d{4})/i);
            if (labeledMatch) {
                const parsed = parseBirthdayText(labeledMatch[1]);
                if (parsed) return parsed;
            }

            const parsed = parseBirthdayText(text);
            if (parsed) return parsed;
        }
    }

    const pageText = getPageText();
    const globalMatch = pageText.match(/(?:Birthday|Born)\s*:?\s*([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (globalMatch) {
        return parseBirthdayText(globalMatch[1]);
    }

    return null;
}

function getPageContext() {
    const profileBaseUrl = getProfileBaseUrl();
    const detectedBirthday = profileBaseUrl ? extractBirthdayFromDom() : null;
    return {
        isFacebook: /facebook\.com/.test(window.location.hostname),
        isScannableProfilePage: Boolean(profileBaseUrl && isScannableProfilePage()),
        canOpenScanPage: Boolean(profileBaseUrl && !isScannableProfilePage()),
        profileUrl: profileBaseUrl ? normalizeFacebookUrl(profileBaseUrl) : null,
        scanPageUrl: profileBaseUrl ? buildScanPageUrl(profileBaseUrl) : null,
        profileName: getProfileName(),
        hasVisibleBirthday: Boolean(detectedBirthday),
        visibleBirthdayHasYear: Boolean(detectedBirthday?.year)
    };
}

function scanProfile() {
    const context = getPageContext();

    if (!context.profileUrl) {
        throw new Error('Open a specific Facebook profile before trying to scan.');
    }

    const birthday = extractBirthdayFromDom();
    if (birthday?.year) {
        return {
            mode: 'scan',
            birthday,
            profileName: context.profileName,
            profileUrl: context.profileUrl
        };
    }

    if (!context.isScannableProfilePage) {
        if (context.scanPageUrl) {
            return {
                mode: 'redirect',
                url: context.scanPageUrl,
                message: 'Opening the Contact and Basic Info page now. The extension will complete the scan automatically after the page loads.',
                profileName: context.profileName,
                profileUrl: context.profileUrl
            };
        }
        throw new Error('This Facebook page is not a scannable profile page.');
    }

    if (!birthday) {
        throw new Error('Could not find a birthday on this Facebook profile. Make sure the About > Contact and Basic Info page is open and the birthday is visible.');
    }

    if (!birthday.year) {
        throw new Error('This Facebook profile shows a birthday but not the birth year, so a full compatibility reading cannot be calculated.');
    }

    return {
        mode: 'scan',
        birthday,
        profileName: context.profileName,
        profileUrl: context.profileUrl
    };
}

function openCompatibilityTab(referenceDate, scanResult) {
    const params = new URLSearchParams({
        p1m: referenceDate.month,
        p1d: referenceDate.day,
        p1y: referenceDate.year,
        p2m: String(scanResult.birthday.month),
        p2d: String(scanResult.birthday.day),
        p2y: String(scanResult.birthday.year),
        p1label: 'Reference Date',
        p2label: scanResult.profileName || 'Facebook Profile',
    });

    if (scanResult.profileUrl) {
        params.set('source', scanResult.profileUrl);
    }

    window.location.href = `${BASE_URL}/compatibility?${params.toString()}`;
}

function readPendingProfileScan() {
    return new Promise((resolve) => {
        chrome.storage.local.get([PENDING_SCAN_KEY], (result) => {
            resolve(result[PENDING_SCAN_KEY] || null);
        });
    });
}

function clearPendingProfileScan() {
    return new Promise((resolve) => {
        chrome.storage.local.remove(PENDING_SCAN_KEY, resolve);
    });
}

async function maybeCompletePendingProfileScan() {
    const pending = await readPendingProfileScan();
    if (!pending?.referenceDate) return;

    const currentProfileUrl = normalizeFacebookUrl(getProfileBaseUrl() || window.location.href);
    const pendingProfileUrl = pending.profileUrl ? normalizeFacebookUrl(pending.profileUrl) : null;

    if (!pendingProfileUrl || pendingProfileUrl !== currentProfileUrl) return;

    const maxAgeMs = 5 * 60 * 1000;
    if (pending.createdAt && Date.now() - pending.createdAt > maxAgeMs) {
        await clearPendingProfileScan();
        return;
    }

    const attemptScan = async (attemptsRemaining) => {
        try {
            const result = scanProfile();
            if (result.mode !== 'scan') return;

            openCompatibilityTab(pending.referenceDate, result);
            await clearPendingProfileScan();
        } catch (error) {
            if (attemptsRemaining <= 0) return;
            window.setTimeout(() => {
                attemptScan(attemptsRemaining - 1);
            }, 1200);
        }
    };

    attemptScan(8);
}

function parseGraphQLResponse(json) {
    let friends = [];
    
    // Recursively hunt for nested user nodes that have a name and birthday attached
    function findBirthdays(obj) {
        if (!obj || typeof obj !== 'object') return;
        
        if (obj.name && (obj.birthdate || obj.birthday || (obj.schema_birthday && obj.schema_birthday.day))) {
            const dateNode = obj.birthdate || obj.birthday || obj.schema_birthday;
            let dateString = null;

            if (typeof dateNode === 'object') {
                const parts = [];
                if (dateNode.month) {
                    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    parts.push(months[dateNode.month - 1]);
                }
                if (dateNode.day) parts.push(dateNode.day);
                if (dateNode.year) parts.push(dateNode.year);

                if (parts.length >= 2) {
                    dateString = parts[0] + " " + parts[1] + (parts[2] ? ", " + parts[2] : "");
                }
            } else if (typeof dateNode === 'string') {
                dateString = dateNode;
            }

            // Capture profile URL — Facebook returns it as `url` on user nodes
            const profileUrl = (typeof obj.url === 'string' && obj.url.includes('facebook.com'))
                ? obj.url
                : obj.profile_url || null;

            if (dateString && !friends.find(f => f.name === obj.name)) {
                friends.push({ name: obj.name, birthday: dateString, profileUrl });
            }
        }
        
        for (let key in obj) {
             findBirthdays(obj[key]);
        }
    }
    
    findBirthdays(json);

    return friends;
}

// Wait for popup to trigger
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrape") {
        fetchFacebookBirthdays()
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        return true; 
    }

    if (request.action === "getPageContext") {
        try {
            sendResponse({ success: true, data: getPageContext() });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
        return false;
    }

    if (request.action === "scanProfile") {
        try {
            sendResponse({ success: true, data: scanProfile() });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
        return false;
    }
});

maybeCompletePendingProfileScan();
}
