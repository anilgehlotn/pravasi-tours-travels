"""
B2B Billing router — Pravasi Tours & Travels ERP
Handles corporate/travel-partner companies and their proforma invoice bills.

Bill number format: PT-0001/26-27  (prefix / seq / financial-year)
Financial year: April–March  →  April 2026–March 2027 = "26-27"
"""

import calendar
import logging
from datetime import date
from typing import Literal, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from postgrest.exceptions import APIError
from pydantic import BaseModel

from auth import get_current_admin
from database import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════════════════════
# Helpers
# ══════════════════════════════════════════════════════════════════════════════

def _supabase_error(e: Exception, context: str = "") -> HTTPException:
    """Convert any Supabase / DB error into a loggable, CORS-safe HTTPException."""
    msg = str(e)
    logger.error("Supabase error%s: %s", f" [{context}]" if context else "", msg)
    if isinstance(e, APIError):
        code = getattr(e, "code", None)
        # Table not found
        if code == "PGRST205" or "schema cache" in msg:
            return HTTPException(
                status_code=503,
                detail="Database table not found — please run the B2B migration SQL in Supabase.",
            )
        # Auth / RLS
        if code in ("42501", "PGRST301"):
            return HTTPException(status_code=403, detail="Database permission denied.")
    return HTTPException(status_code=500, detail=f"Database error: {msg}")


def _financial_year(for_date: date) -> str:
    fy_start = for_date.year if for_date.month >= 4 else for_date.year - 1
    return f"{str(fy_start)[2:]}-{str(fy_start + 1)[2:]}"


def _generate_bill_no(supabase, for_date: date) -> str:
    fy = _financial_year(for_date)
    pattern = f"PT-%/{fy}"
    try:
        resp = (
            supabase.table("b2b_bills")
            .select("bill_no")
            .like("bill_no", pattern)
            .order("bill_no", desc=True)
            .limit(1)
            .execute()
        )
        if resp.data:
            last_no = resp.data[0]["bill_no"]          # e.g. "PT-0007/26-27"
            seq = int(last_no.split("-")[1].split("/")[0])
            return f"PT-{seq + 1:04d}/{fy}"
    except Exception:
        pass
    return f"PT-0001/{fy}"


def _calc_local(data: dict) -> dict:
    extra_km_cost  = round((data.get("extra_km") or 0) * (data.get("per_km_cost") or 0), 2)
    extra_hrs_cost = round(data.get("extra_hrs_cost") or 0, 2)
    total_extra    = round(extra_km_cost + extra_hrs_cost, 2)
    total_amount   = round(
        (data.get("base_slab_amount") or 0) + total_extra + (data.get("toll") or 0), 2
    )
    return {**data, "extra_km_cost": extra_km_cost, "total_extra_cost": total_extra, "total_amount": total_amount}


def _calc_outstation(data: dict) -> dict:
    total_cost  = round((data.get("total_running_km") or 0) * (data.get("per_km_cost_out") or 0), 2)
    grand_total = round(total_cost + (data.get("bata") or 0) + (data.get("toll_charges") or 0), 2)
    return {**data, "total_cost": total_cost, "grand_total": grand_total}


# ══════════════════════════════════════════════════════════════════════════════
# Pydantic Models
# ══════════════════════════════════════════════════════════════════════════════

class B2BCompanyCreate(BaseModel):
    business_name: str
    address: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gstin: Optional[str] = None


class B2BCompanyUpdate(BaseModel):
    business_name: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gstin: Optional[str] = None


# ══════════════════════════════════════════════════════════════════════════════
# Company Endpoints
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/companies")
def list_companies():
    """Return all B2B partner companies ordered alphabetically."""
    try:
        sb = get_supabase()
        resp = sb.table("b2b_companies").select("*").order("business_name").execute()
        return resp.data
    except Exception as e:
        raise _supabase_error(e, "list_companies")


@router.post("/companies", status_code=status.HTTP_201_CREATED)
def create_company(
    payload: B2BCompanyCreate,
    _admin: dict = Depends(get_current_admin),
):
    """Create a new B2B partner company."""
    try:
        sb = get_supabase()
        data = {k: v for k, v in payload.model_dump().items() if v is not None}
        resp = sb.table("b2b_companies").insert(data).execute()
        if not resp.data:
            raise HTTPException(status_code=500, detail="Insert returned no data")
        return resp.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise _supabase_error(e, "create_company")


@router.put("/companies/{company_id}")
def update_company(
    company_id: str,
    payload: B2BCompanyUpdate,
    _admin: dict = Depends(get_current_admin),
):
    """Update an existing B2B partner company."""
    try:
        sb = get_supabase()
        data = payload.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No fields provided")
        resp = sb.table("b2b_companies").update(data).eq("id", company_id).execute()
        if not resp.data:
            raise HTTPException(status_code=404, detail="Company not found")
        return resp.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise _supabase_error(e, "update_company")


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(
    company_id: str,
    _admin: dict = Depends(get_current_admin),
):
    """Delete a B2B company (cascades to its bills)."""
    try:
        sb = get_supabase()
        resp = sb.table("b2b_companies").delete().eq("id", company_id).execute()
        if not resp.data:
            raise HTTPException(status_code=404, detail="Company not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise _supabase_error(e, "delete_company")


# ══════════════════════════════════════════════════════════════════════════════
# Bills Endpoints
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/bills")
def list_bills(
    company_id: Optional[str] = None,
    bill_type: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    month: Optional[str] = None,    # "YYYY-MM"
):
    """Return bills matching all supplied filters (all optional / combinable)."""
    try:
        sb = get_supabase()
        query = (
            sb.table("b2b_bills")
            .select("*, b2b_companies(business_name, address, contact_person, phone, gstin)")
            .order("date", desc=True)
            .order("created_at", desc=True)
        )

        if company_id:
            query = query.eq("company_id", company_id)
        if bill_type and bill_type in ("local", "outstation"):
            query = query.eq("bill_type", bill_type)
        if month:
            yr, mo = month.split("-")
            last_day = calendar.monthrange(int(yr), int(mo))[1]
            query = (
                query
                .gte("date", f"{yr}-{mo}-01")
                .lte("date", f"{yr}-{mo}-{last_day:02d}")
            )
        elif from_date:
            query = query.gte("date", from_date)
            if to_date:
                query = query.lte("date", to_date)

        resp = query.execute()
        return resp.data
    except Exception as e:
        raise _supabase_error(e, "list_bills")


@router.post("/bills", status_code=status.HTTP_201_CREATED)
def create_bill(
    payload: dict = Body(...),
    _admin: dict = Depends(get_current_admin),
):
    """
    Create a new bill.
    Accepts raw dict to handle both local and outstation shapes.
    Server recalculates ALL derived totals — never trusts client arithmetic.
    """
    try:
        sb = get_supabase()

        bill_type = payload.get("bill_type")
        if bill_type not in ("local", "outstation"):
            raise HTTPException(status_code=400, detail="bill_type must be 'local' or 'outstation'")

        raw_date = payload.get("date")
        if not raw_date:
            raise HTTPException(status_code=400, detail="date is required")

        try:
            bill_date = date.fromisoformat(str(raw_date))
        except ValueError:
            raise HTTPException(status_code=400, detail="date must be ISO format YYYY-MM-DD")

        company_id = payload.get("company_id")
        if not company_id:
            raise HTTPException(status_code=400, detail="company_id is required")

        # Verify company exists
        co_check = sb.table("b2b_companies").select("id").eq("id", company_id).execute()
        if not co_check.data:
            raise HTTPException(status_code=404, detail="B2B company not found")

        # Server-side recalculation
        data = _calc_local(payload) if bill_type == "local" else _calc_outstation(payload)

        # Strip client-controlled fields
        for k in ("id", "created_at", "bill_no"):
            data.pop(k, None)

        data["bill_no"] = _generate_bill_no(sb, bill_date)

        resp = sb.table("b2b_bills").insert(data).execute()
        if not resp.data:
            raise HTTPException(status_code=500, detail="Insert returned no data")
        return resp.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise _supabase_error(e, "create_bill")


@router.put("/bills/{bill_id}")
def update_bill(
    bill_id: str,
    payload: dict = Body(...),
    _admin: dict = Depends(get_current_admin),
):
    """Update a bill. Recalculates derived totals server-side."""
    try:
        sb = get_supabase()

        existing_resp = sb.table("b2b_bills").select("*").eq("id", bill_id).execute()
        if not existing_resp.data:
            raise HTTPException(status_code=404, detail="Bill not found")

        existing = existing_resp.data[0]
        bill_type = payload.get("bill_type", existing["bill_type"])

        merged = {**existing, **payload}
        for k in ("id", "created_at", "bill_no", "company_id"):
            merged.pop(k, None)

        merged = _calc_local(merged) if bill_type == "local" else _calc_outstation(merged)

        resp = sb.table("b2b_bills").update(merged).eq("id", bill_id).execute()
        if not resp.data:
            raise HTTPException(status_code=404, detail="Bill not found or update failed")
        return resp.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise _supabase_error(e, "update_bill")


@router.delete("/bills/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bill(
    bill_id: str,
    _admin: dict = Depends(get_current_admin),
):
    """Delete a bill."""
    try:
        sb = get_supabase()
        resp = sb.table("b2b_bills").delete().eq("id", bill_id).execute()
        if not resp.data:
            raise HTTPException(status_code=404, detail="Bill not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise _supabase_error(e, "delete_bill")


# ══════════════════════════════════════════════════════════════════════════════
# Summary Endpoint
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/companies/{company_id}/summary")
def company_summary(
    company_id: str,
    bill_type: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    month: Optional[str] = None,
):
    """
    Returns summary data for a B2B company's bills:
    - Our company info (from company_settings)
    - B2B partner info
    - Sum of total_amount / grand_total across matching bills
    - Bill count
    All values read from stored DB fields — no recalculation.
    """
    try:
        sb = get_supabase()

        # Fetch B2B company
        co_resp = sb.table("b2b_companies").select("*").eq("id", company_id).execute()
        if not co_resp.data:
            raise HTTPException(status_code=404, detail="Company not found")
        b2b_company = co_resp.data[0]

        # Fetch our own company settings (best-effort; may not exist)
        our_company = {}
        try:
            cs_resp = sb.table("company_settings").select("*").limit(1).execute()
            if cs_resp.data:
                our_company = cs_resp.data[0]
        except Exception:
            pass  # table might not exist; frontend falls back to localStorage

        # Build filtered bill query — sum from stored totals only
        query = (
            sb.table("b2b_bills")
            .select("bill_type, total_amount, grand_total, date, vehicle_number, vehicle_type, extra_km, total_running_km")
            .eq("company_id", company_id)
        )
        if bill_type and bill_type in ("local", "outstation"):
            query = query.eq("bill_type", bill_type)
        if month:
            yr, mo = month.split("-")
            last_day = calendar.monthrange(int(yr), int(mo))[1]
            query = query.gte("date", f"{yr}-{mo}-01").lte("date", f"{yr}-{mo}-{last_day:02d}")
        elif from_date:
            query = query.gte("date", from_date)
            if to_date:
                query = query.lte("date", to_date)

        bills_resp = query.execute()
        rows = bills_resp.data or []

        # Sum stored values and build vehicle breakdown
        total = 0.0
        vehicles = {}

        for row in rows:
            is_local = row.get("bill_type") == "local"
            amt = float(row.get("total_amount") or 0) if is_local else float(row.get("grand_total") or 0)
            total += amt

            v_num = row.get("vehicle_number") or "Unknown"
            if v_num not in vehicles:
                vehicles[v_num] = {
                    "vehicle_number": v_num,
                    "vehicle_type": row.get("vehicle_type") or "Unknown",
                    "total_km": 0.0,
                    "total_amount": 0.0
                }

            km = float(row.get("extra_km") or 0) if is_local else float(row.get("total_running_km") or 0)
            vehicles[v_num]["total_km"] += km
            vehicles[v_num]["total_amount"] += amt

        # Convert dict to sorted list (descending by total_amount)
        breakdown = sorted(vehicles.values(), key=lambda x: x["total_amount"], reverse=True)

        return {
            "our_company": our_company,
            "b2b_company": b2b_company,
            "bill_count": len(rows),
            "total_amount": round(total, 2),
            "vehicle_breakdown": breakdown,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise _supabase_error(e, "company_summary")

