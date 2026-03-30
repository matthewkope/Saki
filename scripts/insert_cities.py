#!/usr/bin/env python3
"""
Insert top 100 US cities into the Supabase locations table.
- Founding dates from hardcoded data (most reliable source)
- Photos from Wikimedia Commons
- 1-2 sentence descriptions
- Numerology fields calculated from founding date

Usage:
  python3 scripts/insert_cities.py --service-key YOUR_SUPABASE_SERVICE_ROLE_KEY
"""

import argparse
import json
import time
import urllib.request
import urllib.parse

# ─── CONFIG ──────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://nzrjwaebzgmmdihzbjqb.supabase.co"
USER_AGENT = "SakiApp/1.0 (educational project; contact via github)"

# ─── NUMEROLOGY ──────────────────────────────────────────────────────────────
ANIMALS_ORDER = ['Rat','Ox','Tiger','Cat','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig']

def animal_for_year(y):
    return ANIMALS_ORDER[((y - 2020) % 12 + 12) % 12]

def western_sign(m, d):
    if (m == 3 and d >= 21) or (m == 4 and d <= 19): return 'Aries'
    if (m == 4 and d >= 20) or (m == 5 and d <= 20): return 'Taurus'
    if (m == 5 and d >= 21) or (m == 6 and d <= 20): return 'Gemini'
    if (m == 6 and d >= 21) or (m == 7 and d <= 22): return 'Cancer'
    if (m == 7 and d >= 23) or (m == 8 and d <= 22): return 'Leo'
    if (m == 8 and d >= 23) or (m == 9 and d <= 22): return 'Virgo'
    if (m == 9 and d >= 23) or (m == 10 and d <= 22): return 'Libra'
    if (m == 10 and d >= 23) or (m == 11 and d <= 21): return 'Scorpio'
    if (m == 11 and d >= 22) or (m == 12 and d <= 21): return 'Sagittarius'
    if (m == 12 and d >= 22) or (m == 1 and d <= 19): return 'Capricorn'
    if (m == 1 and d >= 20) or (m == 2 and d <= 18): return 'Aquarius'
    return 'Pisces'

def digit_sum(n):
    return sum(int(c) for c in str(n))

def reduce_lp(n):
    MASTERS = {11, 22, 33}
    while n > 9 and n not in MASTERS:
        n = digit_sum(n)
    if n == 2:
        n = 11
    return n

def calc_lp(m, d, y):
    raw = m + d + sum(int(c) for c in str(y))
    lp = reduce_lp(raw)
    # Secondary (just reduce the day)
    slp = reduce_lp(d)
    intermediary = raw if raw != lp else None
    if intermediary:
        display = f"{intermediary}/{lp}"
    else:
        display = str(lp)
    return lp, display

# ─── TOP 100 US CITIES ───────────────────────────────────────────────────────
# (name, state/region, founded_month, founded_day, founded_year, wiki_search_term, description)
CITIES = [
    ("New York City", "New York", 1, 1, 1898, "New York City skyline", "New York City is the most populous city in the United States, a global hub for finance, culture, and commerce. Its iconic skyline and five boroughs make it one of the most recognizable cities in the world."),
    ("Los Angeles", "California", 9, 4, 1781, "Los Angeles skyline", "Los Angeles is the entertainment capital of the world, home to Hollywood and a sprawling metropolis along the Southern California coast. It is the second most populous city in the United States."),
    ("Chicago", "Illinois", 8, 12, 1833, "Chicago skyline", "Chicago is a world-class city on the southwestern shore of Lake Michigan, renowned for its bold architecture and deep-dish pizza. It is the third most populous city in the United States."),
    ("Houston", "Texas", 8, 30, 1836, "Houston Texas skyline", "Houston is the largest city in Texas and a global center for the energy industry and space exploration, home to NASA's Johnson Space Center. It is one of the most ethnically diverse major cities in the United States."),
    ("Phoenix", "Arizona", 2, 25, 1881, "Phoenix Arizona skyline", "Phoenix is the capital and largest city of Arizona, known for its desert landscape and year-round sunshine. It is the fifth most populous city in the United States and one of the fastest-growing."),
    ("Philadelphia", "Pennsylvania", 10, 27, 1682, "Philadelphia skyline", "Philadelphia is one of America's oldest cities, founded by William Penn in 1682 and home to the Liberty Bell and Independence Hall. It served as the nation's capital during much of the Revolutionary War era."),
    ("San Antonio", "Texas", 5, 1, 1718, "San Antonio Texas", "San Antonio is a vibrant Texas city famous for the Alamo and the iconic River Walk lined with shops and restaurants. It is the second largest city in Texas and one of the fastest-growing in the nation."),
    ("San Diego", "California", 5, 16, 1769, "San Diego skyline", "San Diego is a coastal California city celebrated for its near-perfect weather, beautiful beaches, and the world-famous San Diego Zoo. It is a major hub for the U.S. Navy and defense industries."),
    ("Dallas", "Texas", 2, 2, 1856, "Dallas Texas skyline", "Dallas is a major city in northern Texas and a leading financial and corporate hub, home to numerous Fortune 500 companies. It is part of the Dallas–Fort Worth metroplex, one of the largest urban areas in the country."),
    ("Jacksonville", "Florida", 2, 9, 1832, "Jacksonville Florida skyline", "Jacksonville is the largest city by area in the contiguous United States, situated along the St. Johns River in northeast Florida. It serves as a major military and logistics hub for the Southeast."),
    ("Austin", "Texas", 12, 27, 1839, "Austin Texas skyline", "Austin is the capital of Texas and a booming tech hub nicknamed 'Silicon Hills,' famous for its live music scene and South by Southwest festival. It is one of the fastest-growing large cities in the United States."),
    ("Fort Worth", "Texas", 6, 6, 1849, "Fort Worth Texas", "Fort Worth is a vibrant Texas city with deep cowboy roots, home to the famous Fort Worth Stockyards and a thriving arts district. It forms the western anchor of the Dallas–Fort Worth metroplex."),
    ("Columbus", "Ohio", 2, 14, 1812, "Columbus Ohio skyline", "Columbus is the capital and largest city of Ohio, a major Midwestern hub for education, finance, and technology anchored by Ohio State University. It consistently ranks as one of the most livable and fastest-growing cities in the Midwest."),
    ("Charlotte", "North Carolina", 2, 7, 1768, "Charlotte North Carolina skyline", "Charlotte is the largest city in North Carolina and a major banking center, home to the headquarters of Bank of America and Wells Fargo's East Coast operations. Its rapid growth has made it one of the most populous cities in the Southeast."),
    ("Indianapolis", "Indiana", 1, 6, 1821, "Indianapolis Indiana skyline", "Indianapolis is the capital of Indiana and the 'Racing Capital of the World,' hosting the iconic Indianapolis 500 each May. It is a major convention and sports city in the heart of the Midwest."),
    ("San Francisco", "California", 6, 29, 1776, "San Francisco skyline", "San Francisco is a hilly city on the tip of a peninsula in Northern California, world-famous for the Golden Gate Bridge and its role as the heart of the global tech industry. Its compact geography and Victorian architecture give it one of the most distinctive skylines in America."),
    ("Seattle", "Washington", 11, 13, 1851, "Seattle Washington skyline", "Seattle is a Pacific Northwest city nestled between Puget Sound and the Cascade Mountains, home to Amazon, Microsoft, and Boeing. It is celebrated for its coffee culture, thriving music scene, and natural beauty."),
    ("Denver", "Colorado", 11, 22, 1858, "Denver Colorado skyline", "Denver is the capital of Colorado and the gateway to the Rocky Mountains, one of the sunniest major cities in the United States. It is a rapidly growing hub for technology, aerospace, and outdoor recreation."),
    ("Nashville", "Tennessee", 12, 25, 1779, "Nashville Tennessee skyline", "Nashville is the capital of Tennessee and the undisputed country music capital of the world, home to the Grand Ole Opry and Music Row. It has emerged as one of the fastest-growing and most visited cities in the South."),
    ("Oklahoma City", "Oklahoma", 4, 22, 1889, "Oklahoma City skyline", "Oklahoma City is the capital of Oklahoma and a major center for the energy industry, established in a single day during the Land Run of 1889. It is known for its Western heritage and the Oklahoma City National Memorial."),
    ("El Paso", "Texas", 12, 16, 1850, "El Paso Texas", "El Paso sits on the western tip of Texas along the Rio Grande, forming a unique binational community with Ciudad Juárez, Mexico. It is one of the safest large cities in the United States and has a rich Southwestern and Hispanic cultural heritage."),
    ("Washington", "District of Columbia", 7, 16, 1790, "Washington DC skyline", "Washington, D.C. is the capital of the United States, home to the White House, the Capitol, and the National Mall. It is a global center of politics, diplomacy, and history."),
    ("Las Vegas", "Nevada", 5, 15, 1905, "Las Vegas Strip", "Las Vegas is the entertainment capital of Nevada, globally renowned for its dazzling casino resorts, nightlife, and shows on the famous Strip. What began as a desert railroad town is now one of the most visited cities in the world."),
    ("Louisville", "Kentucky", 5, 1, 1780, "Louisville Kentucky skyline", "Louisville is Kentucky's largest city, situated on the Ohio River and famous worldwide for the Kentucky Derby held at Churchill Downs each May. It is also the bourbon capital of the world, with a thriving whiskey and culinary scene."),
    ("Memphis", "Tennessee", 10, 22, 1819, "Memphis Tennessee skyline", "Memphis is a Mississippi River city in Tennessee, the birthplace of blues and rock-and-roll and home to Graceland, Elvis Presley's iconic estate. It is also a major logistics hub and the second-largest city in Tennessee."),
    ("Portland", "Oregon", 2, 8, 1851, "Portland Oregon skyline", "Portland is the largest city in Oregon, celebrated for its progressive culture, craft beer scene, and stunning natural surroundings including Mount Hood. It consistently ranks among the most environmentally conscious and walkable cities in the United States."),
    ("Baltimore", "Maryland", 8, 8, 1729, "Baltimore Maryland skyline", "Baltimore is a major Mid-Atlantic port city on the Chesapeake Bay in Maryland, known for its historic Inner Harbor and as the birthplace of Francis Scott Key's 'The Star-Spangled Banner.' It has a rich maritime heritage and vibrant neighborhoods."),
    ("Milwaukee", "Wisconsin", 1, 31, 1846, "Milwaukee Wisconsin skyline", "Milwaukee is Wisconsin's largest city, situated on the western shore of Lake Michigan and famously known as the beer capital of America. It is home to world-class art museums and a thriving manufacturing and technology sector."),
    ("Albuquerque", "New Mexico", 4, 23, 1706, "Albuquerque New Mexico", "Albuquerque is the largest city in New Mexico, nestled in the Rio Grande valley beneath the Sandia Mountains with a rich Native American and Spanish colonial heritage. It hosts the world's largest hot air balloon festival each October."),
    ("Tucson", "Arizona", 8, 20, 1775, "Tucson Arizona", "Tucson is a sun-drenched city in southern Arizona surrounded by five mountain ranges and the iconic saguaro cacti of the Sonoran Desert. It is home to the University of Arizona and a thriving arts and culinary scene."),
    ("Fresno", "California", 10, 13, 1885, "Fresno California", "Fresno is the agricultural heart of California's San Joaquin Valley, one of the most productive farming regions on Earth. It serves as the economic and cultural hub of California's Central Valley."),
    ("Sacramento", "California", 2, 27, 1850, "Sacramento California skyline", "Sacramento is the capital of California, located at the confluence of the Sacramento and American rivers in the heart of the Central Valley. It was a key hub during the California Gold Rush and is now a major government and farm-to-fork culinary destination."),
    ("Mesa", "Arizona", 7, 17, 1883, "Mesa Arizona", "Mesa is the third-largest city in Arizona and part of the greater Phoenix metropolitan area, known for its warm desert climate and outdoor recreation. It is home to a thriving aerospace and technology sector."),
    ("Kansas City", "Missouri", 6, 1, 1850, "Kansas City Missouri skyline", "Kansas City straddles the Missouri–Kansas border and is famous worldwide for its barbecue, jazz heritage, and stunning fountains—earning it the nickname 'City of Fountains.' It is a major crossroads for commerce and culture in the American heartland."),
    ("Atlanta", "Georgia", 12, 29, 1847, "Atlanta Georgia skyline", "Atlanta is the capital of Georgia and the economic powerhouse of the Southeast, home to Coca-Cola, CNN, Delta Air Lines, and the world's busiest airport. It played a pivotal role in the Civil Rights Movement and is the birthplace of Dr. Martin Luther King Jr."),
    ("Omaha", "Nebraska", 3, 2, 1854, "Omaha Nebraska skyline", "Omaha is Nebraska's largest city on the Missouri River, the headquarters of Berkshire Hathaway and a rising tech and startup hub. It is known for its vibrant Old Market district, world-class zoo, and strong Midwestern culture."),
    ("Colorado Springs", "Colorado", 7, 31, 1871, "Colorado Springs Colorado", "Colorado Springs is a city at the foot of Pikes Peak in Colorado, home to the United States Air Force Academy and numerous military installations. It is celebrated for its dramatic mountain scenery and outdoor adventure opportunities."),
    ("Raleigh", "North Carolina", 11, 18, 1792, "Raleigh North Carolina skyline", "Raleigh is the capital of North Carolina and part of the Research Triangle, a globally recognized innovation hub anchored by Duke University, NC State, and UNC-Chapel Hill. It is one of the fastest-growing and most educated cities in the Southeast."),
    ("Long Beach", "California", 2, 10, 1897, "Long Beach California skyline", "Long Beach is a major port city in Southern California operating one of the busiest container ports in the world. It has a vibrant waterfront, diverse neighborhoods, and is home to the legendary Queen Mary ocean liner."),
    ("Virginia Beach", "Virginia", 1, 1, 1952, "Virginia Beach Virginia", "Virginia Beach is the most populous city in Virginia, renowned for its long Atlantic Ocean shoreline and thriving resort strip. It is home to one of the largest military concentrations in the world, including Naval Station Norfolk nearby."),
    ("Minneapolis", "Minnesota", 3, 13, 1867, "Minneapolis Minnesota skyline", "Minneapolis is the largest city in Minnesota and part of the Twin Cities metro with Saint Paul, known for its cultural vibrancy, extensive park system, and progressive politics. It sits along the Mississippi River and is a major hub for healthcare, finance, and the arts."),
    ("Tampa", "Florida", 12, 15, 1855, "Tampa Florida skyline", "Tampa is a sun-soaked city on Florida's Gulf Coast, home to Busch Gardens, Ybor City's historic Cuban heritage, and a booming technology and finance sector. It consistently ranks among the fastest-growing large cities in the United States."),
    ("Tulsa", "Oklahoma", 1, 18, 1898, "Tulsa Oklahoma skyline", "Tulsa is Oklahoma's second-largest city, once known as the 'Oil Capital of the World' with a stunning collection of Art Deco architecture downtown. The historic Greenwood District was home to the prosperous Black community known as 'Black Wall Street.'"),
    ("Arlington", "Texas", 1, 20, 1876, "Arlington Texas", "Arlington is a major city in the Dallas–Fort Worth metroplex, home to AT&T Stadium where the Dallas Cowboys play and Globe Life Field where the Texas Rangers compete. It is one of the largest cities in the United States without a public transit system."),
    ("New Orleans", "Louisiana", 5, 7, 1718, "New Orleans Louisiana French Quarter", "New Orleans is one of America's most distinctive cities, celebrated for its Creole cuisine, Mardi Gras festivities, and the vibrant jazz music that was born on its streets. Its French Quarter is one of the oldest urban neighborhoods in the country."),
    ("Wichita", "Kansas", 7, 21, 1868, "Wichita Kansas skyline", "Wichita is the largest city in Kansas and the 'Air Capital of the World,' home to major aircraft manufacturers including Cessna, Beechcraft, and Spirit AeroSystems. It has a rich Western heritage as a major cattle-drive hub in the 1870s."),
    ("Bakersfield", "California", 1, 16, 1873, "Bakersfield California", "Bakersfield is a major city in California's Central Valley, a leading producer of oil and natural gas as well as one of the top agricultural counties in the nation. It is also the birthplace of the Bakersfield Sound, a distinctly twangy style of country music."),
    ("Aurora", "Colorado", 2, 28, 1891, "Aurora Colorado", "Aurora is the third-largest city in Colorado and part of the Denver metropolitan area, known for its diverse population and proximity to Rocky Mountain National Park. It is home to a major Veterans Affairs medical center and several military installations."),
    ("Anaheim", "California", 3, 18, 1876, "Anaheim California Disneyland", "Anaheim is a city in Orange County, California, most famous worldwide as the home of Disneyland Resort. It is also home to Angel Stadium and the Honda Center, making it a major sports and entertainment destination."),
    ("Santa Ana", "California", 2, 5, 1886, "Santa Ana California", "Santa Ana is the county seat of Orange County, California, one of the most densely populated cities in the western United States with a vibrant Latino cultural identity. Its historic downtown features museums, galleries, and a thriving arts scene."),
    ("Corpus Christi", "Texas", 7, 25, 1852, "Corpus Christi Texas waterfront", "Corpus Christi is a coastal Texas city on the Gulf of Mexico, celebrated for its beaches, seafood, and windsurfing—earning the nickname 'Sparkling City by the Sea.' It is home to a major naval air station and one of the largest ports in the country."),
    ("Riverside", "California", 10, 11, 1883, "Riverside California", "Riverside is a city in Southern California's Inland Empire, the birthplace of the California citrus industry and home to the historic Mission Inn. It is home to the University of California, Riverside and a growing tech and logistics sector."),
    ("Lexington", "Kentucky", 6, 1, 1782, "Lexington Kentucky horse farm", "Lexington is the heart of Kentucky's horse country, surrounded by some of the most celebrated Thoroughbred horse farms in the world. Known as the 'Horse Capital of the World,' it is also home to the University of Kentucky."),
    ("St. Louis", "Missouri", 2, 14, 1764, "St. Louis Missouri Gateway Arch", "St. Louis is a historic Mississippi River city in Missouri, crowned by the iconic Gateway Arch—a monument to America's westward expansion. It was once the fourth-largest city in the nation and remains a major center for healthcare, education, and aerospace."),
    ("Pittsburgh", "Pennsylvania", 8, 6, 1758, "Pittsburgh Pennsylvania skyline", "Pittsburgh is a former steel city in western Pennsylvania where the Allegheny and Monongahela rivers meet to form the Ohio, now transformed into a hub for technology, healthcare, and higher education. Its dramatic skyline of bridges and hills makes it one of the most visually stunning cities in America."),
    ("Anchorage", "Alaska", 11, 23, 1920, "Anchorage Alaska skyline mountains", "Anchorage is the largest city in Alaska, home to nearly half the state's population and a gateway to some of the most spectacular wilderness on Earth. It is a key hub for Arctic aviation and international cargo traffic between Asia and North America."),
    ("Stockton", "California", 8, 27, 1850, "Stockton California", "Stockton is a port city in California's Central Valley on the San Joaquin River, one of the few inland ports in California and a major agricultural distribution hub. It made history as the first U.S. city to pilot a universal basic income program."),
    ("Cincinnati", "Ohio", 1, 1, 1819, "Cincinnati Ohio skyline", "Cincinnati is a vibrant Ohio River city at the heart of the tristate area of Ohio, Kentucky, and Indiana, famous for its unique Cincinnati-style chili and thriving arts scene. It was one of the most important cities in America during the 19th century as a major center of commerce and culture."),
    ("St. Paul", "Minnesota", 3, 4, 1854, "Saint Paul Minnesota skyline", "Saint Paul is the capital of Minnesota and the quieter twin to Minneapolis, rich in Victorian architecture and a strong Irish and German cultural heritage. It sits along the Mississippi River and is home to the state government and major institutions."),
    ("Greensboro", "North Carolina", 1, 21, 1808, "Greensboro North Carolina", "Greensboro is a city in the Piedmont Triad region of North Carolina, historically significant as the site of pivotal 1960 lunch counter sit-ins that helped define the Civil Rights Movement. It is a hub for higher education, furniture manufacturing, and biotechnology."),
    ("Toledo", "Ohio", 1, 7, 1837, "Toledo Ohio skyline", "Toledo is a port city on the Maumee River at the western edge of Lake Erie in Ohio, historically known as the 'Glass City' for its dominant glass manufacturing industry. It serves as a major Great Lakes shipping hub and is home to a world-class art museum."),
    ("Newark", "New Jersey", 5, 4, 1666, "Newark New Jersey skyline", "Newark is New Jersey's largest city and one of the oldest major cities in the United States, serving as a key transportation hub connecting New York City to the rest of the country. It is home to a thriving arts district and the headquarters of several major corporations."),
    ("Plano", "Texas", 6, 16, 1873, "Plano Texas", "Plano is a prosperous suburban city north of Dallas, home to the U.S. headquarters of Toyota, JPMorgan Chase operations, and numerous Fortune 500 companies. It consistently ranks among the safest and wealthiest large cities in the United States."),
    ("Henderson", "Nevada", 4, 16, 1953, "Henderson Nevada", "Henderson is the second-largest city in Nevada and part of the Las Vegas metropolitan area, known for its master-planned communities, low crime rate, and rapidly growing population. It sits along the shores of Lake Mead, the largest reservoir in the United States."),
    ("Orlando", "Florida", 7, 31, 1875, "Orlando Florida skyline", "Orlando is the theme park capital of the world, home to Walt Disney World, Universal Studios, and SeaWorld, drawing tens of millions of visitors each year. Beyond tourism, it has become a rapidly growing hub for technology, healthcare, and the arts."),
    ("Chandler", "Arizona", 5, 17, 1912, "Chandler Arizona", "Chandler is a thriving city in the East Valley of metropolitan Phoenix, home to a major Intel semiconductor manufacturing campus and a booming technology sector. It blends modern suburban growth with a charming historic downtown."),
    ("Laredo", "Texas", 5, 15, 1755, "Laredo Texas Rio Grande", "Laredo is a Texas city on the Rio Grande directly across from Nuevo Laredo, Mexico, and is the largest inland port of entry in the United States. Its deeply rooted Mexican-American culture and border economy make it one of the most unique cities in Texas."),
    ("Madison", "Wisconsin", 3, 4, 1856, "Madison Wisconsin skyline", "Madison is the capital of Wisconsin and home to the flagship University of Wisconsin campus, consistently ranked among the best public universities in the world. Nestled between two beautiful lakes, it is celebrated for its progressive culture, thriving food scene, and high quality of life."),
    ("Durham", "North Carolina", 4, 10, 1869, "Durham North Carolina skyline", "Durham is a dynamic city in North Carolina's Research Triangle, transformed from a tobacco town into a hub for biotech, research, and culture centered around Duke University. It is renowned for its vibrant food and arts scenes and progressive community."),
    ("Lubbock", "Texas", 3, 16, 1890, "Lubbock Texas Texas Tech", "Lubbock is a west Texas city on the southern High Plains, home to Texas Tech University and the birthplace of rock-and-roll legend Buddy Holly. It is a major agricultural and educational hub serving the vast Llano Estacado region."),
    ("Winston-Salem", "North Carolina", 1, 1, 1913, "Winston-Salem North Carolina", "Winston-Salem is a city in the Piedmont Triad of North Carolina, historically known as a center of tobacco and textile manufacturing and now emerging as a hub for biotechnology and the arts. It is home to Wake Forest University and a vibrant arts community."),
    ("Garland", "Texas", 4, 22, 1891, "Garland Texas", "Garland is a large city in the Dallas–Fort Worth metroplex known for its diverse population and strong manufacturing base. It has one of the largest concentrations of manufacturing employers in the North Texas region."),
    ("Glendale", "Arizona", 10, 2, 1910, "Glendale Arizona", "Glendale is a city in the Phoenix metropolitan area, home to State Farm Stadium where the Arizona Cardinals play and Gila River Arena. It is a major destination for sports, entertainment, and annual events including the Fiesta Bowl."),
    ("Hialeah", "Florida", 7, 14, 1925, "Hialeah Florida", "Hialeah is a city in Miami-Dade County, Florida, with one of the highest concentrations of Cuban-Americans of any city in the United States. Its vibrant Latin culture, cuisine, and community make it one of the most culturally distinct cities in the country."),
    ("Reno", "Nevada", 5, 9, 1868, "Reno Nevada skyline", "Reno is Nevada's second-largest city, known as 'The Biggest Little City in the World,' once famous primarily for gambling and quickie divorces and now a booming tech hub anchored by Tesla's Gigafactory. It sits in the Sierra Nevada foothills with stunning outdoor recreation access."),
    ("Baton Rouge", "Louisiana", 9, 7, 1817, "Baton Rouge Louisiana Mississippi River", "Baton Rouge is the capital of Louisiana, a major petrochemical industry hub and home to Louisiana State University on the banks of the Mississippi River. It blends Southern culture with Creole traditions and a rich political history."),
    ("Irvine", "California", 12, 28, 1971, "Irvine California", "Irvine is a meticulously master-planned city in Orange County, California, consistently ranked among the safest and most livable cities in the United States. It is home to the University of California, Irvine and a major technology and life sciences cluster."),
    ("Chesapeake", "Virginia", 1, 1, 1963, "Chesapeake Virginia Great Dismal Swamp", "Chesapeake is a large independent city in Virginia bordering North Carolina, featuring the scenic Great Dismal Swamp National Wildlife Refuge within its boundaries. It is one of the most geographically large cities in the eastern United States."),
    ("Irving", "Texas", 1, 1, 1903, "Irving Texas Las Colinas", "Irving is a city in the Dallas–Fort Worth metroplex home to the upscale Las Colinas urban center and the headquarters of numerous major corporations including ExxonMobil and Celanese. It hosts Dallas/Fort Worth International Airport, one of the busiest airports in the world."),
    ("Scottsdale", "Arizona", 6, 25, 1951, "Scottsdale Arizona Old Town", "Scottsdale is a resort city in the Phoenix metropolitan area, celebrated for its upscale resorts, world-class golf courses, and vibrant arts scene centered in Old Town. It consistently ranks among the most desirable places to live and visit in the American Southwest."),
    ("North Las Vegas", "Nevada", 5, 1, 1946, "North Las Vegas Nevada", "North Las Vegas is an independent city within the Las Vegas Valley, home to major logistics and distribution centers including Amazon and a rapidly growing industrial sector. It is one of the fastest-growing cities in the United States."),
    ("Fremont", "California", 1, 23, 1956, "Fremont California", "Fremont is a city in the San Francisco Bay Area, home to Tesla's original vehicle manufacturing plant and a hub for high-tech industry. It is one of the most ethnically diverse cities in the United States."),
    ("Gilbert", "Arizona", 7, 6, 1920, "Gilbert Arizona", "Gilbert is a rapidly growing town in the Phoenix East Valley, one of the fastest-growing municipalities in American history—transforming from a small farming community into a large suburban city in just decades. It consistently ranks among the safest large cities in the country."),
    ("San Jose", "California", 11, 29, 1777, "San Jose California skyline", "San Jose is the capital of Silicon Valley and the largest city in Northern California, home to the global headquarters of tech giants including Adobe, Cisco, and eBay. Founded as a Spanish colonial settlement, it has evolved into the economic heart of the world's most innovative technology ecosystem."),
    ("Jersey City", "New Jersey", 2, 22, 1820, "Jersey City New Jersey skyline", "Jersey City is New Jersey's second-largest city, situated across the Hudson River from Lower Manhattan with stunning skyline views. It is one of the most diverse cities in the United States and a major financial services hub."),
    ("Chula Vista", "California", 1, 17, 1911, "Chula Vista California bayfront", "Chula Vista is the second-largest city in San Diego County, situated on San Diego Bay and adjacent to the U.S.–Mexico border. It is home to the U.S. Olympic and Paralympic Training Center, the only warm-weather, high-altitude training facility in the country."),
    ("Fort Wayne", "Indiana", 2, 22, 1829, "Fort Wayne Indiana", "Fort Wayne is the second-largest city in Indiana and a historic crossroads city at the confluence of three rivers, once a key outpost in early American westward expansion. Today it is a growing hub for defense manufacturing, healthcare, and financial services."),
    ("Buffalo", "New York", 4, 5, 1832, "Buffalo New York skyline Niagara", "Buffalo is a historic Lake Erie port city in western New York, gateway to Niagara Falls and home to one of the finest collections of early 20th-century architecture in the nation. It is experiencing a remarkable renaissance driven by investment in technology, medicine, and the arts."),
    ("St. Petersburg", "Florida", 2, 29, 1892, "St Petersburg Florida waterfront", "St. Petersburg is a sun-drenched Gulf Coast city in the Tampa Bay area, home to the Salvador Dalí Museum and one of the most vibrant arts districts in the Southeast. It holds the U.S. record for the most consecutive days of sunshine."),
    ("Laredo", "Texas", 5, 15, 1755, "Laredo Texas border", "Laredo is Texas's gateway to Mexico on the Rio Grande, the largest U.S.–Mexico inland port of entry handling hundreds of billions in annual trade. Its culture, cuisine, and character are deeply shaped by its unique binational identity."),
    ("Richmond", "Virginia", 8, 1, 1742, "Richmond Virginia skyline", "Richmond is the capital of Virginia, a city steeped in American history as the former capital of the Confederacy and a vital center of the Civil Rights Movement. Today it is a thriving destination for craft beer, arts, and outdoor recreation along the James River."),
    ("Spokane", "Washington", 11, 29, 1881, "Spokane Washington skyline", "Spokane is the largest city in eastern Washington and the hub of the Inland Northwest, a region of spectacular natural beauty including the nearby Spokane River and Cascade Mountains. It hosted the 1974 World's Fair with an environmental theme, leaving a stunning Riverfront Park as its legacy."),
    ("Des Moines", "Iowa", 5, 1, 1851, "Des Moines Iowa skyline", "Des Moines is the capital of Iowa and a major insurance and financial services hub, consistently ranked among the best cities for business and careers in the Midwest. It hosts the Iowa State Fair, one of the largest and most celebrated state fairs in the nation."),
    ("Tacoma", "Washington", 11, 12, 1875, "Tacoma Washington Museum of Glass", "Tacoma is a port city on Puget Sound in Washington state, home to the stunning Museum of Glass and a dramatically transformed waterfront that has driven a cultural renaissance. It sits in the shadow of Mount Rainier and offers spectacular views of the Cascade Range."),
    ("Boise", "Idaho", 12, 7, 1863, "Boise Idaho skyline foothills", "Boise is the capital and largest city of Idaho, one of the fastest-growing cities in the United States, attracting tech companies, outdoor enthusiasts, and Californians seeking a lower cost of living. The foothills bordering the city offer world-class hiking, mountain biking, and skiing within minutes of downtown."),
    ("Modesto", "California", 10, 9, 1884, "Modesto California", "Modesto is a Central Valley city in California and the birthplace of filmmaker George Lucas, famous as the inspiration for his film 'American Graffiti.' It is a major agricultural hub and distribution center in one of the world's most productive farming regions."),
    ("Fontana", "California", 6, 25, 1952, "Fontana California Inland Empire", "Fontana is a city in California's Inland Empire, home to the famous Auto Club Speedway NASCAR track and a major hub for logistics and warehousing. It has grown dramatically as a distribution center serving the greater Southern California market."),
    ("Moreno Valley", "California", 12, 3, 1984, "Moreno Valley California", "Moreno Valley is a rapidly growing city in Riverside County, California, one of the youngest incorporated cities in the state and a major logistics and distribution hub for Southern California. Its location between Los Angeles and the desert makes it a key crossroads for commerce."),
    ("Glendale", "California", 2, 14, 1906, "Glendale California Brand Boulevard", "Glendale is a city in the San Fernando Valley adjacent to Los Angeles, home to a large Armenian-American community and the headquarters of Disney Imagineering. Its Brand Boulevard of Cars is one of the most famous auto-dealer corridors in the country."),
    ("Akron", "Ohio", 12, 6, 1825, "Akron Ohio", "Akron is a city in northeastern Ohio that was once the 'Rubber Capital of the World,' home to Goodyear and a dominant rubber industry that shaped 20th-century America. Today it is reinventing itself as a hub for polymer science, healthcare, and entrepreneurship."),
    ("Yonkers", "New York", 12, 6, 1872, "Yonkers New York Hudson River", "Yonkers is the fourth-largest city in New York state, situated on the Hudson River just north of the Bronx, with a rich industrial history and stunning river views. It is home to the famous Empire City Casino and a rapidly gentrifying waterfront."),
    ("Shreveport", "Louisiana", 3, 20, 1839, "Shreveport Louisiana Red River", "Shreveport is the largest city in northwestern Louisiana on the Red River, once a hub for the oil boom and now a major center for film production—earning the nickname 'Hollywood South.' It blends Southern traditions with a growing creative economy."),
    ("Augusta", "Georgia", 12, 31, 1798, "Augusta Georgia Masters Golf", "Augusta is a historic city on the Savannah River in Georgia, world-famous as the home of the Masters Tournament at Augusta National Golf Club, one of the most prestigious events in sports. It was also the birthplace of the legendary James Brown, the 'Godfather of Soul.'"),
    ("Grand Rapids", "Michigan", 12, 2, 1850, "Grand Rapids Michigan ArtPrize", "Grand Rapids is the second-largest city in Michigan, renowned for its internationally acclaimed ArtPrize competition that transforms the entire city into an art gallery each fall. It is also a major hub for office furniture manufacturing, healthcare, and craft brewing."),
]

# ─── WIKIMEDIA COMMONS ────────────────────────────────────────────────────────
def get_wiki_image(search_term):
    """Search Wikimedia Commons for the best image."""
    try:
        params = urllib.parse.urlencode({
            'action': 'query',
            'list': 'search',
            'srsearch': search_term,
            'srnamespace': '6',  # File namespace
            'srlimit': '5',
            'format': 'json',
        })
        url = f"https://commons.wikimedia.org/w/api.php?{params}"
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())

        results = data.get('query', {}).get('search', [])
        for result in results:
            title = result['title']
            if not any(title.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                continue

            # Get the direct image URL
            info_params = urllib.parse.urlencode({
                'action': 'query',
                'titles': title,
                'prop': 'imageinfo',
                'iiprop': 'url',
                'format': 'json',
            })
            info_url = f"https://commons.wikimedia.org/w/api.php?{info_params}"
            req2 = urllib.request.Request(info_url, headers={'User-Agent': USER_AGENT})
            with urllib.request.urlopen(req2, timeout=10) as resp2:
                info_data = json.loads(resp2.read())

            pages = info_data.get('query', {}).get('pages', {})
            for page in pages.values():
                imageinfo = page.get('imageinfo', [])
                if imageinfo:
                    return imageinfo[0]['url']
    except Exception as e:
        print(f"    Image fetch error: {e}")
    return None

# ─── SUPABASE INSERT ──────────────────────────────────────────────────────────
def insert_city(service_key, row):
    data = json.dumps(row).encode('utf-8')
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/locations",
        data=data,
        headers={
            'apikey': service_key,
            'Authorization': f'Bearer {service_key}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            return status in (200, 201)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"    HTTP {e.code}: {body[:200]}")
        return False

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--service-key', required=True, help='Supabase service role key')
    parser.add_argument('--skip-images', action='store_true', help='Skip image fetching (faster dry-run)')
    args = parser.parse_args()

    seen_names = set()
    unique_cities = []
    for city in CITIES:
        if city[0] not in seen_names:
            seen_names.add(city[0])
            unique_cities.append(city)

    print(f"Inserting {len(unique_cities)} cities...\n")

    for i, (name, region, fm, fd, fy, wiki_term, description) in enumerate(unique_cities, 1):
        print(f"[{i}/{len(unique_cities)}] {name}, {region}...")

        lp, lp_display = calc_lp(fm, fd, fy)
        eastern = animal_for_year(fy)
        western = western_sign(fm, fd)

        image_url = None
        if not args.skip_images:
            image_url = get_wiki_image(wiki_term)
            if image_url:
                print(f"    Photo: {image_url[:80]}...")
            else:
                print(f"    Photo: none found")
            time.sleep(0.5)  # be polite to Wikimedia

        row = {
            'name': name,
            'type': 'city',
            'region': region,
            'founded_month': fm,
            'founded_day': fd,
            'founded_year': fy,
            'life_path': lp_display,
            'eastern_zodiac': eastern,
            'western_zodiac': western,
            'description': description,
            'image_url': image_url,
        }

        ok = insert_city(args.service_key, row)
        print(f"    {'OK' if ok else 'FAILED'} — LP {lp_display}, {eastern}, {western}")

    print("\nDone.")

if __name__ == '__main__':
    main()
