"""
Migration: Create B2B billing tables via Supabase HTTP API
Uses the service role key to hit Supabase's pg REST query endpoint.
Run once: python migrate_b2b.py
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")

if not SUPABASE_URL or not SERVICE_KEY:
    print("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    raise SystemExit(1)

HEADERS = {
    "apikey":        SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=representation",
}

TABLES_SQL = [
    (
        "b2b_companies",
        """
        CREATE TABLE IF NOT EXISTS b2b_companies (
            id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            business_name  TEXT NOT NULL,
            address        TEXT,
            contact_person TEXT,
            phone          TEXT,
            email          TEXT,
            gstin          TEXT,
            created_at     TIMESTAMPTZ DEFAULT now()
        );
        """,
    ),
    (
        "b2b_bills",
        """
        CREATE TABLE IF NOT EXISTS b2b_bills (
            id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id        UUID NOT NULL REFERENCES b2b_companies(id) ON DELETE CASCADE,
            bill_no           TEXT UNIQUE NOT NULL,
            bill_type         TEXT NOT NULL CHECK (bill_type IN ('local','outstation')),
            date              DATE NOT NULL,
            vehicle_number    TEXT,
            vehicle_type      TEXT,
            trip_sheet_number TEXT,
            base_slab_amount  NUMERIC,
            extra_km          NUMERIC,
            per_km_cost       NUMERIC,
            extra_km_cost     NUMERIC,
            extra_hrs         NUMERIC,
            extra_hrs_cost    NUMERIC,
            total_extra_cost  NUMERIC,
            toll              NUMERIC,
            total_amount      NUMERIC,
            total_running_km  NUMERIC,
            per_km_cost_out   NUMERIC,
            total_cost        NUMERIC,
            bata              NUMERIC,
            toll_charges      NUMERIC,
            grand_total       NUMERIC,
            created_at        TIMESTAMPTZ DEFAULT now()
        );
        """,
    ),
]

# ── Try Supabase pg/query endpoint (available in some project tiers) ──────────
def try_pg_endpoint(sql: str) -> bool:
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    r = requests.post(url, headers=HEADERS, json={"query": sql}, timeout=15)
    return r.ok

# ── Fallback: direct psycopg2 ─────────────────────────────────────────────────
def try_psycopg2(sql: str) -> bool:
    try:
        import psycopg2  # type: ignore
    except ImportError:
        return False

    # Extract project ref from URL: https://<ref>.supabase.co
    ref = SUPABASE_URL.replace("https://", "").split(".")[0]
    db_pass = os.getenv("SUPABASE_DB_PASSWORD", "")
    try:
        conn = psycopg2.connect(
            dbname="postgres", user="postgres", password=db_pass,
            host=f"db.{ref}.supabase.co", port="5432",
            connect_timeout=10,
        )
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(sql)
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"    psycopg2 error: {e}")
        return False

# ── Fallback: Supabase Management API SQL endpoint ────────────────────────────
def try_management_api(sql: str) -> bool:
    ref = SUPABASE_URL.replace("https://", "").split(".")[0]
    url = f"https://api.supabase.com/v1/projects/{ref}/database/query"
    # This needs a personal access token — skip if not available
    pat = os.getenv("SUPABASE_PAT", "")
    if not pat:
        return False
    r = requests.post(url,
        headers={"Authorization": f"Bearer {pat}", "Content-Type": "application/json"},
        json={"query": sql}, timeout=15)
    return r.ok

print("=" * 60)
print("  Pravasi ERP — B2B Tables Migration")
print("=" * 60)

all_ok = True
for table_name, sql in TABLES_SQL:
    print(f"\nCreating {table_name}...")
    if try_pg_endpoint(sql):
        print(f"  ✅ {table_name} created via RPC")
    elif try_psycopg2(sql):
        print(f"  ✅ {table_name} created via direct connection")
    elif try_management_api(sql):
        print(f"  ✅ {table_name} created via Management API")
    else:
        print(f"  ⚠️  Could not auto-create {table_name} — run this SQL manually in Supabase:\n")
        print(sql)
        all_ok = False

if all_ok:
    print("\n🎉 Migration complete — all B2B tables ready!")
else:
    print("\n📋 Copy the SQL above and paste it into:")
    ref = SUPABASE_URL.replace("https://", "").split(".")[0]
    print(f"   https://supabase.com/dashboard/project/{ref}/sql/new")
