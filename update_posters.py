import sqlite3
import json
import os
import re

conn = sqlite3.connect('local.db')
c = conn.cursor()

# Get all movies currently in local.db
c.execute("SELECT id, title FROM movies WHERE poster_url = '' OR poster_url IS NULL")
db_movies = c.fetchall()

def normalize(t):
    return re.sub(r'[^a-z0-9]', '', t.lower().split('[')[0])

movies_json_dir = 'data/movies-json'
tmdb_cache = {}

print("Loading TMDB cache...")
for filename in os.listdir(movies_json_dir):
    if filename.endswith('.json'):
        with open(os.path.join(movies_json_dir, filename)) as f:
            try:
                data = json.load(f)
                if 'title' in data and data.get('poster_path'):
                    tmdb_cache[normalize(data['title'])] = "https://image.tmdb.org/t/p/w500" + data['poster_path']
            except:
                pass

print(f"Loaded {len(tmdb_cache)} movies with posters from TMDB cache.")

updates = 0
for m_id, title in db_movies:
    norm_title = normalize(title)
    if norm_title in tmdb_cache:
        c.execute("UPDATE movies SET poster_url = ? WHERE id = ?", (tmdb_cache[norm_title], m_id))
        updates += 1

conn.commit()
print(f"✅ Updated {updates} movie posters in local.db!")
