import { useState } from 'react'
import ItineraryForm from './components/ItineraryForm'
import ItineraryTable from './components/ItineraryTable'
import LocationDetails from './components/LocationDetails'

function App() {
  const [itinerary, setItinerary] = useState(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)

  const handleItinerarySubmit = async (values) => {
    try {
      const jsonData = JSON.stringify(values);
      console.log('Submitting values:', jsonData); // Debug log
      const response = await fetch('http://localhost:5001/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add CORS headers
          'Accept': 'application/json',
        },
        body: jsonData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData); // Debug log
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data); // Debug log
      setItinerary(data);
    } catch (error) {
      console.error('Error generating itinerary:', error);
    }
  }

  const handleLocationClick = (placeId) => {
    console.log("Location clicked with placeId:", placeId);
    setSelectedPlaceId(placeId);
  };

  if (selectedPlaceId) {
    return (
      <LocationDetails 
        placeId={selectedPlaceId} 
        onBack={() => setSelectedPlaceId(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left side - Form */}
      <div className="w-1/5 min-w-[300px] border-r border-gray-700 p-4 h-screen overflow-y-auto">
        <ItineraryForm onSubmit={handleItinerarySubmit} />
      </div>

      {/* Right side - Table */}
      <div className="w-4/5 h-screen overflow-y-auto p-4">
        {itinerary ? (
          <ItineraryTable itinerary={itinerary} onLocationClick={handleLocationClick} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-400 text-xl text-center">
              <svg 
                className="mx-auto h-12 w-12 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
              Generate an Itinerary and see it here!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
