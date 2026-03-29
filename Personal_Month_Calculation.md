# Personal Month Calculation

## Overview

The **Personal Month** tells you the numerological energy governing a specific month within your Personal Year cycle. Unlike a calendar month, your personal month begins on your **birthday date** each month and runs until the day before that date the following month.

---

## Step-by-Step Rules

### Step 1 — Find Your Personal Year

Your Personal Year is calculated from your birth month, birth day, and the current calendar year (or the previous year if your birthday hasn't occurred yet this year).

**Formula:**
```
Personal Year = reduce(birth_month_value + birth_day + digit_sum(relevant_year))
```

- If birth month is 11, keep it as 11 (master number)
- If the reduced result is 2, raise it to 11
- Master numbers 11, 22, 33 are preserved and not reduced further

**Example (birthday Nov 9, today March 28 2026):**
- Last birthday was Nov 9, 2025 → relevant year = 2025
- 11 + 9 + (2+0+2+5) = 11 + 9 + 9 = 29
- 29 → 2+9 = 11 (master number, keep)
- **Personal Year = 11**

---

### Step 2 — Determine the Effective Month

The effective month is the calendar month your current personal month cycle started in.

**Rule:**
```
if today's day >= birth day:
    effective_month = current calendar month
else:
    effective_month = current calendar month - 1  (roll back to December if result is 0)
```

**Example:**
- Today is March 28, birth day is 9
- 28 >= 9 → effective month = March = **3**

---

### Step 3 — Calculate the Personal Month

```
sum = Personal Year + effective_month_number
Personal Month = reduce(sum)
```

- Reduce by summing digits repeatedly until single digit
- Exception: if sum equals 11, 22, or 33 → keep as master number

**Example:**
- Personal Year (11) + effective month (3) = 14
- 14 → 1+4 = 5
- **Personal Month = 5**

---

### Step 4 — Determine the Period Dates

Your personal month runs from your birth day in the effective month until the day before your birth day in the following month.

```
Start date: effective_month / birth_day
End date:   (effective_month + 1) / (birth_day - 1)
```

Edge case: if birth_day = 1, the end date is the last day of the effective month.

**Example:**
- Birth day = 9, effective month = March
- Start: **March 9**
- End: **April 8**

---

## Pseudocode

```
function calcPersonalMonth(birthMonth, birthDay):
    today = getCurrentDate()

    // Step 1: Personal Year
    if today.month > birthMonth OR (today.month == birthMonth AND today.day >= birthDay):
        relevantYear = today.year
    else:
        relevantYear = today.year - 1

    mVal = (birthMonth == 11) ? 11 : birthMonth
    raw = mVal + birthDay + digitSum(relevantYear)
    py = reduce(raw)  // keep 11, 22, 33; raise 2 → 11

    // Step 2: Effective month
    if today.day >= birthDay:
        effectiveMonth = today.month
    else:
        effectiveMonth = today.month - 1
        if effectiveMonth == 0:
            effectiveMonth = 12

    // Step 3: Personal Month
    sum = py + effectiveMonth
    pm = reduce(sum)  // keep 11, 22, 33

    // Step 4: Period dates
    startMonth = effectiveMonth
    startDay   = birthDay
    endMonth   = (effectiveMonth % 12) + 1
    endDay     = (birthDay > 1) ? birthDay - 1 : lastDayOf(effectiveMonth)

    return { pm, startMonth, startDay, endMonth, endDay }
```

---

## Verification Example

| Field            | Value                        |
|------------------|------------------------------|
| Birthday         | November 9                   |
| Today            | March 28, 2026               |
| Relevant Year    | 2025                         |
| Personal Year    | 11 (from 29)                 |
| Birth Day        | 9                            |
| Today's Day      | 28 ≥ 9 → effective month = 3 |
| Sum              | 11 + 3 = 14                  |
| Personal Month   | **5** (14 → 1+4 = 5)        |
| Period           | March 9 – April 8            |
