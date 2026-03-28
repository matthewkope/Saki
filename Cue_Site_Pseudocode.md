# Cue Site — Pseudocode & Feature Reference

All rules and algorithms implemented across the Cue HTML pages, written as language-agnostic pseudocode.

---

## 1. Core Number Utilities

```
function digitSum(n):
    return sum of each digit character in String(n)
    // e.g. digitSum(48) = 4+8 = 12

function reduceToLP(n):
    MASTERS = [11, 22, 28, 33]
    while n > 9 AND n not in MASTERS:
        n = digitSum(n)
    return n

function reduceMaster(n):
    // Used for Letterology — stops only at 11, 22, 33 (not 28)
    MASTERS = [11, 22, 33]
    while n > 9 AND n not in MASTERS:
        n = digitSum(n)
    return n
```

---

## 2. Lifepath Number (LP)

### Rules
- Month 11 is kept as 11 (master). All other months split digit by digit.
- Day 11 and day 22 are kept as masters. All other days split.
- Year is always split digit by digit.
- Raw sum is the **intermediary**. Reduce it stopping at 11, 22, 28, 33.
- If reduction yields 2, treat as 11 (LP 2 does not exist).

### Pseudocode
```
function calcLP(month, day, year):
    raw = 0

    if month == 11:
        raw += 11
    else:
        raw += digitSum(month)        // e.g. month 12 → 1+2 = 3

    if day == 11 OR day == 22:
        raw += day
    else:
        raw += digitSum(day)          // e.g. day 28 → 2+8 = 10

    raw += digitSum(year)             // e.g. 1999 → 1+9+9+9 = 28

    intermediary = raw
    lp = reduceToLP(raw)

    if lp == 2:
        lp = 11                       // LP 2 does not exist

    // --- Special display cases ---

    if raw == 13:                     // Karmic compound number
        display = "13/4"
        karmic13 = true

    else if lp == 28:
        display = "28/1"              // 28 always shown as 28/1

    else if lp == 33:
        pure = (month <= 9) AND (day <= 9)
        if pure:
            display = "33"            // Pure 33: no masters or multi-digit in month/day
        else:
            display = "33/6"          // Non-pure: month or day required splitting

    else if raw != lp:
        display = lp + "/" + raw      // e.g. "3/48", "11/38"

    else:
        display = String(lp)          // Already single-digit or master

    return { lp, raw, display, karmic13, pure33: (lp==33 AND pure) }
```

### 13/4 Karmic Rule

- When raw == 13 → LP is 4, displayed as "13/4"
- **Under investigation — not currently applied:** the 13/4 special compatibility mapping is unconfirmed
- In compatibility calculations, 13/4 currently uses **LP 4** for all table lookups (treated as standard LP 4)
- It is a karmic debt number — combines 4 energy with higher structural potential; unique compatibility signature to be determined

### 33 Pure vs 33/6
- **Pure 33**: month ≤ 9 AND day ≤ 9 — reached using only single-digit inputs
- **33/6**: month > 9 OR day > 9 (whether master or not) — person oscillates between 33 and 6

---

## 3. Secondary Lifepath (SLP)

Derived from birth day only.

```
function calcSLP(day):
    if day == 2:      return 2        // Only day=2 gives SLP 2
    if day == 11:     return 11       // Master, kept
    if day == 22:     return 22       // Master, kept
    if day == 28:     return 28       // Master, kept

    n = day
    while n > 9:
        n = digitSum(n)

    if n == 2:        return 11       // Any reduction to 2 (except day=2) → 11

    return n
```

---

## 4. Personal Year

```
function calcPersonalYear(birthMonth, birthDay):
    today = current date
    currentYear = today.year

    // Use the year of the person's most recent birthday
    if today >= (birthMonth/birthDay of currentYear):
        pyYear = currentYear
    else:
        pyYear = currentYear - 1

    // Raw sum
    monthValue = (birthMonth == 11) ? 11 : birthMonth   // Month 11 kept as 11
    raw = monthValue + birthDay + digitSum(pyYear)

    // Reduce stopping at 11, 22, 33
    py = raw
    while py > 9 AND py not in [11, 22, 33]:
        py = digitSum(py)

    if py == 2:
        py = 11

    display = (raw != py) ? py + "/" + raw : String(py)

    return { py, raw, display }
```

---

## 5. Lucky Number

```
function calcLuckyNumber(month, day, year):
    firstDigit = first character of String(month) as integer
    // e.g. month 11 → firstDigit = 1, month 3 → firstDigit = 3

    // Last non-zero digit of year
    lastDigit = 0
    for i from rightmost digit of year to left:
        if digit != 0:
            lastDigit = digit
            break
    // e.g. year 2000 → lastDigit = 2 (not 0)
    // e.g. year 1999 → lastDigit = 9

    combined = parseInt(String(firstDigit) + String(lastDigit))
    // Concatenation, not addition: 2 and 2 → 22, not 4

    // Step 1: Any result except 19 is valid (including 11, 22, 28, 33)
    if combined != 19:
        return combined

    // Step 2: combined is 19 → try birth day
    if day != 19:
        return day

    // Step 3: birth day also 19 → reduce year digits
    MASTERS = [11, 22, 28, 33]
    n = digitSum(year)                // e.g. 1999 → 28, stops at master
    while n > 9 AND n not in MASTERS:
        n = digitSum(n)
    return n
```

**Key rule**: 19 is the only invalid combined result. Numbers like 14, 22, 28, 33 are all valid lucky numbers.

---

## 6. Eastern Zodiac

```
EAST_ANIMALS = ['Rat','Ox','Tiger','Cat','Dragon','Snake',
                'Horse','Goat','Monkey','Rooster','Dog','Pig']
// Cat replaces Rabbit (Vietnamese system)
// Cycle anchored at 1924 = Rat

LUNAR_NY = {
    year: [month, day],   // Date of lunar new year for that year
    // 1920–2040 table
}

function getEasternAnimal(month, day, year):
    effectiveYear = year

    lny = LUNAR_NY[year]
    if lny exists:
        if (month, day) is before lny:
            effectiveYear = year - 1   // Before new year → previous animal

    idx = ((effectiveYear - 1924) mod 12 + 12) mod 12
    return EAST_ANIMALS[idx]
```

---

## 7. Western Astrology

```
function getWesternSign(month, day):
    if (month==3 AND day>=21) OR (month==4 AND day<=19):  return "Aries"
    if (month==4 AND day>=20) OR (month==5 AND day<=20):  return "Taurus"
    if (month==5 AND day>=21) OR (month==6 AND day<=20):  return "Gemini"
    if (month==6 AND day>=21) OR (month==7 AND day<=22):  return "Cancer"
    if (month==7 AND day>=23) OR (month==8 AND day<=22):  return "Leo"
    if (month==8 AND day>=23) OR (month==9 AND day<=22):  return "Virgo"
    if (month==9 AND day>=23) OR (month==10 AND day<=22): return "Libra"
    if (month==10 AND day>=23) OR (month==11 AND day<=21): return "Scorpio"
    if (month==11 AND day>=22) OR (month==12 AND day<=21): return "Sagittarius"
    if (month==1 AND day>=20) OR (month==2 AND day<=18):  return "Aquarius"
    if (month==2 AND day>=19) OR (month==3 AND day<=20):  return "Pisces"
    return "Capricorn"                                    // Dec 22 – Jan 19
```

---

## 8. Compatibility Score

```
function calcCompatibilityScore(person1, person2):
    lp1 = calcLP(person1.month, person1.day, person1.year)
    lp2 = calcLP(person2.month, person2.day, person2.year)
    slp1 = calcSLP(person1.day)
    slp2 = calcSLP(person2.day)
    east1 = getEasternAnimal(person1.month, person1.day, person1.year)
    east2 = getEasternAnimal(person2.month, person2.day, person2.year)
    west1 = getWesternSign(person1.month, person1.day)
    west2 = getWesternSign(person2.month, person2.day)

    // 13/4 uses LP 22 for all compatibility lookups
    compatLP1 = (lp1.karmic13) ? 22 : lp1.lp
    compatLP2 = (lp2.karmic13) ? 22 : lp2.lp

    lpPct   = LP_COMPAT[compatLP1][compatLP2]    // 12×12 table, 0–105
    eastPct = EAST_COMPAT[east1][east2]          // 12×12 table, 0–105
    westPct = WEST_COMPAT[west1][west2]          // 12×12 table, 0–100
    slpAdj  = SLP_COMPAT[slp1][slp2]            // 12×12 table, ±6

    score = 0.618 × lpPct
          + 0.495 × eastPct
          + 0.053 × westPct
          − 12.81
          + slpAdj

    return score    // Typically 0–100, Rat↔Ox can exceed 100
```

### Score tiers
- ≥ 75: Friendly (green)
- 60–74: Neutral (gold)
- < 60: Enemy (rose)

---

## 9. Universal Day Number (Calendar)

```
function universalDayNumber(month, day, year):
    raw = digitSum(month) + digitSum(day) + digitSum(year)
    return reduceToLP(raw)    // Stops at 11, 22, 28, 33

function isMasterDayNumber(month, day, year):
    udn = universalDayNumber(month, day, year)
    return udn in [11, 22, 28, 33]
```

---

## 10. Full Moon Detection (Calendar)

```
FULL_MOON_REF = January 13, 2025   // Known full moon reference date
LUNAR_CYCLE   = 29.53059           // Days per lunar cycle

function isFullMoon(month, day, year):
    target    = date(year, month, day)
    diffDays  = (target - FULL_MOON_REF) in days
    phase     = diffDays mod LUNAR_CYCLE
    if phase < 0: phase += LUNAR_CYCLE

    // Full moon if within ~1.5 days of the cycle peak
    return phase < 1.5 OR phase > (LUNAR_CYCLE - 1.5)
```

---

## 11. Letterology

### Letter Values
- Lowercase a–z → values 1–26 (a=1, b=2, … z=26)
- Uppercase A–Z → values 27–52 (A=27, B=28, … Z=52)

### Case Sensitivity
- **Default (case-insensitive)**: all input letters treated as lowercase (values 1–26)
- **Case-sensitive mode**: uppercase letters in input use values 27–52; lowercase use 1–26

```
function letterValue(ch, caseSensitive):
    lowerIdx = charCode(lowercase(ch)) - charCode('a')    // 0–25
    if lowerIdx < 0 OR lowerIdx > 25: return null

    if NOT caseSensitive:
        return lowerIdx + 1                               // 1–26

    if ch is uppercase:
        return lowerIdx + 27                              // 27–52
    else:
        return lowerIdx + 1                               // 1–26

function reduceLetterValue(n):
    // Stops at master numbers 11, 22, 33
    MASTERS = [11, 22, 33]
    while n > 9 AND n not in MASTERS:
        n = digitSum(n)
    return n
```

### Calculations

```
function letterologyCalc(word, caseSensitive):
    letters = filter(word.chars, only alphabetic)
    VOWELS  = {'a','e','i','o','u'}

    letterData = for each ch in letters:
        raw     = letterValue(ch, caseSensitive)
        reduced = reduceLetterValue(raw)
        isVowel = lowercase(ch) in VOWELS
        → { ch, raw, reduced, isVowel }

    // Steps — Reduced
    reducedSum   = sum of letterData[i].reduced
    reducedFinal = reduceLetterValue(reducedSum)

    // Steps — Non-Reduced
    nonReducedSum   = sum of letterData[i].raw
    nonReducedFinal = reduceLetterValue(nonReducedSum)

    // Final: uses reduced path to respect master number stops
    finalVal = reducedFinal

    // Additional Values
    totalReduced = reducedFinal

    firstLetter  = letterData[0]

    firstVowel   = first entry in letterData where isVowel == true (or null)

    vowelLetters = filter letterData where isVowel == true
    vowelRawSum  = sum of vowelLetters[i].raw          // Uses non-reduced (raw) values
    vowelFinal   = reduceLetterValue(vowelRawSum)

    return {
        letterData,
        reducedSum, reducedFinal,
        nonReducedSum, nonReducedFinal,
        finalVal,
        totalReduced,
        firstLetter,
        firstVowel,
        vowelRawSum, vowelFinal
    }
```

---

## 12. Date Search

```
function searchDates(referenceDate, filters):
    // filters = { numerology: null|LP|'13/4'|'33/6', zodiac: null|animal, western: null|sign }

    SEARCH_WINDOW = 10 years (±3650 days)
    MAX_RESULTS   = 20
    matches       = []

    for delta from 0 to SEARCH_WINDOW:
        for each direction in [+delta, -delta] (skip duplicate 0):
            targetDate = referenceDate + direction days
            m, d, y    = targetDate.month, day, year

            lpData = calcLP(m, d, y)
            east   = getEasternAnimal(m, d, y)
            west   = getWesternSign(m, d)

            // LP matching
            if filters.numerology == null:      lpMatch = true
            else if filters.numerology == '13/4':  lpMatch = lpData.karmic13
            else if filters.numerology == '33':    lpMatch = (lpData.lp==33 AND lpData.pure33)
            else if filters.numerology == '33/6':  lpMatch = (lpData.lp==33 AND NOT lpData.pure33)
            else:                               lpMatch = (lpData.lp == filters.numerology)

            eaMatch = (filters.zodiac == null)  OR (east == filters.zodiac)
            wsMatch = (filters.western == null) OR (west == filters.western)

            if lpMatch AND eaMatch AND wsMatch:
                matches.append({ date: targetDate, lp: lpData, east, west,
                                  distance: abs(direction), direction })

            if matches.length >= MAX_RESULTS: break

    return matches (already sorted by proximity, nearest first)
```

---

## 13. Panel / Slide-Up System (Personal Reading)

```
state: activePanel = null

function openPanel(type):
    // type ∈ { 'numerology', 'zodiac', 'western', 'careers', 'personalYear' }

    content = lookup CONTENT[type][currentReadingData[type]]
    // For 'numerology': key = currentReading.lp (but use lp 4 for 13/4)
    // For 'zodiac':     key = currentReading.animal
    // For 'western':    key = currentReading.sign
    // For 'careers':    key = currentReading.lp
    // For 'personalYear': key = currentReading.py

    render panel with content
    set overlay visible
    animate panel up from bottom

function closePanel():
    animate panel down
    hide overlay
    activePanel = null
```

---

## 14. Markdown Renderer (Panel Content)

The panel content is stored as markdown strings. A custom inline renderer converts them:

```
function renderMarkdown(text):
    output = ""
    for each line in text.split("\n"):
        if line starts with "# ":    → <h1> tag
        if line starts with "## ":   → <h2> tag
        if line starts with "### ":  → <h3> tag
        if line starts with "- ":    → <li> tag (wrapped in <ul>)
        else if line is not empty:   → <p> tag

        Within any tag, convert **text** → <strong>text</strong>

    return output HTML string
```

---

## 15. Calendar Rendering

```
function buildCalendarMonth(year, month, viewMode):
    // viewMode = 'lifepath' | 'standard'

    days = all dates in (year, month)
    firstDayOfWeek = dayOfWeek(year, month, 1)   // 0=Sun

    for each day in days:
        udn      = universalDayNumber(month, day, year)
        lpData   = calcLP(month, day, year)
        isMaster = udn in [11, 22, 28, 33]
        isFull   = isFullMoon(month, day, year)
        isToday  = (year, month, day) == today

        cell.indicators:
            if isMaster: show ★
            if isFull:   show 🌕

        if viewMode == 'lifepath':
            cell.primaryNumber  = lpData.display
            cell.secondaryLabel = "SLP " + calcSLP(day)
        else:
            cell.primaryNumber  = day
            cell.universalDay   = udn
```

---

## 16. Navigation Rules

All pages share a sticky top nav bar with 5 tabs:

| Tab Label | Route | Active condition |
|-----------|-------|-----------------|
| Personal Reading | `/reading` or `saki-reading.html` | current page |
| Compatibility | `/compatibility` or `cue-compatibility-calculator.html` | current page |
| Calendar | `/calendar` or `cue-calendar.html` | current page |
| Letterology | `/letterology` or `letterology.html` | current page |
| Search | `/search` or `search.html` | current page |

Active tab shown with `--accent` color and bottom border.

---

## 17. Display Format Summary

| Number | Display | Notes |
|--------|---------|-------|
| Regular LP | `LP/intermediary` | e.g. `3/48`, `11/38` |
| LP 28 | `28/1` | Always, regardless of path |
| LP 33 (pure) | `33` | Month ≤ 9 AND day ≤ 9 |
| LP 33 (non-pure) | `33/6` | Month or day multi-digit |
| LP 13/4 | `13/4` | Raw sum == 13, karmic |
| Personal Year | `PY/raw` | e.g. `11/29` |
| SLP | number only | No intermediary shown |
| Lucky Number | number only | No intermediary shown |
