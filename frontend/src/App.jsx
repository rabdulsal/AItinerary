import { useState } from 'react'
import ItineraryForm from './components/ItineraryForm'
import ItineraryTable from './components/ItineraryTable'

function App() {
  const [itineraryData, setItineraryData] = useState(null)

  const handleItinerarySubmit = async (values) => {
    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });
      
      const data = await response.json();
      setItineraryData(data);
    } catch (error) {
      console.error('Error generating itinerary:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left side - Form */}
      <div className="w-1/5 min-w-[300px] border-r border-gray-700 p-4 h-screen overflow-y-auto">
        <ItineraryForm onSubmit={handleItinerarySubmit} />
      </div>

      {/* Right side - Table */}
      <div className="w-4/5 h-screen overflow-y-auto p-4">
        {itineraryData ? (
          <ItineraryTable itinerary={itineraryData} />
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
