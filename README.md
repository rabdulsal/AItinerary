# Travel Itinerary Generator

An intelligent travel planning application that generates customized itineraries based on user preferences, using React for the frontend and Flask for the backend.

## System Architecture

### Frontend Components
- **ItineraryForm**: Handles user input including:
  - Location (using Google Places Autocomplete)
  - Date range
  - Activity preferences
  - Budget constraints
  - Indoor/outdoor preferences

- **ItineraryMap**: Displays selected locations and routes using Google Maps API
- **ItineraryTable**: Shows the scheduled activities in a time-slot format
- **PDFExport**: Generates downloadable PDF version of the itinerary

### Backend Services
- **GoogleService**: Handles place details, nearby search, and distance calculations
- **YelpService**: Provides restaurant and business recommendations
- **WeatherService**: Checks weather conditions for outdoor activities
- **SchedulerService**: Creates optimized daily schedules

## Data Flow

1. **User Input Processing**
   ```
   User Input → ItineraryForm → Backend API
   ```
   - Form collects preferences
   - Data validated using Formik/Yup
   - Sent to Flask backend

2. **Data Collection**
   ```
   Backend API → External Services → Data Processing
   ```
   - Google Places API fetches location details
   - Yelp API gets venue recommendations
   - Weather API checks conditions
   - Results filtered by user preferences

3. **Itinerary Generation**
   ```
   Raw Data → Scheduling Algorithm → Optimized Itinerary
   ```
   - Venues grouped by geographic clusters
   - Activities scheduled with time buffers
   - Travel times calculated
   - Weather conditions considered

4. **Result Presentation**
   ```
   Backend Response → Frontend Display
   ```
   - Interactive map shows locations
   - Table displays schedule
   - Export option for PDF version

## Key Features

### Location Clustering
- Groups nearby activities to minimize travel time
- Considers opening hours and peak times
- Adds appropriate buffer time between activities

### Smart Scheduling
- Allocates time based on activity type
- Accounts for venue operating hours
- Includes travel time between locations
- Considers weather for outdoor activities

### Budget Optimization
- Filters venues by price range
- Balances expensive and affordable activities
- Suggests free alternatives when available

## API Integration

### Google Maps
```python
# Used for:
- Place details and photos
- Distance matrix calculations
- Route optimization
- Location autocomplete
```

### Yelp
```python
# Used for:
- Restaurant recommendations
- Business reviews and ratings
- Price level information
- Operating hours
```

### OpenWeather
```python
# Used for:
- Weather forecasts
- Outdoor activity planning
- Weather-based rescheduling
```

## Example Flow

1. **User Submits Location "San Francisco"**
   ```
   Frontend → Google Places Autocomplete → Exact Coordinates
   ```

2. **Backend Processing**
   ```python
   # 1. Fetch nearby venues
   venues = google_service.get_nearby_places(location)
   restaurants = yelp_service.search_businesses(location)
   
   # 2. Check weather
   weather = weather_service.get_forecast(location)
   
   # 3. Filter results
   filtered_venues = filter_by_preferences(venues, user_preferences)
   
   # 4. Generate schedule
   itinerary = scheduler.create_itinerary(filtered_venues)
   ```

3. **Response to Frontend**
   ```javascript
   // Structured itinerary data
   {
     days: [{
       date: "2024-01-01",
       activities: [{
         time: "09:00",
         venue: "Venue Name",
         duration: "2 hours",
         travelTime: "20 mins"
       }, ...]
     }, ...]
   }
   ```

## Setup Instructions

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Variables**
   ```
   # Create .env files in both frontend and backend directories
   # See .env.example for required variables
   ```

4. **Run Application**
   ```bash
   # Terminal 1 (Backend)
   cd backend
   flask run

   # Terminal 2 (Frontend)
   cd frontend
   npm run dev
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details