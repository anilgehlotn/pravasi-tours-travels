import psycopg2
import os

try:
    # Direct connection to Supabase Postgres
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="RVU@kalvium.371K",
        host="db.pzuaakkpdtomsledmhjk.supabase.co",
        port="5432"
    )
    conn.autocommit = True
    cursor = conn.cursor()

    print("Adding columns to bookings table...")
    cursor.execute("""
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS customer_address TEXT,
        ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
        ADD COLUMN IF NOT EXISTS permit_charges NUMERIC;
    """)

    print("✅ SUCCESS: Database schema updated successfully. Added customer_address, vehicle_type, and permit_charges to bookings table.")

except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals() and conn:
        cursor.close()
        conn.close()
