import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
  },
  activity: {
    marginBottom: 10,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityName: {
    fontSize: 14,
    marginVertical: 5,
  },
  activityDetails: {
    fontSize: 12,
    color: '#444',
  },
});

const ItineraryPDF = ({ itinerary }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Your Travel Itinerary</Text>
      
      {itinerary.map((day, dayIndex) => (
        <View key={dayIndex}>
          <Text style={styles.dayTitle}>
            Day {dayIndex + 1} - {day[0].start_time.toLocaleDateString()}
          </Text>
          
          {day.map((activity, actIndex) => (
            <View key={actIndex} style={styles.activity}>
              <Text style={styles.activityTime}>
                {activity.start_time.toLocaleTimeString()} - 
                {activity.end_time.toLocaleTimeString()}
              </Text>
              <Text style={styles.activityName}>
                {activity.venue.name}
              </Text>
              <Text style={styles.activityDetails}>
                {activity.venue.address}
              </Text>
              {activity.travel_time.minutes > 0 && (
                <Text style={styles.activityDetails}>
                  Travel time to next location: {activity.travel_time.minutes} minutes
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);

const PDFExportButton = ({ itinerary }) => (
  <PDFDownloadLink
    document={<ItineraryPDF itinerary={itinerary} />}
    fileName="travel-itinerary.pdf"
    className="bg-green-500 text-white px-4 py-2 rounded"
  >
    {({ blob, url, loading, error }) =>
      loading ? 'Generating PDF...' : 'Download PDF'
    }
  </PDFDownloadLink>
);
