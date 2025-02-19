import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import { useRef, useState } from 'react';

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
  const [inputValue, setInputValue] = useState('');
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: ['places']
  });

  // Add this temporarily for debugging
  console.log('Loaded API Key:', import.meta.env.VITE_GOOGLE_MAPS_KEY);

  const autocompleteRef = useRef(null);

  const activityOptions = [
    { value: 'restaurants', label: 'Restaurants' },
    { value: 'museums', label: 'Museums' },
    { value: 'hiking', label: 'Hiking' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'attractions', label: 'Tourist Attractions' },
  ];

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      background: '#2D3748',
      borderColor: '#4A5568',
      '&:hover': {
        borderColor: '#718096'
      }
    }),
    menu: (base) => ({
      ...base,
      background: '#2D3748',
      border: '1px solid #4A5568'
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? '#4A5568' : '#2D3748',
      color: 'white',
      '&:hover': {
        background: '#4A5568'
      }
    }),
    multiValue: (base) => ({
      ...base,
      background: '#4A5568'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'white'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'white',
      '&:hover': {
        background: '#718096',
        color: 'white'
      }
    })
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-white">
          Activity Preferences
        </h2>
        
        <Formik
          initialValues={{
            location: '',
            placeId: '',
            startDate: '',
            endDate: '',
            activities: [],
            budget: 100,
            preferOutdoor: false,
          }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ setFieldValue, values, errors, touched }) => (
            <Form className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label className="text-white block mb-2">Location</label>
                  <Autocomplete
                    onLoad={autocomplete => {
                      autocompleteRef.current = autocomplete;
                    }}
                    onPlaceChanged={() => {
                      if (autocompleteRef.current) {
                        const place = autocompleteRef.current.getPlace();
                        setFieldValue('location', place.formatted_address);
                        setFieldValue('placeId', place.place_id);
                        setInputValue(place.formatted_address);
                      }
                    }}
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter location"
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </Autocomplete>
                </div>

                <div>
                  <label className="text-white block mb-2">Activities</label>
                  <Select
                    isMulti
                    options={activityOptions}
                    className="text-white"
                    styles={customSelectStyles}
                    onChange={(selected) => 
                      setFieldValue('activities', selected.map(option => option.value))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white block mb-2">Start Date</label>
                    <DatePicker
                      selected={values.startDate}
                      onChange={date => setFieldValue('startDate', date)}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-white block mb-2">End Date</label>
                    <DatePicker
                      selected={values.endDate}
                      onChange={date => setFieldValue('endDate', date)}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-white block mb-2">Budget (per day)</label>
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
                <label className="text-white block mb-2">
                  <input
                    type="checkbox"
                    checked={values.preferOutdoor}
                    onChange={e => setFieldValue('preferOutdoor', e.target.checked)}
                  />
                  Prefer Outdoor Activities
                </label>
              </div>

              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Generate Itinerary
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ItineraryForm;
