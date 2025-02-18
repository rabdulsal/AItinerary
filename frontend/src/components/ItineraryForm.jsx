import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import Select from 'react-select';

const validationSchema = Yup.object({
  location: Yup.string().required('Location is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  activities: Yup.array().min(1, 'Select at least one activity'),
  budget: Yup.number().required('Budget is required').positive(),
})

const ItineraryForm = ({ onSubmit }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: ['places'],
  });

  const activityOptions = [
    { value: 'restaurants', label: 'Restaurants' },
    { value: 'museums', label: 'Museums' },
    { value: 'hiking', label: 'Hiking' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'attractions', label: 'Tourist Attractions' },
  ];

  return (
    <Formik
      initialValues={{
        location: '',
        placeId: '',
        startDate: new Date(),
        endDate: new Date(),
        activities: [],
        budget: 100,
        preferOutdoor: false,
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ setFieldValue, values, errors, touched }) => (
        <Form className="space-y-4">
          {isLoaded && (
            <Autocomplete
              onLoad={autocomplete => {
                autocomplete.addListener('place_changed', () => {
                  const place = autocomplete.getPlace();
                  setFieldValue('location', place.formatted_address);
                  setFieldValue('placeId', place.place_id);
                });
              }}
            >
              <input
                type="text"
                placeholder="Enter location"
                className="w-full p-2 border rounded"
              />
            </Autocomplete>
          )}

          <div className="flex gap-4">
            <div>
              <label>Start Date</label>
              <DatePicker
                selected={values.startDate}
                onChange={date => setFieldValue('startDate', date)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label>End Date</label>
              <DatePicker
                selected={values.endDate}
                onChange={date => setFieldValue('endDate', date)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label>Activities</label>
            <Select
              isMulti
              options={activityOptions}
              onChange={selected => 
                setFieldValue('activities', 
                  selected.map(option => option.value)
                )
              }
            />
          </div>

          <div>
            <label>Budget (per day)</label>
            <input
              type="range"
              min="0"
              max="1000"
              value={values.budget}
              onChange={e => setFieldValue('budget', e.target.value)}
              className="w-full"
            />
            <span>${values.budget}</span>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={values.preferOutdoor}
                onChange={e => setFieldValue('preferOutdoor', e.target.checked)}
              />
              Prefer Outdoor Activities
            </label>
          </div>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Generate Itinerary
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ItineraryForm
