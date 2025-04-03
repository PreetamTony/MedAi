import React, { useState } from 'react';
import { Smile, Frown, Meh, Plus } from 'lucide-react';
import type { MoodEntry } from '../../types/medical';

export default function MoodTracker() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const addMoodEntry = (entry: MoodEntry) => {
    setMoodEntries([entry, ...moodEntries]);
    setShowAddForm(false);
  };

  const getMoodIcon = (mood: MoodEntry['mood']) => {
    switch (mood) {
      case 'excellent':
      case 'good':
        return <Smile className="w-5 h-5 text-green-500" />;
      case 'neutral':
        return <Meh className="w-5 h-5 text-yellow-500" />;
      case 'bad':
      case 'terrible':
        return <Frown className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {moodEntries.map(entry => (
        <div
          key={entry.id}
          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getMoodIcon(entry.mood)}
              <span className="font-medium capitalize">{entry.mood}</span>
            </div>
            <span className="text-sm text-gray-500">
              {entry.date.toLocaleDateString()}
            </span>
          </div>
          {entry.notes && (
            <p className="text-sm text-gray-600">{entry.notes}</p>
          )}
        </div>
      ))}

      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Mood Entry
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            addMoodEntry({
              id: crypto.randomUUID(),
              date: new Date(),
              mood: formData.get('mood') as MoodEntry['mood'],
              notes: formData.get('notes') as string,
            });
          }}
          className="space-y-4 bg-gray-50 p-4 rounded-lg"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How are you feeling?</label>
            <select
              name="mood"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="neutral">Neutral</option>
              <option value="bad">Bad</option>
              <option value="terrible">Terrible</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's on your mind?"
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
              Save Entry
            </button>
          </div>
        </form>
      )}
    </div>
  );
}