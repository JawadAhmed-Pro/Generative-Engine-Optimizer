
content = """VITE_SUPABASE_URL=https://lwfirarhvmfecncswmje.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_jnYMKBn6ISI0EkyPm4wFCg_z1-ML0Wk"""

with open('.env.local', 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully wrote .env.local with UTF-8")
