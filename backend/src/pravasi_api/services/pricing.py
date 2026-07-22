def calculate_outstation_price(distance_km: float, pricing: dict, days: int) -> dict:
    """Calculate outstation (round trip) price."""
    total_distance = round(distance_km * 2, 1)  # Round trip

    if total_distance < pricing["min_km"]:
        total_distance = pricing["min_km"]

    vehicle_cost = round(total_distance * pricing["outstation_km"])
    driver_cost = pricing["driver_bata"] * days
    total_price = vehicle_cost + driver_cost

    return {
        "distance_km": round(distance_km, 1),
        "total_distance_km": total_distance,
        "vehicle_cost": vehicle_cost,
        "driver_cost": driver_cost,
        "total_price": total_price,
        "breakdown": {
            "rate_per_km": pricing["outstation_km"],
            "min_km": pricing["min_km"],
            "bata_per_day": pricing["driver_bata"],
            "days": days,
            "calculation": f"{total_distance} km x ₹{pricing['outstation_km']}/km = ₹{vehicle_cost}"
        }
    }


def calculate_local_price(distance_km: float, pricing: dict) -> dict:
    """Calculate local package (8hrs/80km) price."""
    base_price = pricing["local_8hrs_80km"]
    extra_km_cost = 0
    extra_km: float = 0

    if distance_km > 80:
        extra_km = round(distance_km - 80, 1)
        extra_km_cost = round(extra_km * pricing["extra_km"])

    driver_cost = pricing["driver_bata"]
    total_price = base_price + extra_km_cost + driver_cost

    return {
        "distance_km": round(distance_km, 1),
        "total_distance_km": round(distance_km, 1),
        "vehicle_cost": base_price + extra_km_cost,
        "driver_cost": driver_cost,
        "total_price": total_price,
        "breakdown": {
            "base_price_8hrs_80km": base_price,
            "extra_km": extra_km,
            "extra_km_rate": pricing["extra_km"],
            "extra_km_cost": extra_km_cost,
            "driver_bata": driver_cost,
            "calculation": (
                f"Base ₹{base_price}"
                + (
                    f" + {extra_km} extra km x ₹{pricing['extra_km']}/km = ₹{extra_km_cost}"
                    if extra_km > 0
                    else ""
                )
                + f" + Driver ₹{driver_cost}"
            )
        }
    }
