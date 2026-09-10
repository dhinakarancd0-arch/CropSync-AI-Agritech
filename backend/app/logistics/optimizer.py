"""
AgriDirect Route Optimization Module

Implements a capacity-aware nearest-neighbor heuristic for the
Vehicle Routing Problem (VRP) / Traveling Salesman Problem (TSP).
Calculates real distances using the Haversine formula with demo coordinates.
"""
import math
from typing import List, Dict, Tuple


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate the great-circle distance between two points on Earth (km)."""
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def optimize_route(farmers: List[Dict], destination: Dict, vehicle_capacity: float = 2000.0) -> Dict:
    """
    Optimize the pickup route using nearest-neighbor heuristic with capacity constraints.
    
    Args:
        farmers: List of dicts with keys: farmer_id, name, lat, lng, quantity, location
        destination: Dict with keys: name, lat, lng, location
        vehicle_capacity: Maximum vehicle capacity in kg
        
    Returns:
        Optimized route with sequence, distances, time, capacity, and cost
    """
    if not farmers:
        return {
            "sequence": [],
            "total_distance_km": 0,
            "estimated_time_minutes": 0,
            "capacity_used_kg": 0,
            "capacity_total_kg": vehicle_capacity,
            "utilization_percent": 0,
            "estimated_cost": 0,
            "route_polyline": []
        }

    # Filter farmers that fit within vehicle capacity
    total_quantity = sum(f["quantity"] for f in farmers)
    eligible_farmers = []
    remaining_capacity = vehicle_capacity

    # Sort by quantity descending for greedy capacity packing
    sorted_farmers = sorted(farmers, key=lambda f: f["quantity"], reverse=True)
    for f in sorted_farmers:
        if f["quantity"] <= remaining_capacity:
            eligible_farmers.append(f)
            remaining_capacity -= f["quantity"]

    if not eligible_farmers:
        eligible_farmers = farmers[:1]  # Take at least one

    # Nearest-neighbor TSP from destination (start), through farmers, back to destination
    unvisited = list(eligible_farmers)
    sequence = []
    current_lat = destination["lat"]
    current_lng = destination["lng"]
    total_distance = 0.0

    # Start from destination, visit all farmers
    while unvisited:
        nearest = None
        nearest_dist = float("inf")

        for farmer in unvisited:
            dist = haversine_distance(current_lat, current_lng, farmer["lat"], farmer["lng"])
            if dist < nearest_dist:
                nearest_dist = dist
                nearest = farmer

        if nearest:
            total_distance += nearest_dist
            sequence.append({
                "stop_number": len(sequence) + 1,
                "type": "PICKUP",
                "farmer_id": nearest.get("farmer_id"),
                "name": nearest["name"],
                "location": nearest.get("location", ""),
                "lat": nearest["lat"],
                "lng": nearest["lng"],
                "quantity_kg": nearest["quantity"],
                "distance_from_previous_km": round(nearest_dist, 2)
            })
            current_lat = nearest["lat"]
            current_lng = nearest["lng"]
            unvisited.remove(nearest)

    # Return to destination
    return_distance = haversine_distance(current_lat, current_lng, destination["lat"], destination["lng"])
    total_distance += return_distance

    # Add destination as final stop
    sequence.append({
        "stop_number": len(sequence) + 1,
        "type": "DELIVERY",
        "name": destination["name"],
        "location": destination.get("location", ""),
        "lat": destination["lat"],
        "lng": destination["lng"],
        "quantity_kg": 0,
        "distance_from_previous_km": round(return_distance, 2)
    })

    # Apply 2-opt improvement
    sequence = _two_opt_improve(sequence, destination)

    # Recalculate total distance after optimization
    total_distance = _calculate_route_distance(sequence, destination)

    # Calculate metrics
    capacity_used = sum(f["quantity"] for f in eligible_farmers)
    avg_speed_kmh = 35  # Average speed for agricultural transport
    estimated_time = (total_distance / avg_speed_kmh) * 60  # minutes
    rate_per_km = 30  # ₹30 per km
    estimated_cost = total_distance * rate_per_km

    # Build route polyline for map
    route_polyline = [[destination["lat"], destination["lng"]]]
    for stop in sequence:
        route_polyline.append([stop["lat"], stop["lng"]])

    return {
        "sequence": sequence,
        "total_distance_km": round(total_distance, 2),
        "estimated_time_minutes": round(estimated_time, 1),
        "capacity_used_kg": round(capacity_used, 1),
        "capacity_total_kg": vehicle_capacity,
        "utilization_percent": round((capacity_used / vehicle_capacity) * 100, 1),
        "estimated_cost": round(estimated_cost, 0),
        "route_polyline": route_polyline
    }


def _two_opt_improve(sequence: List[Dict], destination: Dict) -> List[Dict]:
    """Apply 2-opt improvement to reduce total route distance."""
    pickup_stops = [s for s in sequence if s["type"] == "PICKUP"]
    if len(pickup_stops) <= 2:
        return sequence

    improved = True
    best = list(pickup_stops)

    while improved:
        improved = False
        for i in range(len(best) - 1):
            for j in range(i + 1, len(best)):
                new_route = best[:i] + best[i:j + 1][::-1] + best[j + 1:]
                if _route_distance(new_route, destination) < _route_distance(best, destination):
                    best = new_route
                    improved = True

    # Rebuild sequence with stop numbers
    result = []
    for idx, stop in enumerate(best):
        stop["stop_number"] = idx + 1
        result.append(stop)

    # Re-add destination
    dest_stop = [s for s in sequence if s["type"] == "DELIVERY"]
    if dest_stop:
        dest_stop[0]["stop_number"] = len(result) + 1
        result.extend(dest_stop)

    return result


def _route_distance(stops: List[Dict], destination: Dict) -> float:
    """Calculate total route distance."""
    if not stops:
        return 0
    total = haversine_distance(destination["lat"], destination["lng"], stops[0]["lat"], stops[0]["lng"])
    for i in range(len(stops) - 1):
        total += haversine_distance(stops[i]["lat"], stops[i]["lng"], stops[i + 1]["lat"], stops[i + 1]["lng"])
    total += haversine_distance(stops[-1]["lat"], stops[-1]["lng"], destination["lat"], destination["lng"])
    return total


def _calculate_route_distance(sequence: List[Dict], destination: Dict) -> float:
    """Calculate total route distance from sequence including start from destination."""
    if not sequence:
        return 0
    total = haversine_distance(destination["lat"], destination["lng"], sequence[0]["lat"], sequence[0]["lng"])
    for i in range(len(sequence) - 1):
        total += haversine_distance(sequence[i]["lat"], sequence[i]["lng"],
                                     sequence[i + 1]["lat"], sequence[i + 1]["lng"])
    return total
