import requests

url = "https://in.bookmyshow.com/api/v2/mobile/showtimes/byvenue?venueCode=CNMB&dateCode=20260908"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "application/json, text/plain, */*"
}
try:
    resp = requests.get(url, headers=headers)
    data = resp.json()
    for ev in data.get("ShowDetails", [])[0].get("Event", []):
        print(f"Title: {ev.get('EventTitle')}")
        print(f"EventCode: {ev.get('EventCode')}")
        print(f"EventImageCode: {ev.get('EventImageCode')}")
        print("Keys:", ev.keys())
        break
except Exception as e:
    print(e)
