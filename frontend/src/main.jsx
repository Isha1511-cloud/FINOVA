import React from 'react';import {createRoot} from 'react-dom/client';import {BrowserRouter,HashRouter} from 'react-router-dom';
import {MotionConfig} from 'framer-motion';import App from './App.jsx';import {AppProvider} from './context/AppContext.jsx';import './index.css';
// HashRouter lets the single-file build run from file:// with no server.
const Router=import.meta.env.VITE_HASH_ROUTER==='true'?HashRouter:BrowserRouter;
createRoot(document.getElementById('root')).render(<MotionConfig reducedMotion="user"><Router><AppProvider><App/></AppProvider></Router></MotionConfig>);
