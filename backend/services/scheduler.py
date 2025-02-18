from datetime import datetime, timedelta
from typing import List, Dict
import numpy as np

class SchedulerService:
    def __init__(self):
        self.DEFAULT_DURATIONS = {
            'restaurants': timedelta(hours=1, minutes=30),
            'museums': timedelta(hours=2),
            'hiking': timedelta(hours=3),
            'shopping': timedelta(hours=2),
            'attractions': timedelta(hours=2),
        }
        self.BUFFER_TIME = timedelta(minutes=30)

    def schedule_activities(self, venues: List[Dict], start_date: datetime, end_date: datetime) -> List[Dict]:
        days = (end_date - start_date).days + 1
        daily_schedules = []

        # Group venues by location clusters using simple k-means
        clustered_venues = self._cluster_venues(venues, days)

        for day in range(days):
            current_time = datetime.combine(
                start_date + timedelta(days=day),
                datetime.strptime('09:00', '%H:%M').time()
            )
            end_time = datetime.combine(
                start_date + timedelta(days=day),
                datetime.strptime('19:00', '%H:%M').time()
            )

            day_schedule = []
            day_venues = clustered_venues[day]

            for venue in day_venues:
                if current_time >= end_time:
                    break

                # Check if venue is open
                if self._is_venue_open(venue, current_time):
                    duration = self.DEFAULT_DURATIONS.get(
                        venue['category'],
                        timedelta(hours=1)
                    )
                    
                    activity_end = current_time + duration
                    if activity_end > end_time:
                        break

                    day_schedule.append({
                        'start_time': current_time,
                        'end_time': activity_end,
                        'venue': venue,
                        'travel_time': self._estimate_travel_time(
                            venue,
                            day_schedule[-1]['venue'] if day_schedule else None
                        )
                    })

                    current_time = activity_end + self.BUFFER_TIME

            daily_schedules.append(day_schedule)

        return daily_schedules

    def _cluster_venues(self, venues, num_clusters):
        # Simple clustering based on location
        if not venues:
            return [[] for _ in range(num_clusters)]

        coordinates = np.array([[v['location']['lat'], v['location']['lng']] 
                              for v in venues])
        
        from sklearn.cluster import KMeans
        kmeans = KMeans(n_clusters=min(num_clusters, len(venues)))
        clusters = kmeans.fit_predict(coordinates)
        
        grouped_venues = [[] for _ in range(num_clusters)]
        for venue, cluster_id in zip(venues, clusters):
            grouped_venues[cluster_id].append(venue)
            
        return grouped_venues

    def _is_venue_open(self, venue, time):
        if 'opening_hours' not in venue:
            return True
        # Implementation depends on the API response format
        return True  # Simplified for this example

    def _estimate_travel_time(self, venue1, venue2):
        if not venue2:
            return timedelta(minutes=0)
        # Simple estimation based on distance
        # In real implementation, use Google Distance Matrix API
        return timedelta(minutes=20)  # Default buffer
