const ItineraryTable = ({ itinerary = { data: [], message: "" }, onLocationClick }) => {
  if (!itinerary || !itinerary.data) {
    return null;
  }

  // Group activities by date
  const groupedActivities = itinerary.data.reduce((acc, activity) => {
    // Extract date from time string (assuming format like "09:00 AM")
    const date = activity.date; // We'll need to add this in the backend
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {});

  // Format date for section headers
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get price level display
  const getPriceLevelDisplay = (priceLevel) => {
    if (priceLevel === null || priceLevel === undefined) return '—';
    const symbols = {
      0: 'Free',
      1: '$',
      2: '$$',
      3: '$$$',
      4: '$$$$'
    };
    return symbols[priceLevel] || '—';
  };

  // Calculate total cost using itinerary.data
  const totalCost = Array.isArray(itinerary.data) 
    ? itinerary.data.reduce((sum, item) => {
        const itemCost = item && typeof item.cost === 'number' ? item.cost : 0;
        return sum + itemCost;
      }, 0)
    : 0;

    console.log("Itinerary after total cost calculation", itinerary)
  // Early return if no itinerary or not an array
  if (!itinerary || !Array.isArray(itinerary.data)) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 text-white">
        No itinerary data available
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">Your Itinerary</h2>
      {Object.entries(groupedActivities).map(([date, activities]) => (
        <div key={date} className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 text-left">
            {formatDate(date)}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Price Level
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Est. Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {activities.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-700 hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.activity}
                    </td>
                    <td 
                      className="px-4 py-2 cursor-pointer hover:text-blue-400"
                      onClick={() => {
                        console.log("Clicked location with place_id:", item.place_id);  // Debug log
                        if (item.place_id) {
                          onLocationClick(item.place_id);
                        }
                      }}
                    >
                      {item?.location || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.rating !== 'N/A' ? `${Number(item.rating).toFixed(1)} ⭐` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getPriceLevelDisplay(item.price_level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                      {typeof item.cost === 'number' ? `$${item.cost.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {totalCost > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4 text-right">
            Total Estimated Cost:
          </h3>
          <div className="text-right">
            ${totalCost.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryTable;
