import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Icons';

function AuthPage() {
    const [isRegister, setIsRegister] = useState(false);
    const { login, register, googleLogin } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailPasswordSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            if (isRegister) {
                await register(fullName, email, password);
            } else {
                await login(email, password);
            }
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    };
    
    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true); setError('');
        try {
            await googleLogin(credentialResponse.credential);
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-6 card-glassmorphism rounded-xl shadow-lg">
                <div className="flex justify-center"><Logo /></div>
                <h1 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200">
                    {isRegister ? 'Create Your Account' : 'Welcome to OPD Nexus'}
                </h1>
                <div className="flex justify-center border-b border-slate-200 dark:border-slate-700">
                    <button onClick={() => setIsRegister(false)} className={`px-4 py-2 text-sm font-medium ${!isRegister ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Login</button>
                    <button onClick={() => setIsRegister(true)} className={`px-4 py-2 text-sm font-medium ${isRegister ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Register</button>
                </div>
                <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-slate-700" />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-slate-700" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-slate-700" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Login')}
                    </button>
                </form>
                {!isRegister && (
                    <>
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300 dark:border-slate-600" /></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span></div>
                        </div>
                        <div className="flex justify-center">
                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google login failed.')} />
                        </div>
                    </>
                )}
                {error && <p className="text-sm text-center text-red-500 mt-4">{error}</p>}
            </div>
        </div>
    );
}
export default AuthPage;
