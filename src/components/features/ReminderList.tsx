import React, { useState } from 'react';
import { Bell, Plus, Check, X, Clock } from 'lucide-react';
import type { Reminder } from '../../types/medical';

export default function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const addReminder = (reminder: Reminder) => {
    setReminders([...reminders, reminder]);
    setShowAddForm(false);
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(reminder =>
      reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  return (
    <div className="space-y-4">
      {reminders.map(reminder => (
        <div
          key={reminder.id}
          className={`flex items-center justify-between p-3 rounded-lg border ${
            reminder.completed ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleReminder(reminder.id)}
              className={`p-1 rounded-full ${
                reminder.completed ? 'bg-gray-200' : 'bg-blue-200'
              }`}
            >
              <Check className={`w-4 h-4 ${
                reminder.completed ? 'text-gray-600' : 'text-blue-600'
              }`} />
            </button>
            <div className={reminder.completed ? 'text-gray-500 line-through' : 'text-gray-800'}>
              <p className="font-medium">{reminder.title}</p>
              <p className="text-sm">{reminder.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{reminder.time}</span>
            <button
              onClick={() => deleteReminder(reminder.id)}
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
          Add Reminder
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            addReminder({
              id: crypto.randomUUID(),
              type: formData.get('type') as Reminder['type'],
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              frequency: formData.get('frequency') as Reminder['frequency'],
              time: formData.get('time') as string,
              completed: false,
            });
          }}
          className="space-y-4 bg-gray-50 p-4 rounded-lg"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="medication">Medication</option>
              <option value="exercise">Exercise</option>
              <option value="appointment">Appointment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              name="description"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                name="frequency"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                name="time"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
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
              Add Reminder
            </button>
          </div>
        </form>
      )}
    </div>
  );
}