import sqlite3
import urllib.request
import urllib.parse
import json
import time

TMDB_API_KEY = "ba5dc12f58f09088d036049c565c2fe9"

conn = sqlite3.connect('local.db')
c = conn.cursor()

# Get all movies currently in local.db that are MISSING a poster
c.execute("SELECT id, title FROM movies WHERE poster_url = '' OR poster_url IS NULL")
db_movies = c.fetchall()

print(f"Found {len(db_movies)} movies missing posters. Contacting TMDB...")

updates = 0
for m_id, title in db_movies:
    # Clean the title (e.g., "Hanuman Ansh [2D | Hindi]" -> "Hanuman Ansh")
    clean_title = title.split('[')[0].strip()
    
    url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={urllib.parse.quote(clean_title)}&language=en-US"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('results') and len(data['results']) > 0:
                poster_path = data['results'][0].get('poster_path')
                if poster_path:
                    full_poster = f"https://image.tmdb.org/t/p/w500{poster_path}"
                    c.execute("UPDATE movies SET poster_url = ? WHERE id = ?", (full_poster, m_id))
                    updates += 1
                    print(f"✅ Found: {clean_title} -> {poster_path}")
                else:
                    print(f"⚠️ No poster path for: {clean_title}")
            else:
                print(f"❌ Not found on TMDB: {clean_title}")
    except Exception as e:
        print(f"Error fetching {clean_title}: {e}")
    
    # Be nice to TMDB rate limits
    time.sleep(0.1)

conn.commit()
print(f"Done! Updated {updates} new posters in the database.")
