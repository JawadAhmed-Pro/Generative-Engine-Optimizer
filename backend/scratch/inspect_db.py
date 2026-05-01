from sqlalchemy import inspect, create_engine
from config import settings

engine = create_engine(settings.DATABASE_URL)
inspector = inspect(engine)

def check_table(table_name):
    print(f"\nChecking table: {table_name}")
    try:
        columns = inspector.get_columns(table_name)
        for col in columns:
            print(f"  - {col['name']} ({col['type']})")
    except Exception as e:
        print(f"Error checking {table_name}: {e}")

check_table("analysis_results")
check_table("content_items")
