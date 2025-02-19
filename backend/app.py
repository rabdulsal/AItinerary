from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

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

@app.route('/api/generate-itinerary', methods=['POST', 'OPTIONS'])
def generate_itinerary():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 204  # Return empty response with 204 No Content status
    
    try:
        data = request.get_json()
        # Basic validation
        required_fields = ['location', 'startDate', 'endDate', 'activities', 'budget']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # TODO: Implement full itinerary generation
        return jsonify({
            'message': 'Itinerary generation endpoint ready',
            'received_data': data
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)
