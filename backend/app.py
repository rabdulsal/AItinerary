from flask import Flask, request, jsonify, make_response, send_from_directory, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import googlemaps
import random

load_dotenv()

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)
print(os.getenv('GOOGLE_MAPS_API_KEY'))
# Initialize Google Maps client with environment variable
gmaps = googlemaps.Client(key=os.getenv('GOOGLE_MAPS_API_KEY'))

# Define average costs for different activity types
ACTIVITY_COSTS = {
    'restaurants': 30,  # Average cost per person for a meal
    'museums': 25,      # Average museum admission
    'shopping': 50,     # Average shopping activity cost
    'attractions': 35,  # Average tourist attraction admission
    'hiking': 10,       # Cost for parking/trail pass
}

def get_places_for_activity(location, activity_type, used_places, radius=5000):
    """Get places from Google Places API based on activity type, excluding already used places."""
    try:
        # Convert activity types to Google Places types
        activity_map = {
            'restaurants': 'restaurant',
            'museums': 'museum',
            'shopping': 'shopping_mall',
            'attractions': 'tourist_attraction',
            'hiking': 'park'
        }
        
        place_type = activity_map.get(activity_type)
        if not place_type:
            return []

        # Search for places
        places_result = gmaps.places_nearby(
            location=location,
            radius=radius,
            type=place_type
        )

        # Filter out already used places
        places = []
        for place in places_result.get('results', []):
            place_id = place.get('place_id')
            if place_id not in used_places:
                places.append({
                    'name': place.get('name'),
                    'address': place.get('vicinity'),
                    'rating': place.get('rating', 'N/A'),
                    'place_id': place_id,
                    'cost': ACTIVITY_COSTS.get(activity_type, 30)  # Default cost if not specified
                })

        return places
    except Exception as e:
        print(f"Error fetching places: {str(e)}")
        return []

def generate_daily_schedule(location, activities, date, used_places, budget):
    """Generate a schedule for one day, respecting budget constraints."""
    schedule = []
    current_time = datetime.strptime('09:00', '%H:%M')
    remaining_budget = budget
    
    # Get coordinates for the location
    geocode_result = gmaps.geocode(location)
    if not geocode_result:
        raise ValueError("Invalid location")
    
    lat_lng = geocode_result[0]['geometry']['location']
    
    # Shuffle activities to get different combinations each time
    random.shuffle(activities)
    
    # Try to add activities while we have budget and time
    for activity_type in activities:
        # Check if we have enough budget for this activity
        activity_cost = ACTIVITY_COSTS.get(activity_type, 30)
        if activity_cost > remaining_budget:
            continue
            
        # Check if we have enough time (don't start activities after 8 PM)
        if current_time.hour >= 20:
            break
            
        places = get_places_for_activity(lat_lng, activity_type, used_places)
        if places:
            place = random.choice(places)
            used_places.add(place['place_id'])
            
            schedule.append({
                'date': date.strftime('%Y-%m-%d'),
                'time': current_time.strftime('%I:%M %p'),
                'activity': activity_type.capitalize(),
                'location': f"{place['name']} - {place['address']}",
                'rating': place['rating'],
                'cost': activity_cost
            })
            
            # Update remaining budget and time
            remaining_budget -= activity_cost
            current_time += timedelta(hours=2, minutes=30)  # Activity + travel time
    
    return schedule

# Catch all routes to serve React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/generate-itinerary', methods=['POST', 'OPTIONS'])
def generate_itinerary():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return make_response('', 204)
    
    try:
        data = request.get_json()
        location = data.get('location')
        activities = data.get('activities', [])
        budget = float(data.get('budget', 100))  # Daily budget
        
        # Parse ISO format dates from frontend
        start_date_str = data.get('startDate').split('T')[0]  # Get only the date part
        end_date_str = data.get('endDate').split('T')[0]  # Get only the date part
        
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        
        # Set to track used place IDs across all days
        used_places = set()
        
        # Generate schedule for each day
        itinerary = []
        current_date = start_date
        while current_date <= end_date:
            daily_schedule = generate_daily_schedule(
                location=location,
                activities=activities,
                date=current_date,
                used_places=used_places,
                budget=budget  # Pass the daily budget
            )
            
            # Only add the day if we found activities
            if daily_schedule:
                itinerary.extend(daily_schedule)
            else:
                # If we run out of unique places, stop generating more days
                break
            
            current_date += timedelta(days=1)

        return jsonify({
            "message": "Itinerary generated successfully",
            "data": itinerary
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)
