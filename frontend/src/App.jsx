import { useState } from 'react'
import ItineraryForm from './components/ItineraryForm'
import ItineraryTable from './components/ItineraryTable'

function App() {
  const [itinerary, setItinerary] = useState(null)

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
      console.log('Response:', data);
      setItinerary(data)
    } catch (error) {
      console.error('Error generating itinerary:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Travel Itinerary Generator</h1>
      <ItineraryForm onSubmit={handleItinerarySubmit} />
      {itinerary && <ItineraryTable activities={itinerary.activities} />}
    </div>
  )
}

export default App
