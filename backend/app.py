from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from googlemaps import Client
import random

load_dotenv()

app = Flask(__name__)
# CORS(app)
# CORS(app,origins="http://localhost:5173")
CORS(app,resources={r"/api/*": {"origins": '*'}})
#         "methods": ["GET", "POST", "OPTIONS"],
#         "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin"],
#         "supports_credentials": True,
#         "max_age": 3600
#     }
# })

# Initialize Google Maps client
gmaps = Client(key=os.getenv('GOOGLE_MAPS_KEY'))

def get_places_for_activity(location, activity_type, radius=5000):
    """Get places from Google Places API based on activity type."""
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

        # Extract relevant information
        places = []
        for place in places_result.get('results', []):
            places.append({
                'name': place.get('name'),
                'address': place.get('vicinity'),
                'rating': place.get('rating', 'N/A'),
                'place_id': place.get('place_id')
            })

        return places
    except Exception as e:
        print(f"Error fetching places: {str(e)}")
        return []

def generate_daily_schedule(location, activities, date):
    """Generate a schedule for one day."""
    schedule = []
    current_time = datetime.strptime('09:00', '%H:%M')  # Start at 9 AM
    
    # Get coordinates for the location
    geocode_result = gmaps.geocode(location)
    if not geocode_result:
        raise ValueError("Invalid location")
    
    lat_lng = geocode_result[0]['geometry']['location']
    
    # Generate activities throughout the day
    for activity_type in activities:
        places = get_places_for_activity(lat_lng, activity_type)
        if places:
            place = random.choice(places)
            
            schedule.append({
                'time': current_time.strftime('%I:%M %p'),
                'activity': activity_type.capitalize(),
                'location': f"{place['name']} - {place['address']}",
                'rating': place['rating']
            })
            
            # Add 2 hours for each activity plus 30 minutes travel time
            current_time += timedelta(hours=2, minutes=30)
    
    return schedule

@app.route('/api/generate-itinerary', methods=['POST', 'OPTIONS'])
def generate_itinerary():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return make_response('', 204)
    
    try:
        data = request.get_json()
        location = data.get('location')
        activities = data.get('activities', [])
        # Parse ISO format dates from frontend
        start_date_str = data.get('startDate').split('T')[0]  # Get only the date part
        end_date_str = data.get('endDate').split('T')[0]  # Get only the date part
        
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        
        # Generate schedule for each day
        itinerary = []
        current_date = start_date
        while current_date <= end_date:
            daily_schedule = generate_daily_schedule(
                location=location,
                activities=activities,
                date=current_date
            )
            
            itinerary.extend(daily_schedule)
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
    app.run(debug=True, port=8080)
