// content.js
if (!window.__fbExtensionInjected) {
    window.__fbExtensionInjected = true;

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
});
}