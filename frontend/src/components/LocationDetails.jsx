import { useState, useEffect } from 'react';

const LocationDetails = ({ placeId, onBack }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/place-details/${placeId}`);
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error('Error fetching place details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (placeId) {
      fetchDetails();
    }
  }, [placeId]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="bg-gray-800 min-h-screen p-8 text-white">
      <button 
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        ← Back to Itinerary
      </button>
      
      {details && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{details.name}</h1>
          
          {details.photo_url && (
            <img 
              src={details.photo_url} 
              alt={details.name}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Details</h2>
              <p className="mb-2">
                <span className="font-medium">Address:</span> {details.formatted_address}
              </p>
              {details.formatted_phone_number && (
                <p className="mb-2">
                  <span className="font-medium">Phone:</span> {details.formatted_phone_number}
                </p>
              )}
              {details.rating && (
                <p className="mb-2">
                  <span className="font-medium">Rating:</span> {details.rating} ⭐
                </p>
              )}
            </div>
            
            <div>
              {details.editorial_summary?.overview && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p>{details.editorial_summary.overview}</p>
                </div>
              )}
              
              {details.opening_hours?.weekday_text && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Hours</h2>
                  <ul>
                    {details.opening_hours.weekday_text.map((hours, index) => (
                      <li key={index}>{hours}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDetails;
