import { motion } from 'framer-motion';
import { Calendar, Clock, Phone, Star, Video } from 'lucide-react';
import { useState } from 'react';
import VideoCall from '../VideoCall';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  languages: string[];
  rating: number;
  nextAvailable: string;
  fee: string;
  image: string;
}

export default function DoctorConsultation() {
  const [doctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. Preetam Tony J',
      specialization: 'General Physician',
      experience: '5 years',
      languages: ['English', 'Tamil', 'Hindi'],
      rating: 4.8,
      nextAvailable: 'Today, 3:00 PM',
      fee: '₹500',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShdHgYdmpIooSbYnHgybCoA8kT0ANQ31CEWg&s'
    },
    {
      id: '2',
      name: 'Dr. Samantha',
      specialization: 'Cardiologist',
      experience: '15 years',
      languages: ['English', 'Hindi', 'Telugu'],
      rating: 4.9,
      nextAvailable: 'Tomorrow, 11:00 AM',
      fee: '₹1000',
      image: 'https://pbs.twimg.com/media/GEqG7s1WYAARCG5.jpg'
    }
  ]);

  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {selectedDoctor ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedDoctor(null)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Doctors
          </button>
          <VideoCall
            doctorId={selectedDoctor}
            onEnd={() => setSelectedDoctor(null)}
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {doctors.map(doctor => (
            <motion.div
              key={doctor.id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start gap-4">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Experience: {doctor.experience}
                    </p>
                    <p className="text-sm text-gray-600">
                      Languages: {doctor.languages.join(', ')}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {doctor.nextAvailable}
                      </span>
                      <span className="font-medium text-green-600">{doctor.fee}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setSelectedDoctor(doctor.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Video Consult
                    </button>
                    <a
                      href={`tel:+91 8925249376`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Voice Call
                    </a>
                    <button
                      className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}