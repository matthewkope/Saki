function scrapeBirthdays() {
    const seen = new Set();
    const friends = [];

    const DATE_RE = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?\b/;

    function addFriend(name, birthday) {
        const key = name.toLowerCase().trim();
        if (!key || key.length < 2 || seen.has(key)) return;
        const dateMatch = birthday.match(DATE_RE);
        if (!dateMatch) return;
        seen.add(key);
        friends.push({ name: name.trim(), birthday: dateMatch[0].trim() });
    }

    // Strategy 1: role="listitem" and <li> containers
    document.querySelectorAll('[role="listitem"], li').forEach(row => {
        const dateMatch = (row.innerText || '').match(DATE_RE);
        if (!dateMatch) return;
        const nameEl = row.querySelector('a[href*="facebook.com"], a[href^="/"], strong');
        const name = nameEl ? nameEl.innerText.split('\n')[0].trim() : '';
        if (name) addFriend(name, dateMatch[0]);
    });

    // Strategy 2: role="row" or role="gridcell" containers (calendar-style layout)
    document.querySelectorAll('[role="row"], [role="gridcell"]').forEach(row => {
        const dateMatch = (row.innerText || '').match(DATE_RE);
        if (!dateMatch) return;
        const nameEl = row.querySelector('a[href*="facebook.com"], a[href^="/"], strong');
        const name = nameEl ? nameEl.innerText.split('\n')[0].trim() : '';
        if (name) addFriend(name, dateMatch[0]);
    });

    // Strategy 3: find every profile link on the page, then check siblings/parent for a date
    document.querySelectorAll('a[href*="facebook.com/"], a[href^="/"]').forEach(link => {
        const href = link.getAttribute('href') || '';
        // Skip nav links, groups, pages, events
        if (href.includes('/groups/') || href.includes('/events/') ||
            href.includes('/pages/') || href.includes('/messages/') ||
            href === '/' || href.startsWith('#')) return;

        const name = link.innerText.split('\n')[0].trim();
        if (!name || name.length < 2) return;

        // Search parent elements up to 4 levels for a date string
        let el = link.parentElement;
        for (let i = 0; i < 4; i++) {
            if (!el) break;
            const text = el.innerText || '';
            const dateMatch = text.match(DATE_RE);
            if (dateMatch) {
                addFriend(name, dateMatch[0]);
                break;
            }
            el = el.parentElement;
        }
    });

    // Strategy 4: sweep all text nodes for date strings, find nearest name
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        const text = node.textContent || '';
        const dateMatch = text.match(DATE_RE);
        if (!dateMatch) continue;

        // Walk up to find a sibling or ancestor with a profile link
        let parent = node.parentElement;
        for (let i = 0; i < 5; i++) {
            if (!parent) break;
            const link = parent.querySelector('a[href*="facebook.com/"], a[href^="/"]');
            if (link) {
                const href = link.getAttribute('href') || '';
                if (!href.includes('/events/') && !href.includes('/groups/') && href !== '/') {
                    const name = link.innerText.split('\n')[0].trim();
                    if (name) { addFriend(name, dateMatch[0]); break; }
                }
            }
            parent = parent.parentElement;
        }
    }

    console.log(`[Birthday Scraper] Found ${friends.length} friends:`, friends);
    return friends;
}

scrapeBirthdays();