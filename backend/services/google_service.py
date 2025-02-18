from googlemaps import Client
import os

class GoogleService:
    def __init__(self):
        self.client = Client(key=os.getenv('GOOGLE_MAPS_KEY'))

    def get_place_details(self, place_id):
        result = self.client.place(place_id)
        return {
            'name': result['result'].get('name'),
            'address': result['result'].get('formatted_address'),
            'location': result['result'].get('geometry', {}).get('location'),
            'opening_hours': result['result'].get('opening_hours', {}),
            'rating': result['result'].get('rating')
        }

    def get_nearby_places(self, location, radius=5000, type=None):
        result = self.client.places_nearby(
            location=location,
            radius=radius,
            type=type
        )
        return result.get('results', [])
