import axios from 'axios';

// Create instance
const api = axios.create({
    baseURL: 'http://localhost:5002/api' // Adjust if deployment URL differs
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        // We will manage token in AuthContext, but interceptors outside React components 
        // can't easily access React Context directly. 
        // Common pattern: Store token in memory variable exported from a closure 
        // OR just simple localStorage for valid persistence across refreshes (User asked for "NOT localStorage - store in React state").
        // If "NOT localStorage", then on page refresh, user IS logged out? 
        // That is the implication of "in-memory only".
        // Use a mutable variable or let the AuthContext inject the token into headers for every request it makes, 
        // but for global axios usage, we need a way.
        // I will implement a `setAuthToken` utility function that the Context calls.

        // For strictly "in memory", this interceptor might rely on a module-level variable
        // created here.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let token = null;

export const setAuthToken = (newToken) => {
    token = newToken;
};

export default api;
