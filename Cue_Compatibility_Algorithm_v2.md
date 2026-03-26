# Reverse-Engineering the Cue Compatibility Algorithm (v2)

## Overview

The Cue app generates a 0–100% compatibility score between two people using four inputs: Lifepath number (LP), Secondary Lifepath number (SLP), Eastern zodiac animal (Vietnamese system — Cat replaces Rabbit), and Western zodiac sign. The numerology follows GG33-style interpretation.

This document describes the reverse-engineered formula, how it was derived, and all lookup tables required to compute a prediction.

---

## The Formula

```
Score = 0.618 × LP% + 0.495 × East% + 0.053 × West% − 12.81 + SLP_pair
```

| Term | Source | Weight per 1% | Share of total score |
| ---- | ------ | :-----------: | :------------------: |
| LP% | Lifepath Compatibility Table | 0.618 | ~50% |
| East% | Eastern Zodiac Compatibility Table | 0.495 | ~40% |
| West% | Western Zodiac Compatibility Table | 0.053 | ~4% |
| SLP_pair | SLP Pair Compatibility Matrix | ±6 pts | ~6% |

**Accuracy:** Within ±5 points for all tested date combinations. Typical error: 0.02–2.5 points.

---

## How Each Input Is Calculated

### Lifepath Number (LP)

Sum all digits of the birth date (MM/DD/YYYY), with two exceptions: **month 11 and day 11 are kept as 11**, and **day 22 is kept as 22**. These are master numbers and are not split into individual digits. All other digits — including month 10 (1+0), month 12 (1+2), day 28 (2+8), and all year digits — are split and summed individually.

The resulting raw sum is the **intermediary number**. Reduce the intermediary to a single digit unless it hits a master number (11, 22, 28, 33), which does not reduce. LP=2 does not exist — it becomes LP=11.

**Display format:** LP is shown as `LP/intermediary`. Special cases:

- **28** → always displayed as **28/1** (28 reduces to 2+8=10, 1+0=1), regardless of whether month/day are pure
- **33 (pure)** → displayed as just **33**, when both month and day are single-digit (1–9). No master numbers (11, 22) and no multi-digit reductions were involved in reaching 33 — it was achieved purely through single digits.
- **33/6** → displayed as **33/6**, when either the month or day is a multi-digit number — whether a master number (11, 22) or a non-master that had to be split (e.g., month 10, 12, or day 13, 22, 25, 28, 29, etc.). Being a 33/6 means the person oscillates during life between 33 and 6 energy.
- **All other LPs** → displayed as **LP/intermediary** (e.g., 3/48, 1/37)

#### Master number rules in the raw sum

| Position | Value | Treatment |
| -------- | ----- | --------- |
| Month | 11 | Keep as 11 |
| Month | 10, 12 | Split into digits (1+0, 1+2) |
| Day | 11 | Keep as 11 |
| Day | 22 | Keep as 22 |
| Day | All others (including 28) | Split into digits |
| Year | All digits | Always split individually |

#### Pure 33 vs 33/6

The distinction depends on whether **both** the month and day are naturally single-digit (1–9):

- **Pure 33:** Month is 1–9 AND day is 1–9 → the 33 was reached using only single digits, with no master numbers or multi-digit reductions involved
- **33/6:** Either month or day is a multi-digit number — whether a master (11, 22) or a non-master that had to be split (10, 12, 13, 25, 28, etc.) → the person oscillates between 33 and 6

This distinction does **not** apply to LP 28 — it is always 28/1.

#### Worked examples

**Example 1: 11/09/1999 → 3/48**
```
11 + 9 + 1 + 9 + 9 + 9 = 48
4 + 8 = 12 → 1 + 2 = 3
```
LP = **3**, intermediary = **48**, display: **3/48**
Month 11 (master, kept), day 9 (single digit) — but LP is 3, not a master, so pure/reduced distinction is irrelevant.

**Example 2: 11/11/1999 → 5/50**
```
11 + 11 + 1 + 9 + 9 + 9 = 50
5 + 0 = 5
```
LP = **5**, intermediary = **50**, display: **5/50**

**Example 3: 12/12/1948 → 28/1**
```
1 + 2 + 1 + 2 + 1 + 9 + 4 + 8 = 28
```
LP = **28**, display: **28/1** (28 is always 28/1)

**Example 4: 01/07/1978 → pure 33**
```
1 + 7 + 1 + 9 + 7 + 8 = 33
```
LP = **33**, display: **33**
Month 1 (single digit ✓), day 7 (single digit ✓) → pure 33.

**Example 5: 01/22/2026 → 33/6**
```
1 + 22 + 2 + 0 + 2 + 6 = 33
```
LP = **33**, display: **33/6**
Month 1 (single digit ✓), but day 22 (master number, not single digit ✗) → 33/6.

**Example 6: 10/22/2026 → 33/6**
```
1 + 0 + 22 + 2 + 0 + 2 + 6 = 33
```
LP = **33**, display: **33/6**
Month 10 (two-digit non-master, split to 1+0 ✗) → 33/6.

**Example 7: 10/25/1996 → 33/6**
```
1 + 0 + 2 + 5 + 1 + 9 + 9 + 6 = 33
```
LP = **33**, display: **33/6**
Month 10 (split ✗), day 25 (split ✗) → 33/6.

**Example 8: 11/09/1970 → 1/37**
```
11 + 9 + 1 + 9 + 7 + 0 = 37
3 + 7 = 10 → 1 + 0 = 1
```
LP = **1**, intermediary = **37**, display: **1/37**

### Secondary Lifepath Number (SLP)

The day of birth only. Reduce to a single digit unless the day is 11, 22, or 28. **SLP 16 reduces to 7** (1+6=7) — it is not kept as a master number.

**Example:** Born on the 18th → 1+8 = **9**. Born on the 28th → stays **28**. Born on the 16th → 1+6 = **7**.

### Eastern Zodiac Animal

Uses the Vietnamese 12-year cycle with Cat replacing Rabbit. The animal year follows the **lunar calendar** — dates before lunar new year use the previous year's animal.

| Year mod 12 (from 1924=Rat) | Animal |
| :-: | ------ |
| 0 | Rat |
| 1 | Ox |
| 2 | Tiger |
| 3 | Cat |
| 4 | Dragon |
| 5 | Snake |
| 6 | Horse |
| 7 | Goat |
| 8 | Monkey |
| 9 | Rooster |
| 10 | Dog |
| 11 | Pig |

### Western Zodiac Sign

Standard date ranges: Aries (Mar 21–Apr 19), Taurus (Apr 20–May 20), Gemini (May 21–Jun 20), Cancer (Jun 21–Jul 22), Leo (Jul 23–Aug 22), Virgo (Aug 23–Sep 22), Libra (Sep 23–Oct 22), Scorpio (Oct 23–Nov 21), Sagittarius (Nov 22–Dec 21), Capricorn (Dec 22–Jan 19), Aquarius (Jan 20–Feb 18), Pisces (Feb 19–Mar 20).

---

## How the Formula Was Derived

### Phase 1: Isolate LP compatibility

120 head-to-head scores were collected using dates that shared the same Eastern zodiac (Cat), Western sign (Scorpio), and SLP (9). With three of four variables held constant, any score variation was attributable to LP compatibility alone. This produced the 12×12 LP compatibility matrix and established the LP weight: **0.618 per 1%**.

### Phase 2: Isolate Western zodiac

The same LP pairs were tested across different Western sign seasons while keeping Eastern zodiac and SLP constant. The score difference between Scorpio–Scorpio (80%) and Scorpio–Aries (60%) was exactly 1.06 points across every LP pair tested. Western weight: **0.053 per 1%**.

### Phase 3: Isolate Eastern zodiac

A controlled experiment varied only the Eastern zodiac animal while holding LP (3↔3), SLP (9↔9), and Western (Scorpio→Scorpio) constant. The fit was perfectly linear (R² = 1.0000). The same slope held for LP 3↔5, confirming no LP×Eastern interaction. Eastern weight: **0.495 per 1%**.

### Phase 4: SLP pair matrix

Initial testing treated SLP as an independent per-person adjustment. This broke when both people had non-standard SLPs (e.g., SLP 1↔1 predicted −6.36 but actual was +1.85). Controlled experiments confirmed SLP is a **pair compatibility** with its own unique rules unrelated to the LP table. A complete 12×12 matrix (78 unique pairs) was built through systematic testing.

### Phase 5: LP calculation refinements

Testing revealed key rules: the Cue app uses a digit-sum method where month 11 and day 11/22 are preserved as master numbers in the sum. Day 28 is split normally. SLP=16 reduces to 7 rather than being kept as a master number. LP 33 has a pure vs 33/6 distinction based on whether the month and day are irreducible. LP 28 is always displayed as 28/1 regardless.

---

## Lookup Tables

### Table 1: Lifepath Compatibility (LP%)

Symmetric — LP 3↔8 = LP 8↔3. Tier: Friendly (F) ≥ 80, Neutral (N) 60–79, Enemy (E) < 60.

|  | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 28 | 33 |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **1** | 76 | 53 | 48 | 51 | 53 | 79 | 65 | 14 | 79 | 59 | 66 | 50 |
| **3** | 53 | 66 | 17 | 83 | 66 | 51 | 80 | 52 | 66 | 17 | 53 | 66 |
| **4** | 48 | 17 | 69 | 25 | 65 | 68 | 75 | 48 | 57 | 70 | 62 | 76 |
| **5** | 51 | 83 | 25 | 52 | 80 | 81 | 66 | 66 | 52 | 24 | 55 | 17 |
| **6** | 53 | 66 | 65 | 80 | 59 | 36 | 80 | 10 | 59 | 65 | 53 | 59 |
| **7** | 79 | 51 | 68 | 81 | 36 | 60 | 18 | 43 | 81 | 69 | 83 | 24 |
| **8** | 65 | 80 | 75 | 66 | 80 | 18 | 31 | 52 | 52 | 66 | 69 | 66 |
| **9** | 14 | 52 | 48 | 66 | 10 | 43 | 52 | 45 | 17 | 66 | 18 | 66 |
| **11** | 79 | 66 | 57 | 52 | 59 | 81 | 52 | 17 | 59 | 59 | 83 | 52 |
| **22** | 59 | 17 | 70 | 24 | 65 | 69 | 66 | 66 | 59 | 70 | 63 | 80 |
| **28** | 66 | 53 | 62 | 55 | 53 | 83 | 69 | 18 | 83 | 63 | 70 | 53 |
| **33** | 50 | 66 | 76 | 17 | 59 | 24 | 66 | 66 | 52 | 80 | 53 | 52 |

### Table 2: SLP Pair Compatibility

Complete 12×12 matrix (78 unique pairs). Values are score adjustments relative to SLP 9↔9 = 0.00. SLP 16 reduces to 7.

|  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 28 |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **1** | +1.85 | +0.49 | +0.13 | −1.10 | −4.28 | −4.81 | +2.08 | +0.49 | −2.60 | +3.31 | +1.37 | +3.92 |
| **2** | +0.49 | +0.87 | +1.72 | −1.10 | −1.10 | +3.93 | +2.08 | −1.10 | −3.22 | +0.75 | +0.76 | +3.92 |
| **3** | +0.13 | +1.72 | +2.38 | −3.18 | +3.93 | +2.38 | +0.79 | +0.75 | +0.95 | +2.34 | +0.75 | +0.79 |
| **4** | −1.10 | −1.10 | −3.18 | +2.38 | +1.73 | +3.97 | +0.79 | +3.31 | +2.44 | −6.65 | +0.75 | +0.79 |
| **5** | −4.28 | −1.10 | +3.93 | +1.73 | +0.87 | −3.22 | +1.73 | +1.73 | +2.35 | +0.75 | −2.42 | −1.81 |
| **6** | −4.81 | +3.93 | +2.38 | +3.97 | −3.22 | +0.79 | −2.39 | +2.34 | +2.22 | +0.75 | +2.34 | +0.79 |
| **7** | +2.08 | +2.08 | +0.79 | +0.79 | +1.73 | −2.39 | +1.59 | −5.69 | −2.39 | +3.93 | +2.34 | +0.79 |
| **8** | +0.49 | −1.10 | +0.75 | +3.31 | +1.73 | +2.34 | −5.69 | −2.31 | +0.76 | +0.76 | +3.94 | +0.14 |
| **9** | −2.60 | −3.22 | +0.95 | +2.44 | +2.35 | +2.22 | −2.39 | +0.76 | +0.00 | −3.22 | +0.75 | −3.02 |
| **11** | +3.31 | +0.75 | +2.34 | −6.65 | +0.75 | +0.75 | +3.93 | +0.76 | −3.22 | +1.66 | +1.55 | +4.25 |
| **22** | +1.37 | +0.76 | +0.75 | +0.75 | −2.42 | +2.34 | +2.34 | +3.94 | +0.75 | +1.55 | +1.55 | +0.75 |
| **28** | +3.92 | +3.92 | +0.79 | +0.79 | −1.81 | +0.79 | +0.79 | +0.14 | −3.02 | +4.25 | +0.75 | +2.38 |

**Notable patterns:**
- Self-matches are generally positive (+0.87 to +2.38), except **8↔8 = −2.31**
- Highest boost: **11↔28 = +4.25**
- Deepest penalties: **4↔11 = −6.65**, **7↔8 = −5.69**
- Range: −6.65 to +4.25

### Table 3: Eastern Zodiac Compatibility

Read as Person 1's row → Person 2's column.

|  | Rat | Ox | Tiger | Cat | Dragon | Snake | Horse | Goat | Monkey | Rooster | Dog | Pig |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **Rat** | 70 | 105 | 60 | 50 | 80 | 70 | 10 | 60 | 80 | 60 | 60 | 60 |
| **Ox** | 105 | 70 | 60 | 60 | 60 | 80 | 60 | 10 | 60 | 80 | 60 | 60 |
| **Tiger** | 60 | 60 | 100 | 70 | 60 | 60 | 80 | 60 | 10 | 60 | 80 | 80 |
| **Cat** | 50 | 60 | 70 | 100 | 70 | 70 | 60 | 80 | 60 | 10 | 70 | 80 |
| **Dragon** | 80 | 60 | 60 | 70 | 80 | 80 | 60 | 50 | 100 | 60 | 10 | 60 |
| **Snake** | 70 | 80 | 60 | 70 | 80 | 80 | 70 | 70 | 60 | 100 | 70 | 10 |
| **Horse** | 10 | 60 | 80 | 60 | 60 | 70 | 80 | 100 | 60 | 60 | 100 | 60 |
| **Goat** | 60 | 10 | 60 | 80 | 50 | 70 | 100 | 80 | 60 | 60 | 60 | 100 |
| **Monkey** | 80 | 60 | 10 | 60 | 100 | 60 | 60 | 60 | 80 | 60 | 60 | 60 |
| **Rooster** | 60 | 80 | 60 | 10 | 60 | 100 | 60 | 60 | 60 | 80 | 60 | 60 |
| **Dog** | 60 | 60 | 80 | 70 | 10 | 70 | 100 | 60 | 60 | 60 | 80 | 60 |
| **Pig** | 60 | 60 | 80 | 80 | 60 | 10 | 60 | 100 | 60 | 60 | 100 | 80 |

Rat↔Ox = 105 (confirmed, exceeds 100).

### Table 4: Western Zodiac Compatibility

Read as Person 1's row → Person 2's column.

|  | Ari | Tau | Gem | Can | Leo | Vir | Lib | Sco | Sag | Cap | Aqu | Pis |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **Ari** | 80 | 60 | 80 | 60 | 100 | 60 | 10 | 60 | 100 | 60 | 80 | 60 |
| **Tau** | 60 | 80 | 60 | 60 | 60 | 100 | 60 | 10 | 60 | 100 | 60 | 80 |
| **Gem** | 80 | 60 | 80 | 60 | 80 | 60 | 100 | 60 | 10 | 60 | 100 | 60 |
| **Can** | 60 | 60 | 60 | 80 | 60 | 60 | 60 | 100 | 60 | 10 | 60 | 100 |
| **Leo** | 100 | 60 | 80 | 60 | 80 | 60 | 60 | 60 | 100 | 60 | 10 | 60 |
| **Vir** | 60 | 100 | 60 | 60 | 60 | 80 | 60 | 60 | 60 | 100 | 60 | 10 |
| **Lib** | 10 | 60 | 100 | 60 | 60 | 60 | 80 | 60 | 100 | 60 | 100 | 60 |
| **Sco** | 60 | 10 | 60 | 100 | 60 | 60 | 60 | 80 | 60 | 100 | 60 | 100 |
| **Sag** | 100 | 60 | 10 | 60 | 100 | 60 | 100 | 60 | 80 | 80 | 80 | 60 |
| **Cap** | 60 | 100 | 60 | 10 | 60 | 100 | 60 | 100 | 80 | 80 | 80 | 80 |
| **Aqu** | 80 | 60 | 100 | 60 | 10 | 60 | 100 | 60 | 80 | 80 | 80 | 60 |
| **Pis** | 60 | 80 | 60 | 100 | 60 | 10 | 60 | 100 | 60 | 80 | 60 | 80 |

---

## Worked Example

**Person 1:** 11/23/1993
- LP: 11 + 2 + 3 + 1 + 9 + 9 + 3 = 38 → 3 + 8 = 11. LP = **11**, display: **11/38**
- SLP: Day 23 → 2+3 = **5**
- Eastern: 1993 (after lunar NY Jan 23) → **Rooster**
- Western: Nov 23 → **Sagittarius**

**Person 2:** 05/22/1983
- LP: 5 + 22 + 1 + 9 + 8 + 3 = 48 → 4 + 8 = 12 → 1 + 2 = 3. LP = **3**, display: **3/48**
- SLP: Day 22 → stays **22**
- Eastern: 1983 (after lunar NY Feb 13) → **Pig**
- Western: May 22 → **Gemini**

**Lookups:**
- LP%: 11↔3 = **66**
- East%: Rooster→Pig = **60**
- West%: Sagittarius→Gemini = **10**
- SLP pair: 5↔22 = **−2.42**

**Calculation:**
```
Score = 0.618×66 + 0.495×60 + 0.053×10 − 12.81 + (−2.42)
     = 40.79 + 29.70 + 0.53 − 12.81 − 2.42
     = 55.79
```

**Predicted: 55.8%** — Actual from Cue app: **55.81%** — Error: 0.02

---

## LP Calculation Reference (Algorithm Summary)

```
function calc_lp(month, day, year):
    raw = 0

    if month == 11:
        raw += 11                          # master, keep
    else:
        raw += sum of digits of month      # split (e.g., 10 → 1+0, 12 → 1+2)

    if day == 11 or day == 22:
        raw += day                         # master, keep
    else:
        raw += sum of digits of day        # split (e.g., 28 → 2+8, 25 → 2+5)

    raw += sum of digits of year           # always split

    intermediary = raw
    lp = reduce(raw)                       # reduce to single digit, stopping at 11, 22, 28, 33

    # Display logic
    if lp == 28:
        display = "28/1"                   # always 28/1
    elif lp == 33:
        pure = (month <= 9) and (day <= 9)   # both must be single-digit, no masters
        if pure:
            display = "33"                 # pure master
        else:
            display = "33/6"              # any multi-digit month/day → oscillates between 33 and 6
    else:
        display = f"{lp}/{intermediary}"   # standard format
```

---

## Revision History

| Date | Change |
| ---- | ------ |
| Phase 1 | LP matrix (120 measurements), formula coefficients derived |
| Phase 2 | Western weight confirmed at 0.053 per 1% |
| Phase 3 | Eastern weight confirmed at 0.495 per 1% (R²=1.0) |
| Phase 4 | SLP discovered to be pair compatibility, not independent |
| Update | LP↔22 corrected (5 values), LP 33↔7 corrected (37→24) |
| Update | Rat↔Ox = 105% confirmed via LP 33↔7 isolation |
| Update | SLP 16 reduces to 7 |
| Final | Complete 12×12 SLP matrix (78 pairs), SLP=22 row added |
| v2 | LP calculation updated: digit-sum method with month 11 and day 11/22 kept as masters; intermediary number tracked; display format LP/intermediary; 28 always shown as 28/1; pure 33 vs 33/6 distinction based on month/day reducibility |
| Current | All predictions within ±5 of Cue app scores |
