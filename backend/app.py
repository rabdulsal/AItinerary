from flask import Flask, request, jsonify, make_response, send_from_directory, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import googlemaps
import random

load_dotenv()

# Add debug prints
print("Environment variables loaded")
api_key = os.getenv('GOOGLE_MAPS_API_KEY')
print(f"Google Maps API Key found: {bool(api_key)}")  # Prints True/False without exposing the key
print(f"API Key length: {len(api_key) if api_key else 0}")  # Additional verification

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')

# More permissive CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",  # Frontend port
            "http://localhost:5001",  # Backend port
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5001"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize Google Maps client with environment variable
gmaps = googlemaps.Client(key=api_key)

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

        # Add debug logging
        print(f"Searching for {activity_type} near {location}")
        places_result = gmaps.places_nearby(
            location=location,
            radius=radius,
            type=place_type
        )
        print(f"Found {len(places_result.get('results', []))} places")

        # Filter out already used places
        places = []
        for place in places_result.get('results', []):
            place_id = place.get('place_id')
            if place_id not in used_places:
                price_level = place.get('price_level', None)  # 0-4, where 0 is free and 4 is very expensive
                
                # Calculate estimated cost based on price_level if available
                estimated_cost = ACTIVITY_COSTS.get(activity_type, 30)
                if price_level is not None:
                    # Adjust base cost by price level
                    cost_multiplier = {
                        0: 0,      # Free
                        1: 0.5,    # Inexpensive
                        2: 1.0,    # Moderate
                        3: 1.5,    # Expensive
                        4: 2.0     # Very Expensive
                    }.get(price_level, 1.0)
                    estimated_cost *= cost_multiplier
                
                places.append({
                    'name': place.get('name'),
                    'address': place.get('vicinity'),
                    'rating': place.get('rating', 'N/A'),
                    'place_id': place_id,
                    'cost': round(estimated_cost, 2),
                    'price_level': price_level  # Include this in the response
                })
        print(f"Places: {places}")
        return places
    except Exception as e:
        print(f"Error fetching places: {str(e)}")
        # Add more detailed error information
        import traceback
        print(traceback.format_exc())
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
                'cost': activity_cost,
                'place_id': place['place_id'],
                'price_level': place.get('price_level')
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
    print(f"Generating itinerary: {request}")
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        print(f"Response: {response}")
        return response
    
    try:
        # Debug print incoming request
        print("Received request data:", request.get_json())
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        # Validate required fields
        required_fields = ['location', 'startDate', 'endDate']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        location = data.get('location')
        activities = data.get('activities', [])
        budget = float(data.get('budget', 100))  # Daily budget
        
        # Parse ISO format dates from frontend
        try:
            start_date_str = data.get('startDate').split('T')[0]  # Get only the date part
            end_date_str = data.get('endDate').split('T')[0]  # Get only the date part
            
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        except Exception as e:
            print(f"Date parsing error: {str(e)}")
            return jsonify({"error": f"Invalid date format: {str(e)}"}), 400
        
        # Set to track used place IDs across all days
        used_places = set()
        
        # Generate schedule for each day
        itinerary = []
        current_date = start_date
        while current_date <= end_date:
            try:
                daily_schedule = generate_daily_schedule(
                    location=location,
                    activities=activities,
                    date=current_date,
                    used_places=used_places,
                    budget=budget
                )
                
                if daily_schedule:
                    itinerary.extend(daily_schedule)
                else:
                    print(f"No schedule generated for {current_date}")
                
                current_date += timedelta(days=1)
            except Exception as e:
                print(f"Error generating daily schedule: {str(e)}")
                return jsonify({"error": f"Error generating daily schedule: {str(e)}"}), 500

        if not itinerary:
            return jsonify({"error": "Could not generate any itinerary items"}), 400

        return jsonify({
            "message": "Itinerary generated successfully",
            "data": itinerary
        })
        
    except Exception as e:
        import traceback
        print("Error generating itinerary:", str(e))
        print("Traceback:", traceback.format_exc())
        return jsonify({
            "error": f"Error generating itinerary: {str(e)}"
        }), 500

@app.route('/api/place-details/<place_id>')
def get_place_details(place_id):
    try:
        place = gmaps.place(place_id, fields=[
            'name',
            'formatted_address',
            'formatted_phone_number',
            'opening_hours',
            'photo',
            'rating',
            'review',
            'price_level',
            'editorial_summary',
            'geometry',
            'type'
        ])
        
        # Get the first photo if available
        photo_url = None
        if place['result'].get('photos'):
            photo_reference = place['result']['photos'][0]['photo_reference']
            photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference={photo_reference}&key={api_key}"
        
        result = {
            **place['result'],
            'photo_url': photo_url
        }
        
        # Add debug logging
        print(f"Place details retrieved: {result}")
        
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching place details: {str(e)}")  # Debug log
        import traceback
        print(traceback.format_exc())  # Print full stack trace
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    port = 5001
    print(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)  # Added debug=True for better error messages
