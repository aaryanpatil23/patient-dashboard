import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import Loader from './Loader';
import { DocumentIcon } from './Icons'; // Assuming DocumentIcon exists

function MyRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      const data = await fetchWithAuth('/patient/my-records');
      setRecords(data);
      setLoading(false);
    };
    loadRecords();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">My Medical Records</h1>
      <p className="text-lg text-slate-500 dark:text-slate-400">A history of all your past consultations.</p>
      
      {loading ? <Loader /> : (
        <div className="space-y-6">
          {records.length === 0 && <p className="text-slate-500 dark:text-slate-400">No medical records found.</p>}
          {records.map(record => (
            <div key={record.id} className="p-6 card-glassmorphism rounded-xl shadow-md">
              <div className="flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Consultation on {new Date(record.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </h2>
              </div>
              
              <div className="mt-4 space-y-3">
                <InfoRow label="Complaint" value={record.complaint} />
                <InfoRow label="Diagnosis" value={record.diagnosis} />
                <InfoRow label="Advice" value={record.advice} />
                
                {record.medicines?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">Medicines Prescribed:</h3>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                      {record.medicines.map((med, i) => <li key={i}>{med.name} ({med.dosage}, {med.frequency}, {med.duration})</li>)}
                    </ul>
                  </div>
                )}
                {record.tests?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">Tests Advised:</h3>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                      {record.tests.map((test, i) => <li key={i}>{test}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// A small helper component
const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <h3 className="font-semibold text-slate-700 dark:text-slate-300">{label}:</h3>
      <p className="text-slate-600 dark:text-slate-400">{value}</p>
    </div>
  );
};

export default MyRecords;