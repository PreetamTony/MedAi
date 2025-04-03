import React, { useState, useEffect } from 'react';
import { Ambulance, Phone, MapPin, Calendar, Bell, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  distance: string;
  type: 'hospital' | 'ambulance' | 'clinic';
  location: [number, number]; // [latitude, longitude]
}

interface HealthCamp {
  id: string;
  title: string;
  date: string;
  location: string;
  type: string;
  registrationUrl: string;
}

export default function EmergencyServices() {
  const [userLocation, setUserLocation] = useState<[number, number]>([13.0843, 80.2705]); // India's center
  const [emergencyContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'AIIMS Delhi',
      number: '011-26588500',
      distance: '2.5 km',
      type: 'hospital',
      location: [28.5672, 77.2100]
    },
    {
      id: '2',
      name: '108 Ambulance Service',
      number: '108',
      distance: '1.8 km',
      type: 'ambulance',
      location: [28.5700, 77.2200]
    },
    {
      id: '3',
      name: 'Apollo 24/7 Clinic',
      number: '1860-500-1066',
      distance: '0.5 km',
      type: 'clinic',
      location: [28.5600, 77.2000]
    }
  ]);

  const [healthCamps] = useState<HealthCamp[]>([
    {
      id: '1',
      title: 'Ayushman Bharat Health Camp',
      date: '2025-03-15',
      location: 'Community Center, Sector 15',
      type: 'General Health',
      registrationUrl: '#'
    },
    {
      id: '2',
      title: 'COVID-19 Vaccination Drive',
      date: '2025-03-20',
      location: 'Government Hospital',
      type: 'Vaccination',
      registrationUrl: '#'
    },
    {
      id: '3',
      title: 'Free Eye Check-up Camp',
      date: '2025-03-25',
      location: 'Primary Health Center',
      type: 'Eye Care',
      registrationUrl: '#'
    }
  ]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Map View */}
      <div className="h-[400px] rounded-xl overflow-hidden shadow-lg">
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {emergencyContacts.map(contact => (
            <Marker key={contact.id} position={contact.location}>
              <Popup>
                <div className="p-2">
                  <h4 className="font-medium">{contact.name}</h4>
                  <p className="text-sm text-gray-600">{contact.number}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Emergency Contacts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-800">Emergency Services</h3>
        </div>
        <div className="grid gap-4">
          {emergencyContacts.map(contact => (
            <motion.div
              key={contact.id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {contact.type === 'hospital' && (
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Ambulance className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                  {contact.type === 'ambulance' && (
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                  {contact.type === 'clinic' && (
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{contact.name}</h4>
                    <p className="text-sm text-gray-500">{contact.distance} away</p>
                  </div>
                </div>
                <a
                  href={`tel:${contact.number}`}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Call {contact.number}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Health Camps */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">Upcoming Health Camps</h3>
        </div>
        <div className="grid gap-4">
          {healthCamps.map(camp => (
            <motion.div
              key={camp.id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{camp.title}</h4>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(camp.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {camp.location}
                    </div>
                  </div>
                </div>
                <a
                  href={camp.registrationUrl}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Register
                </a>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {camp.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <p className="text-sm text-blue-800">
            Enable notifications to stay updated about upcoming health camps and emergency services in your area.
          </p>
        </div>
      </div>
    </div>
  );
}