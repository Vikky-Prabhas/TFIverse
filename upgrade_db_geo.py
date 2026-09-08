import sqlite3
import json
import os

conn = sqlite3.connect('local.db')
c = conn.cursor()

# 1. Alter venues table to add state, district, mandal
print("Altering table 'venues'...")
try:
    c.execute("ALTER TABLE venues ADD COLUMN state TEXT;")
except Exception as e:
    print("state column already exists:", e)
    
try:
    c.execute("ALTER TABLE venues ADD COLUMN district TEXT;")
except Exception as e:
    print("district column already exists:", e)
    
try:
    c.execute("ALTER TABLE venues ADD COLUMN mandal TEXT;")
except Exception as e:
    print("mandal column already exists:", e)

# 2. Load geo_master.json
geo_path = "data/geo_master.json"
if not os.path.exists(geo_path):
    print(f"Error: {geo_path} not found")
    exit(1)

with open(geo_path, "r") as f:
    geo_data = json.load(f)

print(f"Loaded {len(geo_data)} venues from geo_master.json")

# 3. Update venues
updates = 0
for venue_code, meta in geo_data.items():
    state = meta.get('state')
    district = meta.get('district')
    mandal = meta.get('mandal')
    
    # If state is Unknown, let's just make it Null or keep it as Unknown
    # We will update the venue directly
    if state:
        c.execute("UPDATE venues SET state = ?, district = ?, mandal = ? WHERE id = ?", 
                 (state, district, mandal, venue_code))
        if c.rowcount > 0:
            updates += 1

conn.commit()
print(f"✅ Successfully updated {updates} venues with geographical data!")
