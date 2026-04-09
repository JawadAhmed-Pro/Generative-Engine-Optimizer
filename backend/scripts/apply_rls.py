import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys
import os

# Ensure backend forms root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

async def apply_rls():
    engine = create_async_engine(settings.async_database_url)
    
    print("Checking if database is PostgreSQL...")
    if not settings.DATABASE_URL.startswith("postgresql"):
        print("Warning: Database is not PostgreSQL. RLS is only supported on PostgreSQL.")
        return

    async with engine.begin() as conn:
        print("Applying Row-Level Security Policies via Raw SQL...")

        # 1. Enable RLS on all user-data tables
        tables = [
            "projects", 
            "content_items", 
            "analysis_results", 
            "insights", 
            "citation_trackings", 
            "competitor_comparisons",
            "analysis_jobs"
        ]
        
        # In case the table is missing, use IF EXISTS in ALTER TABLE but PostgreSQL does not support IF EXISTS in ALTER TABLE ENABLE ROW LEVEL SECURITY directly, but we can do it via dynamic block or just assume tables exist since init_db ran.
        for t in tables:
            try:
                await conn.execute(text(f"ALTER TABLE {t} ENABLE ROW LEVEL SECURITY;"))
                # Force policies to be checked even for table owners
                await conn.execute(text(f"ALTER TABLE {t} FORCE ROW LEVEL SECURITY;"))
            except Exception as e:
                print(f"Skipping {t} (might not exist): {e}")

        # 2. DROP existing policies if any to recreate
        policies = [
            ("projects_tenant_isolation", "projects"),
            ("content_items_tenant_isolation", "content_items"),
            ("analysis_results_tenant_isolation", "analysis_results"),
            ("insights_tenant_isolation", "insights"),
            ("citation_trackings_tenant_isolation", "citation_trackings"),
            ("competitor_comparisons_tenant_isolation", "competitor_comparisons"),
            ("analysis_jobs_tenant_isolation", "analysis_jobs"),
        ]
        
        for p_name, t_name in policies:
            try:
                await conn.execute(text(f"DROP POLICY IF EXISTS {p_name} ON {t_name};"))
            except:
                pass
                
        # 3. CREATE robust matching policies
        # A. Direct `user_id` tables
        direct_tables = ["projects", "citation_trackings", "competitor_comparisons", "analysis_jobs"]
        for t in direct_tables:
            sql = f"""
            CREATE POLICY {t}_tenant_isolation ON {t}
            FOR ALL
            USING (
                user_id = NULLIF(current_setting('app.current_tenant', TRUE), '')::integer
                OR current_setting('app.current_tenant', TRUE) = 'admin'
            );
            """
            await conn.execute(text(sql))

        # B. Indirect tables (join through projects or content_items)
        content_items_sql = """
        CREATE POLICY content_items_tenant_isolation ON content_items
        FOR ALL
        USING (
            current_setting('app.current_tenant', TRUE) = 'admin' OR
            EXISTS (
                SELECT 1 FROM projects 
                WHERE projects.id = content_items.project_id 
                AND projects.user_id = NULLIF(current_setting('app.current_tenant', TRUE), '')::integer
            )
        );
        """
        await conn.execute(text(content_items_sql))

        analysis_results_sql = """
        CREATE POLICY analysis_results_tenant_isolation ON analysis_results
        FOR ALL
        USING (
            current_setting('app.current_tenant', TRUE) = 'admin' OR
            EXISTS (
                SELECT 1 FROM content_items
                JOIN projects ON projects.id = content_items.project_id
                WHERE content_items.id = analysis_results.content_item_id
                AND projects.user_id = NULLIF(current_setting('app.current_tenant', TRUE), '')::integer
            )
        );
        """
        await conn.execute(text(analysis_results_sql))

        insights_sql = """
        CREATE POLICY insights_tenant_isolation ON insights
        FOR ALL
        USING (
            current_setting('app.current_tenant', TRUE) = 'admin' OR
            EXISTS (
                SELECT 1 FROM content_items
                JOIN projects ON projects.id = content_items.project_id
                WHERE content_items.id = insights.content_item_id
                AND projects.user_id = NULLIF(current_setting('app.current_tenant', TRUE), '')::integer
            )
        );
        """
        await conn.execute(text(insights_sql))

    print("RLS policies successfully applied.")

if __name__ == "__main__":
    asyncio.run(apply_rls())
