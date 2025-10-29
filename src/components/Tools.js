import React, { useState } from 'react';

function Tools() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);

  const calculateBmi = (e) => {
    e.preventDefault();
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(bmiValue);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Health Tools</h1>
      <div className="p-6 card-glassmorphism rounded-xl shadow-md max-w-lg">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">BMI Calculator</h2>
        <form onSubmit={calculateBmi} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Height (in cm)</label>
            <input 
              type="number" 
              value={height} 
              onChange={e => setHeight(e.target.value)} 
              className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Weight (in kg)</label>
            <input 
              type="number" 
              value={weight} 
              onChange={e => setWeight(e.target.value)} 
              className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium">Calculate</button>
        </form>

        {bmi && (
          <div className="mt-6">
            <p className="text-lg text-slate-500 dark:text-slate-400">Your BMI is:</p>
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{bmi}</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default Tools;
