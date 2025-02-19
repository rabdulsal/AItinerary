import { useState } from 'react'
import ItineraryForm from './components/ItineraryForm'
import ItineraryTable from './components/ItineraryTable'

function App() {
  const [itineraryData, setItineraryData] = useState(null)

  const handleItinerarySubmit = async (values) => {
    try {
      const response = await fetch('http://localhost:8080/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });
      
      const data = await response.json();
      setItineraryData(data);
    } catch (error) {
      console.error('Error generating itinerary:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <h1 className="text-center text-4xl font-bold mb-4">Travel Itinerary Generator</h1>
      <ItineraryForm onSubmit={handleItinerarySubmit} />
      {itineraryData && <ItineraryTable itinerary={itineraryData} />}
    </div>
  )
}

export default App
