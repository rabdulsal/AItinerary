import { GoogleMap, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { useState, useCallback, useEffect } from 'react';

const ItineraryMap = ({ activities, date }) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  
  const mapCenter = activities.length > 0 
    ? {
        lat: activities[0].venue.location.lat,
        lng: activities[0].venue.location.lng
      }
    : { lat: 0, lng: 0 };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  useEffect(() => {
    if (activities.length < 2) return;

    const waypoints = activities.slice(1, -1).map(activity => ({
      location: {
        lat: activity.venue.location.lat,
        lng: activity.venue.location.lng
      },
      stopover: true
    }));

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: {
          lat: activities[0].venue.location.lat,
          lng: activities[0].venue.location.lng
        },
        destination: {
          lat: activities[activities.length - 1].venue.location.lat,
          lng: activities[activities.length - 1].venue.location.lng
        },
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        }
      }
    );
  }, [activities]);

  return (
    <div className="h-[400px] w-full">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={mapCenter}
        zoom={13}
        onLoad={onLoad}
      >
        {activities.map((activity, index) => (
          <Marker
            key={index}
            position={{
              lat: activity.venue.location.lat,
              lng: activity.venue.location.lng
            }}
            label={(index + 1).toString()}
          />
        ))}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
};
