import React, { useState } from 'react';
import { Activity, Video, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import * as Progress from '@radix-ui/react-progress';

interface Exercise {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  sets: number;
  reps: number;
  completed: boolean;
  tips: string[];
}

export default function RehabExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      title: 'Knee Flexion',
      description: 'Gentle knee bending exercise for post-surgery recovery',
      videoUrl: 'https://example.com/knee-flexion.mp4',
      duration: '5 mins',
      sets: 3,
      reps: 10,
      completed: false,
      tips: [
        'Keep your back straight',
        'Move slowly and controlled',
        'Stop if you feel pain'
      ]
    },
    {
      id: '2',
      title: 'Ankle Mobility',
      description: 'Range of motion exercise for ankle rehabilitation',
      videoUrl: 'https://example.com/ankle-mobility.mp4',
      duration: '3 mins',
      sets: 2,
      reps: 15,
      completed: false,
      tips: [
        'Maintain proper posture',
        'Focus on full range of motion',
        'Breathe steadily'
      ]
    }
  ]);

  const toggleExercise = (id: string) => {
    setExercises(exercises.map(ex =>
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ));
  };

  const progress = Math.round((exercises.filter(ex => ex.completed).length / exercises.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Progress</h3>
        <Progress.Root 
          className="h-3 overflow-hidden bg-gray-100 rounded-full"
          value={progress}
        >
          <Progress.Indicator
            className="h-full bg-green-500 transition-transform duration-500"
            style={{ transform: `translateX(-${100 - progress}%)` }}
          />
        </Progress.Root>
        <p className="mt-2 text-sm text-gray-600">
          {progress}% of exercises completed
        </p>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {exercises.map(exercise => (
          <motion.div
            key={exercise.id}
            className={`bg-white p-4 rounded-xl border ${
              exercise.completed ? 'border-green-200 bg-green-50' : 'border-gray-100'
            } shadow-sm`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{exercise.title}</h4>
                  {exercise.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{exercise.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    {exercise.duration}
                  </span>
                  <span>{exercise.sets} sets</span>
                  <span>{exercise.reps} reps</span>
                </div>
              </div>
              <button
                onClick={() => toggleExercise(exercise.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  exercise.completed
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {exercise.completed ? 'Completed' : 'Start Exercise'}
              </button>
            </div>

            {/* Video Preview */}
            <div className="mt-4 relative bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <Video className="w-12 h-12 text-gray-400" />
              <button className="absolute inset-0 flex items-center justify-center hover:bg-black/5 transition-colors">
                <span className="sr-only">Play video</span>
              </button>
            </div>

            {/* Exercise Tips */}
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-800">Tips</span>
              </div>
              <ul className="space-y-1">
                {exercise.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}