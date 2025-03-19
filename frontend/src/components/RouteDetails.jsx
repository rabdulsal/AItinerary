import { useState, useEffect } from 'react';

const RouteDetails = ({ activities, onBack }) => {
  const [routeImage, setRouteImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateRouteImage = async () => {
      try {
        // Sort activities by time
        const sortedActivities = [...activities].sort((a, b) => {
          const timeA = new Date(`1970-01-01 ${a.time}`);
          const timeB = new Date(`1970-01-01 ${b.time}`);
          return timeA - timeB;
        });

        // Filter out activities without geometry data
        const activitiesWithGeometry = sortedActivities.filter(activity => 
          activity.geometry?.location?.lat && activity.geometry?.location?.lng
        );

        if (activitiesWithGeometry.length < 2) {
          setError("Not enough location data available to generate a route");
          setLoading(false);
          return;
        }

        // Create waypoints string for the route
        const waypoints = activitiesWithGeometry
          .map(activity => `${activity.geometry.location.lat},${activity.geometry.location.lng}`)
          .join('|');

        // Create markers string for all points
        const markers = activitiesWithGeometry
          .map((activity, index) => 
            `markers=color:${index === 0 ? 'green' : index === activitiesWithGeometry.length - 1 ? 'red' : 'blue'}|${activity.geometry.location.lat},${activity.geometry.location.lng}`
          )
          .join('&');

        // Generate the route image URL
        const routeUrl = `https://maps.googleapis.com/maps/api/staticmap?size=800x400&path=color:0x0000FF|weight:5|${waypoints}&${markers}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`;
        
        setRouteImage(routeUrl);
      } catch (error) {
        console.error('Error generating route:', error);
        setError("Failed to generate route map");
      } finally {
        setLoading(false);
      }
    };

    if (activities && activities.length > 0) {
      generateRouteImage();
    }
  }, [activities]);

  if (loading) {
    return <div className="text-white">Loading route...</div>;
  }

  return (
    <div className="bg-gray-800 min-h-screen p-8 text-white">
      <button 
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        ← Back to Itinerary
      </button>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Daily Route</h1>
        
        {error ? (
          <div className="bg-red-900 text-white p-4 rounded-lg mb-8">
            {error}
          </div>
        ) : routeImage && (
          <div className="w-full h-[400px] rounded-lg overflow-hidden mb-8">
            <img
              src={routeImage}
              alt="Route map"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="bg-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Itinerary</h2>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{activity.time}</h3>
                  <p className="text-gray-300">{activity.location}</p>
                  {!activity.geometry?.location && (
                    <p className="text-yellow-400 text-sm">Location data unavailable</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails; 