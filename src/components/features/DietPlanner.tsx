import React, { useState } from 'react';
import { Plus, Utensils, AlertCircle, X } from 'lucide-react';
import type { DietPlan } from '../../types/medical';

export default function DietPlanner() {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const addDietPlan = (plan: DietPlan) => {
    setDietPlans([...dietPlans, plan]);
    setShowAddForm(false);
  };

  const deleteDietPlan = (id: string) => {
    setDietPlans(dietPlans.filter(plan => plan.id !== id));
  };

  return (
    <div className="space-y-4">
      {dietPlans.map(plan => (
        <div
          key={plan.id}
          className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-full">
              <div className="flex justify-between">
                <h4 className="font-medium text-gray-900">{plan.name}</h4>
                <button
                  onClick={() => deleteDietPlan(plan.id)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{plan.description}</p>
              
              {plan.restrictions.length > 0 && (
                <div className="p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>Dietary Restrictions:</span>
                  </div>
                  <ul className="mt-1 text-sm text-red-500 list-disc list-inside">
                    {plan.restrictions.map((restriction, index) => (
                      <li key={index}>{restriction}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                {plan.meals.map((meal, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-700 capitalize mb-1">{meal.type}</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {meal.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Diet Plan
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            
            const meals = ['breakfast', 'lunch', 'dinner', 'snack'].map(type => ({
              type,
              suggestions: (formData.get(`${type}_suggestions`) as string)
                .split('\n')
                .filter(Boolean)
            }));

            addDietPlan({
              id: crypto.randomUUID(),
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              restrictions: (formData.get('restrictions') as string).split('\n').filter(Boolean),
              recommendations: (formData.get('recommendations') as string).split('\n').filter(Boolean),
              meals,
            });
          }}
          className="space-y-4 bg-gray-50 p-4 rounded-lg"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Restrictions (one per line)
            </label>
            <textarea
              name="restrictions"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="List any dietary restrictions..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommendations (one per line)
            </label>
            <textarea
              name="recommendations"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="List dietary recommendations..."
            />
          </div>
          {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
            <div key={type}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {type} Suggestions (one per line)
              </label>
              <textarea
                name={`${type}_suggestions`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`List ${type} suggestions...`}
              />
            </div>
          ))}
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
              Add Diet Plan
            </button>
          </div>
        </form>
      )}
    </div>
  );
}