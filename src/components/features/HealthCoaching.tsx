import * as Progress from '@radix-ui/react-progress';
import * as Slider from '@radix-ui/react-slider';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Calendar, Droplet, Moon, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';

interface Goal {
  id: string;
  type: 'steps' | 'water' | 'sleep' | 'meditation';
  target: number;
  current: number;
  unit: string;
  color: string;
}

export default function HealthCoaching() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', type: 'steps', target: 10000, current: 6500, unit: 'steps', color: 'from-cyan-500 to-blue-500' },
    { id: '2', type: 'water', target: 8, current: 5, unit: 'glasses', color: 'from-sky-500 to-indigo-500' },
    { id: '3', type: 'sleep', target: 8, current: 7, unit: 'hours', color: 'from-violet-500 to-purple-500' },
    { id: '4', type: 'meditation', target: 20, current: 15, unit: 'minutes', color: 'from-pink-500 to-rose-500' }
  ]);

  const [streakDays, setStreakDays] = useState(7);
  const [points, setPoints] = useState(350);

  const updateGoal = (id: string, value: number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, current: Math.min(value, goal.target) } : goal
    ));
  };

  const getIcon = (type: string) => {
    const iconClass = "w-6 h-6";
    switch(type) {
      case 'steps': return <Activity className={iconClass} />;
      case 'water': return <Droplet className={iconClass} />;
      case 'sleep': return <Moon className={iconClass} />;
      case 'meditation': return <Zap className={iconClass} />;
      default: return <Activity className={iconClass} />;
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold text-gray-800">Wellness Tracker</h1>
        <p className="text-gray-500">Your daily health companion</p>
      </motion.div>

      {/* Streak and Points */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { 
            label: 'Current Streak', 
            value: streakDays, 
            unit: 'Days', 
            icon: <Calendar className="w-7 h-7" />,
            gradient: 'from-amber-400 to-orange-500'
          },
          { 
            label: 'Health Points', 
            value: points, 
            unit: 'HP', 
            icon: <Trophy className="w-7 h-7" />,
            gradient: 'from-purple-400 to-fuchsia-600'
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-5 rounded-2xl text-white backdrop-blur-lg bg-gradient-to-br ${item.gradient} shadow-lg`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">{item.icon}</div>
              <div>
                <p className="text-sm font-medium opacity-90">{item.label}</p>
                <p className="text-2xl font-bold">{item.value} <span className="text-lg">{item.unit}</span></p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daily Goals */}
      <section className="space-y-6">
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-gray-800 flex items-center gap-2"
        >
          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <Activity className="w-5 h-5" />
          </span>
          Daily Goals
        </motion.h3>
        
        <AnimatePresence>
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const colorClass = goal.color.split(' ')[0].replace('from-', '');
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="group relative bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${goal.color}`}>
                      {getIcon(goal.type)}
                    </div>
                    <div>
                      <h4 className="font-medium capitalize text-gray-800">{goal.type}</h4>
                      <p className="text-sm text-gray-500">
                        Target: {goal.target} {goal.unit}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {goal.current}
                    <span className="text-sm text-gray-400 ml-1">{goal.unit}</span>
                  </span>
                </div>

                <div className="space-y-4">
                  <Progress.Root 
                    className="h-3 bg-gray-100 rounded-full overflow-hidden relative"
                    value={progress}
                  >
                    <Progress.Indicator
                      className={`h-full transition-all duration-500 bg-gradient-to-r ${goal.color}`}
                      style={{ width: `${progress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white/80">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </Progress.Root>

                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-6"
                    value={[goal.current]}
                    max={goal.target}
                    step={1}
                    onValueChange={([value]) => updateGoal(goal.id, value)}
                  >
                    <Slider.Track className="bg-gray-100 relative grow rounded-full h-2">
                      <Slider.Range className={`absolute bg-gradient-to-r ${goal.color} rounded-full h-full`} />
                    </Slider.Track>
                    <Slider.Thumb
                      className={`block w-5 h-5 bg-white border-4 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-30 border-${colorClass} focus:ring-${colorClass}`}
                    />
                  </Slider.Root>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>

      {/* Achievements */}
      <section className="space-y-6">
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-gray-800 flex items-center gap-2"
        >
          <span className="bg-green-100 text-green-600 p-2 rounded-lg">
            <Trophy className="w-5 h-5" />
          </span>
          Recent Achievements
        </motion.h3>

        <div className="grid grid-cols-2 gap-5">
          {[
            {
              title: "7 Day Streak",
              description: "Consistent goal completion",
              icon: <Trophy className="w-7 h-7" />,
              gradient: "from-green-400 to-emerald-600"
            },
            {
              title: "Step Master",
              description: "10k steps for 5 days",
              icon: <Activity className="w-7 h-7" />,
              gradient: "from-blue-400 to-cyan-600"
            }
          ].map((achievement, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -3 }}
              className={`p-5 rounded-2xl text-white shadow-lg bg-gradient-to-br ${achievement.gradient}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">{achievement.icon}</div>
                <div>
                  <h4 className="text-lg font-semibold">{achievement.title}</h4>
                  <p className="text-sm opacity-90">{achievement.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Floating Celebration */}
      <AnimatePresence>
        {goals.some(g => g.current >= g.target) && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 bg-white p-4 rounded-xl shadow-xl border border-green-100 flex items-center gap-3"
          >
            <div className="bg-green-100 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Goal Achieved! 🎉</p>
              <p className="text-sm text-gray-500">Keep up the great work!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}