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
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">
        Travel Preferences
      </h2>
      
      <Formik
        initialValues={{
          location: '',
          placeId: '',
          startDate: '',
          endDate: '',
          activities: [],
          budget: 100,
        }}
        onSubmit={onSubmit}
      >
        {({ setFieldValue, values }) => (
          <Form className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Location
              </label>
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Autocomplete>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Activities
              </label>
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

            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Daily Budget ($)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={values.budget}
                onChange={(e) => setFieldValue('budget', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Start Date
              </label>
              <DatePicker
                selected={values.startDate}
                onChange={date => setFieldValue('startDate', date)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">
                End Date
              </label>
              <DatePicker
                selected={values.endDate}
                onChange={date => setFieldValue('endDate', date)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Generate Itinerary
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ItineraryForm;
