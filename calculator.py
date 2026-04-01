import datetime

def calculate_profile(date_str):
    """
    Calculates the P (Lifepath), S (Day of Month), Chinese Zodiac, and Western Zodiac
    for a given Date of Birth (YYYY-MM-DD).
    """
    try:
        dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return "Invalid date format. Please use YYYY-MM-DD."

    year_num = dt.year
    month_num = dt.month
    day_num = dt.day

    # 1. S (Born Day) - This is simply the exact day of the month they were born.
    s_val = str(day_num)

    # 2. Western Zodiac
    western = "Capricorn"
    if month_num == 1 and day_num <= 19: western = "Capricorn"
    elif month_num == 1 or (month_num == 2 and day_num <= 18): western = "Aquarius"
    elif month_num == 2 or (month_num == 3 and day_num <= 20): western = "Pisces"
    elif month_num == 3 or (month_num == 4 and day_num <= 19): western = "Aries"
    elif month_num == 4 or (month_num == 5 and day_num <= 20): western = "Taurus"
    elif month_num == 5 or (month_num == 6 and day_num <= 20): western = "Gemini"
    elif month_num == 6 or (month_num == 7 and day_num <= 22): western = "Cancer"
    elif month_num == 7 or (month_num == 8 and day_num <= 22): western = "Leo"
    elif month_num == 8 or (month_num == 9 and day_num <= 22): western = "Virgo"
    elif month_num == 9 or (month_num == 10 and day_num <= 22): western = "Libra"
    elif month_num == 10 or (month_num == 11 and day_num <= 21): western = "Scorpio"
    elif month_num == 11 or (month_num == 12 and day_num <= 21): western = "Sagittarius"
    else: western = "Capricorn"

    # 3. Chinese Zodiac (simplified to basic year modulo, apps often use this)
    # *Note: real Chinese astrology shifts in late Jan / early Feb, 
    # so January birthdays usually belong to the previous year.
    animals = ["Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox", "Tiger", "Cat", "Dragon", "Snake", "Horse", "Goat"]
    
    calc_year = year_num
    # Basic correction for Jan/Feb birthdays to match the previous zodiac year
    if month_num == 1 or (month_num == 2 and day_num < 4):
        calc_year -= 1
        
    chinese = animals[calc_year % 12]

    # 4. Numerology Lifepath (P)
    def reduce_num(n):
        while n > 9 and n not in (11, 22, 33):
            n = sum(int(digit) for digit in str(n))
        return n

    # Reduce Month, Day, Year independently, then sum and reduce again
    m = reduce_num(month_num)
    d = reduce_num(day_num)
    y = reduce_num(year_num)
    
    lifepath = reduce_num(m + d + y)

    filename = f"P{lifepath}_S{s_val}_{chinese}_{western}.csv"
    return filename

if __name__ == "__main__":
    print("🔮 ASTROLOGY Reverse Engineer Calculator 🔮")
    print("Test with July 3, 1965 (Expected: P4_S3_Snake_Cancer.csv):")
    print("Result:", calculate_profile("1965-07-03"))
    print("-" * 40)
    
    while True:
        user_input = input("Enter a birthdate (YYYY-MM-DD) or 'q' to quit: ")
        if user_input.lower() == 'q':
            break
        print("Filename ->", calculate_profile(user_input))
