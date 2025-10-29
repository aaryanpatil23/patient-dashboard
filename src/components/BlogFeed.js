import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import Loader from './Loader';

function BlogFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      const data = await fetchWithAuth('/articles'); // Public endpoint
      setArticles(data);
      setLoading(false);
    };
    loadArticles();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Health Feed</h1>
      <p className="text-lg text-slate-500 dark:text-slate-400">Articles from our expert doctors.</p>
      
      {loading ? <Loader /> : (
        <div className="space-y-6">
          {articles.map(article => (
            <div key={article.id} className="p-6 rounded-xl shadow-md card-glassmorphism">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{article.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                By {article.author || 'OPD Nexus Team'} on {new Date(article.published_at).toLocaleDateString('en-IN')}
              </p>
              <p className="text-slate-600 dark:text-slate-300 mt-4">{article.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default BlogFeed;
