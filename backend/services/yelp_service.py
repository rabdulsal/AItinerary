import requests
import os

class YelpService:
    def __init__(self):
        self.api_key = os.getenv('YELP_API_KEY')
        self.base_url = 'https://api.yelp.com/v3'

    def search_businesses(self, location, categories, price_range=None):
        headers = {'Authorization': f'Bearer {self.api_key}'}
        params = {
            'location': location,
            'categories': categories,
            'price': price_range,
            'limit': 50
        }
        
        response = requests.get(
            f'{self.base_url}/businesses/search',
            headers=headers,
            params=params
        )
        return response.json().get('businesses', [])
