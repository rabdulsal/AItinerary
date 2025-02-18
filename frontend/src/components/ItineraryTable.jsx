const ItineraryTable = ({ activities }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Your Itinerary</h2>
      <div className="border rounded">
        {activities.map((activity, index) => (
          <div key={index} className="p-2 border-b">
            {activity}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryTable;
