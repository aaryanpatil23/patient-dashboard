import React, { useState, useEffect } from 'react';
import { API_URL } from '../api'; // Use API_URL for consistency
import useDebounce from '../hooks/useDebounce';
import { SearchIcon } from './Icons';
import Loader from './Loader';

function MedicineSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    const search = async () => {
      setLoading(true);
      try {
        // This is a public endpoint, so we use standard fetch
        const response = await fetch(`${API_URL}/pharmacies/search?q=${debouncedQuery}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Failed to fetch pharmacies:", error);
      }
      setLoading(false);
    };
    search();
  }, [debouncedQuery]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Order Medicines</h1>
      <div className="relative w-full max-w-lg">
        <input 
          type="text" 
          placeholder="Search for a pharmacy by name..."
          className="w-full p-3 pl-10 border rounded-full dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      </div>

      <div className="space-y-4">
        {loading && <Loader />}
        {results.map(pharmacy => (
          <div key={pharmacy.id} className="p-6 card-glassmorphism rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{pharmacy.name}</h2>
              <p className="text-slate-600 dark:text-slate-300 mt-1">{pharmacy.address}</p>
            </div>
            {pharmacy.phone_number && (
              <a 
                href={`tel:${pharmacy.phone_number}`}
                className="flex-shrink-0 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Order / Inquire
              </a>
            )}
          </div>
        ))}
        {!loading && debouncedQuery.length > 1 && results.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400">No pharmacies found matching your search.</p>
        )}
      </div>
    </div>
  );
}
export default MedicineSearch;