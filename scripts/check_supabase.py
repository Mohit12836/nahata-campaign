import urllib.request
import json

url = "https://yuzufwbphdqgbzrgdaks.supabase.co/rest/v1/customers?select=*"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1enVmd2JwaGRxZ2J6cmdkYWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU1OTIyNSwiZXhwIjoyMTA1MTM1MjI1fQ.KV9iJG55mj1ZPjOUZXQzAKiO4mEVKlpLqo3zV3rKdVg"

req = urllib.request.Request(url, headers={"apikey": key, "Authorization": f"Bearer {key}"})
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"Total customers: {len(data)}")
        for r in data[:20]:
            print(r)
except Exception as e:
    print("Error:", e)
