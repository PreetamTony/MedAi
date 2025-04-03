import React, { useState } from 'react';
import { Plus, Dumbbell, Clock, AlertCircle, X } from 'lucide-react';
import type { Exercise } from '../../types/medical';

export default function FitnessTracker() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const addExercise = (exercise: Exercise) => {
    setExercises([...exercises, exercise]);
    setShowAddForm(false);
  };

  const deleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  return (
    <div className="space-y-4">
      {exercises.map(exercise => (
        <div
          key={exercise.id}
          className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">{exercise.name}</h4>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {exercise.duration} minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Dumbbell className="w-4 h-4" />
                  Intensity: <span className="capitalize">{exercise.intensity}</span>
                </div>
                <p className="text-sm text-gray-500">{exercise.description}</p>
                {exercise.contraindications.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Contraindications:</span>
                    </div>
                    <ul className="mt-1 text-sm text-red-500 list-disc list-inside">
                      {exercise.contraindications.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => deleteExercise(exercise.id)}
              className="p-1 hover:bg-red-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ))}

      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Exercise
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const contraindications = formData.get('contraindications') as string;
            
            addExercise({
              id: crypto.randomUUID(),
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              duration: parseInt(formData.get('duration') as string),
              intensity: formData.get('intensity') as Exercise['intensity'],
              frequency: formData.get('frequency') as string,
              contraindications: contraindications.split('\n').filter(Boolean),
            });
          }}
          className="space-y-4 bg-gray-50 p-4 rounded-lg"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                min="1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intensity</label>
              <select
                name="intensity"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <input
              type="text"
              name="frequency"
              placeholder="e.g., 3 times per week"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraindications (one per line)
            </label>
            <textarea
              name="contraindications"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="List any medical conditions that should avoid this exercise..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Exercise
            </button>
          </div>
        </form>
      )}
    </div>
  );
}