
content = """VITE_SUPABASE_URL=https://lwfirarhvmfecncswmje.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZmlyYXJodm1mZWNuY3N3bWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3Mjg4NjUsImV4cCI6MjA4MTMwNDg2NX0.o0Qvoi2L8W4DrrXH-oLAe0vi4pcTH_x2qcAxmq7VNaY"""

with open('.env.local', 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully updated frontend .env.local")
