import axios from 'axios';
import { AlertTriangle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmergencySOS: React.FC = () => {
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Hold SOS for 3 Seconds');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<number>(0);

  // Emergency contacts (hardcoded for demo; ideally from user settings)
  const emergencyContacts = [
    { name: 'Tony', phone: '9361359339' },
    { name: 'Mom', phone: '8925249376'},
  ];
  const emergencyServiceNumber = '108'; // Replace with local emergency number

  // Get user location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        console.error('Geolocation error:', err);
        toast.error('Unable to get location. Enable location services.');
      }
    );
  }, []);

  // Fetch nearby hospitals using Google Maps API
  const getNearbyHospitals = async (lat: number, lng: number): Promise<string> => {
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your Google Maps API key
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const hospitals = response.data.results.slice(0, 3).map((h: any) => h.name).join(', ');
      return `Nearby hospitals: ${hospitals}`;
    } catch (error) {
      console.error('Google Maps Error:', error);
      return 'Unable to fetch nearby hospitals.';
    }
  };

  // Send WhatsApp message (simulated via URL redirect)
  const sendWhatsAppMessage = (phone: string, message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank'); // Opens WhatsApp in a new tab
  };

  // Handle emergency activation
  const handleEmergency = async () => {
    if (!location) {
      toast.error('Location unavailable. Cannot proceed.');
      setStatus('Hold SOS for 3 Seconds');
      setIsProcessing(false);
      return;
    }

    setStatus('Notifying Help...');
    const hospitalInfo = await getNearbyHospitals(location.lat, location.lng);
    const message = `Emergency SOS: User needs immediate help. Location: (${location.lat}, ${location.lng}). ${hospitalInfo}`;

    // Notify emergency contacts
    emergencyContacts.forEach((contact) => {
      sendWhatsAppMessage(contact.phone, `SOS from ${contact.name}: ${message}`);
    });

    // Notify emergency services
    sendWhatsAppMessage(emergencyServiceNumber, `Emergency Alert: ${message}`);

    toast.success('Emergency contacts and services notified!');
    setStatus('Help Notified. Hold to Restart.');
    setIsProcessing(false);
  };

  // Handle button press (start 3-second timer)
  const handleButtonPress = () => {
    if (isProcessing) return;

    setIsActivating(true);
    setStatus('Hold for 3 Seconds...');
    progressRef.current = 0;

    holdTimerRef.current = setInterval(() => {
      progressRef.current += 100;
      if (progressRef.current >= 3000) {
        clearInterval(holdTimerRef.current!);
        setIsActivating(false);
        setIsProcessing(true);
        handleEmergency();
      }
    }, 100);
  };

  // Handle button release (cancel if < 3 seconds)
  const handleButtonRelease = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
      setIsActivating(false);
      if (!isProcessing) {
        setStatus('Hold SOS for 3 Seconds');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[600px] bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-xl">
      {/* Animated Circle Effect */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div
          className={`absolute w-full h-full rounded-full transition-all duration-300 ${
            isActivating || isProcessing ? 'bg-red-200 animate-pulse scale-110' : 'bg-red-100'
          }`}
        />
        <div
          className={`absolute w-3/4 h-3/4 rounded-full transition-all duration-300 ${
            isActivating || isProcessing ? 'bg-red-300 animate-pulse scale-105' : 'bg-red-200'
          }`}
        />
        <div
          className={`absolute w-1/2 h-1/2 rounded-full transition-all duration-300 ${
            isActivating || isProcessing ? 'bg-red-400 animate-pulse scale-100' : 'bg-red-300'
          }`}
        />
      </div>

      {/* SOS Button */}
      <button
        onMouseDown={handleButtonPress}
        onMouseUp={handleButtonRelease}
        onTouchStart={handleButtonPress} // For mobile support
        onTouchEnd={handleButtonRelease}
        disabled={isProcessing}
        className={`relative z-10 p-6 rounded-full transition-all duration-300 ${
          isActivating
            ? 'bg-red-600 text-white animate-pulse'
            : isProcessing
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <AlertTriangle className="w-8 h-8" />
        )}
      </button>

      {/* Status Text */}
      <p className="mt-6 text-lg font-medium text-gray-700 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600" /> {status}
      </p>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-500 text-center max-w-md">
        Hold the SOS button for 3 seconds to notify emergency contacts and services with your location.
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EmergencySOS;