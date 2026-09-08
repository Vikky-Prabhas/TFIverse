import sqlite3
import json
import os
import hashlib
from pathlib import Path

# Paths
ENGINE_DATA = Path("../tfiverse-data-engine/data")
DB_PATH = "local.db"

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# 1. Drop and Recreate tables to clean slate
c.executescript("""
DROP TABLE IF EXISTS box_office_sessions;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS movies;

CREATE TABLE movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    poster_url TEXT
);
CREATE TABLE venues (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    chain TEXT,
    city TEXT,
    lat TEXT,
    lng TEXT
);
CREATE TABLE box_office_sessions (
    show_id TEXT PRIMARY KEY,
    movie_id TEXT REFERENCES movies(id),
    venue_id TEXT REFERENCES venues(id),
    show_date TEXT NOT NULL,
    show_time TEXT NOT NULL,
    audi TEXT,
    total_seats INTEGER,
    sold_seats INTEGER,
    gross_revenue REAL,
    categories_json TEXT,
    is_housefull BOOLEAN DEFAULT 0,
    is_fast_filling BOOLEAN DEFAULT 0,
    source TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

def get_movie_id(s):
    m_id = s.get("movieId")
    if m_id and str(m_id).strip() != "UNKNOWN":
        return str(m_id).strip()
    title = s.get("movie", "Unknown").strip()
    # Simple md5 hash of title for unique ID
    return "MOV_" + hashlib.md5(title.encode()).hexdigest()[:12]

# 2. Insert data
def sync_file(filename):
    if not (ENGINE_DATA / filename).exists():
        return
    print(f"Syncing {filename} to local.db")
    with open(ENGINE_DATA / filename) as f:
        data = json.load(f)
        for s in data:
            movie_id = get_movie_id(s)
            venue_id = s.get("venueId") or "UNKNOWN"
            
            c.execute("INSERT OR IGNORE INTO movies (id, title, poster_url) VALUES (?, ?, ?)", 
                      (movie_id, s.get("movie", "Unknown"), s.get("posterUrl", "")))
            c.execute("INSERT OR IGNORE INTO venues (id, name, chain, city, lat, lng) VALUES (?, ?, ?, ?, ?, ?)",
                      (venue_id, s.get("venue", "Unknown"), s.get("chain", "Unknown"), s.get("city", "Unknown"), s.get("lat", ""), s.get("lng", "")))
            c.execute("""
            INSERT OR REPLACE INTO box_office_sessions 
            (show_id, movie_id, venue_id, show_date, show_time, audi, total_seats, sold_seats, gross_revenue, categories_json, is_housefull, is_fast_filling, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s.get("showId", "UNKNOWN"), movie_id, venue_id,
                s.get("date", ""), s.get("time", ""), s.get("audi", ""),
                int(s.get("totalSeats", 0)), int(s.get("soldSeats", 0)), float(s.get("grossRevenue", 0)),
                json.dumps(s.get("categories", [])),
                1 if s.get("isHousefull") else 0,
                1 if s.get("isFastFilling") else 0,
                s.get("source", "BMS")
            ))

sync_file("latest_bms_data.json")
sync_file("latest_bms_advance_data.json")
sync_file("latest_paytm_data.json")
sync_file("latest_paytm_advance_data.json")
conn.commit()

c.execute('SELECT COUNT(*) FROM movies')
print(f'Total Movies: {c.fetchone()[0]}')
c.execute('SELECT COUNT(*) FROM box_office_sessions')
print(f'Total Shows: {c.fetchone()[0]}')
