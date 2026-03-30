#!/usr/bin/env python3
"""
Assign a 'type' to every celebrity in the Supabase database.
Types: Athlete, Actor, Musician, Comedian, Politician, Business, Scientist, Royalty, Influencer, Other

Usage:
  python3 scripts/assign_celebrity_types.py --service-key YOUR_SUPABASE_SERVICE_ROLE_KEY
"""

import argparse
import json
import urllib.request
import urllib.parse

SUPABASE_URL = "https://nzrjwaebzgmmdihzbjqb.supabase.co"

# ─── KNOWN TYPES ─────────────────────────────────────────────────────────────
# Map each known celebrity name to a type.
# Any name not listed here will be assigned 'Other'.
TYPES = {
    # Athletes
    'Michael Jordan':       'Athlete',
    'LeBron James':         'Athlete',
    'Lionel Messi':         'Athlete',
    'Cristiano Ronaldo':    'Athlete',
    'Serena Williams':      'Athlete',
    'Tiger Woods':          'Athlete',
    'Kobe Bryant':          'Athlete',
    'Muhammad Ali':         'Athlete',
    'Tom Brady':            'Athlete',
    'Usain Bolt':           'Athlete',
    'Roger Federer':        'Athlete',
    'Simone Biles':         'Athlete',
    'Wayne Gretzky':        'Athlete',
    'Pelé':                 'Athlete',
    'Neymar':               'Athlete',
    'Steph Curry':          'Athlete',
    'Kevin Durant':         'Athlete',
    'Shaquille O\'Neal':    'Athlete',
    'Mike Tyson':           'Athlete',
    'Floyd Mayweather':     'Athlete',
    'Conor McGregor':       'Athlete',
    'Ronaldo':              'Athlete',
    'Naomi Osaka':          'Athlete',
    'Venus Williams':       'Athlete',
    'Rafael Nadal':         'Athlete',
    'Novak Djokovic':       'Athlete',

    # Actors
    'Leonardo DiCaprio':    'Actor',
    'Brad Pitt':            'Actor',
    'Angelina Jolie':       'Actor',
    'Meryl Streep':         'Actor',
    'Tom Hanks':            'Actor',
    'Denzel Washington':    'Actor',
    'Will Smith':           'Actor',
    'Jennifer Aniston':     'Actor',
    'Julia Roberts':        'Actor',
    'Robert Downey Jr.':    'Actor',
    'Scarlett Johansson':   'Actor',
    'Dwayne Johnson':       'Actor',
    'Johnny Depp':          'Actor',
    'Morgan Freeman':       'Actor',
    'Cate Blanchett':       'Actor',
    'Natalie Portman':      'Actor',
    'Matt Damon':           'Actor',
    'Ryan Reynolds':        'Actor',
    'Chris Evans':          'Actor',
    'Chris Hemsworth':      'Actor',
    'Keanu Reeves':         'Actor',
    'Tom Cruise':           'Actor',
    'Samuel L. Jackson':    'Actor',
    'Nicole Kidman':        'Actor',
    'Charlize Theron':      'Actor',
    'Sandra Bullock':       'Actor',
    'Halle Berry':          'Actor',
    'Emma Stone':           'Actor',
    'Emma Watson':          'Actor',
    'Jennifer Lawrence':    'Actor',
    'Zendaya':              'Actor',
    'Timothée Chalamet':    'Actor',
    'Ana de Armas':         'Actor',
    'Margot Robbie':        'Actor',
    'Chadwick Boseman':     'Actor',
    'Idris Elba':           'Actor',
    'Viola Davis':          'Actor',
    'Lupita Nyong\'o':      'Actor',

    # Musicians
    'Taylor Swift':         'Musician',
    'Beyoncé':              'Musician',
    'Jay-Z':                'Musician',
    'Kanye West':           'Musician',
    'Drake':                'Musician',
    'Rihanna':              'Musician',
    'Adele':                'Musician',
    'Ed Sheeran':           'Musician',
    'Justin Bieber':        'Musician',
    'Ariana Grande':        'Musician',
    'Michael Jackson':      'Musician',
    'Madonna':              'Musician',
    'Elvis Presley':        'Musician',
    'The Beatles':          'Musician',
    'John Lennon':          'Musician',
    'Paul McCartney':       'Musician',
    'Freddie Mercury':      'Musician',
    'David Bowie':          'Musician',
    'Prince':               'Musician',
    'Whitney Houston':      'Musician',
    'Mariah Carey':         'Musician',
    'Billie Eilish':        'Musician',
    'Post Malone':          'Musician',
    'Travis Scott':         'Musician',
    'Bad Bunny':            'Musician',
    'Shakira':              'Musician',
    'Lady Gaga':            'Musician',
    'Katy Perry':           'Musician',
    'Bruno Mars':           'Musician',
    'The Weeknd':           'Musician',
    'Harry Styles':         'Musician',
    'Olivia Rodrigo':       'Musician',
    'Dua Lipa':             'Musician',
    'Nicki Minaj':          'Musician',
    'Cardi B':              'Musician',
    'Eminem':               'Musician',
    'Kendrick Lamar':       'Musician',
    'Bob Dylan':            'Musician',
    'Elton John':           'Musician',
    'Mick Jagger':          'Musician',
    'Bruce Springsteen':    'Musician',
    'Bob Marley':           'Musician',
    'Frank Sinatra':        'Musician',
    'Dolly Parton':         'Musician',
    'Johnny Cash':          'Musician',

    # Comedians
    'Conan O\'Brien':       'Comedian',
    'Dave Chappelle':       'Comedian',
    'Kevin Hart':           'Comedian',
    'Ellen DeGeneres':      'Comedian',
    'Jerry Seinfeld':       'Comedian',
    'Chris Rock':           'Comedian',
    'Eddie Murphy':         'Comedian',
    'Amy Schumer':          'Comedian',
    'Tina Fey':             'Comedian',
    'Amy Poehler':          'Comedian',
    'John Mulaney':         'Comedian',
    'Hannah Gadsby':        'Comedian',
    'Trevor Noah':          'Comedian',
    'Jimmy Fallon':         'Comedian',
    'Jimmy Kimmel':         'Comedian',
    'Stephen Colbert':      'Comedian',
    'Bill Burr':            'Comedian',
    'Louis C.K.':           'Comedian',
    'Robin Williams':       'Comedian',
    'Steve Martin':         'Comedian',
    'Jim Carrey':           'Comedian',
    'Adam Sandler':         'Comedian',
    'Seth Rogen':           'Comedian',
    'Ricky Gervais':        'Comedian',

    # Politicians
    'Barack Obama':         'Politician',
    'Donald Trump':         'Politician',
    'Joe Biden':            'Politician',
    'Hillary Clinton':      'Politician',
    'Bill Clinton':         'Politician',
    'George W. Bush':       'Politician',
    'George H.W. Bush':     'Politician',
    'Ronald Reagan':        'Politician',
    'Abraham Lincoln':      'Politician',
    'John F. Kennedy':      'Politician',
    'Nelson Mandela':       'Politician',
    'Winston Churchill':    'Politician',
    'Angela Merkel':        'Politician',
    'Vladimir Putin':       'Politician',
    'Xi Jinping':           'Politician',
    'Elon Musk':            'Business',   # Business, not Politician
    'Alexandria Ocasio-Cortez': 'Politician',
    'Bernie Sanders':       'Politician',
    'Kamala Harris':        'Politician',
    'Justin Trudeau':       'Politician',
    'Emmanuel Macron':      'Politician',

    # Business
    'Jeff Bezos':           'Business',
    'Bill Gates':           'Business',
    'Mark Zuckerberg':      'Business',
    'Warren Buffett':       'Business',
    'Steve Jobs':           'Business',
    'Larry Page':           'Business',
    'Sergey Brin':          'Business',
    'Tim Cook':             'Business',
    'Jack Ma':              'Business',
    'Richard Branson':      'Business',
    'Oprah Winfrey':        'Business',
    'Thomas Edison':        'Business',

    # Scientists
    'Albert Einstein':      'Scientist',
    'Isaac Newton':         'Scientist',

    # Royalty
    'Queen Elizabeth II':   'Royalty',
    'King Charles III':     'Royalty',
    'Prince William':       'Royalty',
    'Prince Harry':         'Royalty',
    'Kate Middleton':       'Royalty',
    'Meghan Markle':        'Royalty',
    'Princess Diana':       'Royalty',
    'King Charles':         'Royalty',

    # Influencer
    'PewDiePie':            'Influencer',
    'MrBeast':              'Influencer',
    'Kim Kardashian':       'Influencer',
    'Kylie Jenner':         'Influencer',
    'Kendall Jenner':       'Influencer',
    'Khloé Kardashian':     'Influencer',
    'Kourtney Kardashian':  'Influencer',
    'Kris Jenner':          'Influencer',
    'Logan Paul':           'Influencer',
    'Jake Paul':            'Influencer',
    'Addison Rae':          'Influencer',
    'Charli D\'Amelio':     'Influencer',
    'David Dobrik':         'Influencer',
    'Emma Chamberlain':     'Influencer',
    'Bella Poarch':         'Influencer',
    'Khaby Lame':           'Influencer',
    'Alix Earle':           'Influencer',
    'Jeffree Star':         'Influencer',
    'James Charles':        'Influencer',

    # Religion
    'Pope Francis':         'Religion',
    'Pope John Paul II':    'Religion',
    'Dalai Lama':           'Religion',
    'Billy Graham':         'Religion',
    'Joel Osteen':          'Religion',
    'Mother Teresa':        'Religion',
    'Desmond Tutu':         'Religion',
    'Rick Warren':          'Religion',
    'T.D. Jakes':           'Religion',
    'Deepak Chopra':        'Religion',
    'Thich Nhat Hanh':      'Religion',
    'Osho':                 'Religion',
    'Sri Sri Ravi Shankar': 'Religion',
    'Eckhart Tolle':        'Religion',
    'Marianne Williamson':  'Religion',

    # Occult
    'Aleister Crowley':     'Occult',
    'Anton LaVey':          'Occult',
    'Helena Blavatsky':     'Occult',
    'Nostradamus':          'Occult',
    'Rasputin':             'Occult',
    'John Dee':             'Occult',
    'Eliphas Levi':         'Occult',
    'Israel Regardie':      'Occult',
    'Dion Fortune':         'Occult',
    'Austin Osman Spare':   'Occult',

    # Additional Athletes
    'Patrick Mahomes':       'Athlete',
    'Giannis Antetokounmpo': 'Athlete',
    'Luka Dončić':           'Athlete',
    'Aaron Rodgers':         'Athlete',
    'Manny Pacquiao':        'Athlete',
    'Zlatan Ibrahimović':    'Athlete',
    'Lewis Hamilton':        'Athlete',

    # Additional Actors
    'Jon-Erik Hexum':        'Actor',
    'Al Pacino':             'Actor',
    'Robert De Niro':        'Actor',
    'Anthony Hopkins':       'Actor',
    'Joaquin Phoenix':       'Actor',
    'Jake Gyllenhaal':       'Actor',
    'Michael B. Jordan':     'Actor',
    'Florence Pugh':         'Actor',
    'Sydney Sweeney':        'Actor',
    'Pedro Pascal':          'Actor',
    'Paul Mescal':           'Actor',
    'Austin Butler':         'Actor',

    # Additional Musicians
    'SZA':                   'Musician',
    'Tyler the Creator':     'Musician',
    'Frank Ocean':           'Musician',
    'Sabrina Carpenter':     'Musician',
    'Chappell Roan':         'Musician',
    'Ice Spice':             'Musician',
    'Peso Pluma':            'Musician',
    'Morgan Wallen':         'Musician',
    'Zach Bryan':            'Musician',
    'Luke Combs':            'Musician',
    'Lana Del Rey':          'Musician',
    'Halsey':                'Musician',
    'Selena Gomez':          'Musician',
    'Miley Cyrus':           'Musician',
    'Demi Lovato':           'Musician',
    'BTS':                   'Musician',
    'BLACKPINK':             'Musician',
    'Coldplay':              'Musician',
    'Radiohead':             'Musician',
    'Led Zeppelin':          'Musician',
    'Pink Floyd':            'Musician',
    'Fleetwood Mac':         'Musician',
    'Stevie Wonder':         'Musician',
    'Stevie Nicks':          'Musician',
    'Aretha Franklin':       'Musician',
    'James Brown':           'Musician',
    'Ray Charles':           'Musician',
    'Jimi Hendrix':          'Musician',
    'Janis Joplin':          'Musician',
    'Kurt Cobain':           'Musician',
    'Amy Winehouse':         'Musician',
    'Tupac Shakur':          'Musician',
    'Notorious B.I.G.':      'Musician',
    'Snoop Dogg':            'Musician',
    'Ice Cube':              'Musician',
    'Lil Wayne':             'Musician',
    'Future':                'Musician',
    'Juice WRLD':            'Musician',

    # Additional Comedians
    'Nikki Glaser':          'Comedian',
    'Ali Wong':              'Comedian',
    'Hasan Minhaj':          'Comedian',
    'Bo Burnham':            'Comedian',
    'Nate Bargatze':         'Comedian',
    'Taylor Tomlinson':      'Comedian',
    'Pete Davidson':         'Comedian',
    'Russell Brand':         'Comedian',
    'Jim Jefferies':         'Comedian',

    # Additional Business
    'Sundar Pichai':         'Business',
    'Satya Nadella':         'Business',
    'Jensen Huang':          'Business',
    'Sam Altman':            'Business',
    'Peter Thiel':           'Business',
    'Sara Blakely':          'Business',
    'Howard Schultz':        'Business',
    'Michael Bloomberg':     'Business',
}

# ─── SUPABASE HELPERS ─────────────────────────────────────────────────────────
def sb_get(service_key, path):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers={
            'apikey': service_key,
            'Authorization': f'Bearer {service_key}',
            'Accept': 'application/json',
        }
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())

def sb_patch(service_key, path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        data=body,
        headers={
            'apikey': service_key,
            'Authorization': f'Bearer {service_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
        method='PATCH',
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {e.read().decode()[:200]}")
        return e.code

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--service-key', required=True)
    parser.add_argument('--dry-run', action='store_true', help='Print assignments without writing')
    args = parser.parse_args()

    print("Fetching celebrities...")
    celebrities = sb_get(args.service_key, 'celebrities?select=id,name,type&order=name')
    print(f"Found {len(celebrities)} celebrities\n")

    counts = {}
    unknown = []

    for c in celebrities:
        name = c['name']
        assigned = TYPES.get(name, 'Other')
        counts[assigned] = counts.get(assigned, 0) + 1
        if assigned == 'Other' and name not in TYPES:
            unknown.append(name)

        if args.dry_run:
            print(f"  {name:40s} → {assigned}")
        else:
            status = sb_patch(args.service_key, f"celebrities?id=eq.{c['id']}", {'type': assigned})
            mark = '✓' if status in (200, 204) else '✗'
            print(f"  {mark} {name:40s} → {assigned}")

    print(f"\n{'─'*50}")
    print("Type counts:")
    for t, n in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {t:15s} {n}")

    if unknown:
        print(f"\nAssigned 'Other' to {len(unknown)} unrecognized names:")
        for n in unknown:
            print(f"  - {n}")
        print("\nTo assign correct types, add them to the TYPES dict in this script and re-run.")

if __name__ == '__main__':
    main()
