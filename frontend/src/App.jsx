import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { disconnectSocket } from './socket/socket.server';
import { Loader2 } from 'lucide-react';

// Components
const HomePage = lazy(() => import('./pages/HomePage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));

/**
 * App
 * 
 * This component serves as the main application entry point, setting up the routing for the application.
 * 
 * Features:
 * - Initializes a global toaster for displaying notifications.
 * - Defines routes for the HomePage and EditorPage components.
 * - Utilizes lazy loading with suspense to load components asynchronously.
 * 
 * Effects:
 * - Cleans up the socket connection when the component unmounts by calling `disconnectSocket()` in the `useEffect` hook.
 */

const App = () => {

  useEffect(() => {
    return () => {
      disconnectSocket();
    }
  }, []);

  return (
    <React.Fragment>
      <Toaster />
      <Routes>
        <Route path='/' element={<Suspense fallback={<SuspenseLoader />}><HomePage /></Suspense>} />
        <Route path='/editor/:roomId/:username' element={<Suspense fallback={<SuspenseLoader />}><EditorPage /></Suspense>} />
      </Routes>
    </React.Fragment>
  );
}

export default App;

/**
 * SuspenseLoader
 * 
 * This component is a fallback component used with React's <Suspense /> component to
 * display a loading animation while a component is asynchronously loaded.
 * 
 * Features:
 * - Displays a centered Loader2 component which is animated to spin.
 * - Has a height of the entire screen to ensure it covers all other content.
 * 
 * Usage:
 * <Suspense fallback={<SuspenseLoader />}>
 *   <AsyncComponent />
 * </Suspense>
 */
function SuspenseLoader() {
  return (
    <section className='flex justify-center items-center h-screen'>
      <div className='flex flex-col justify-center items-center gap-2'>
        <Loader2 className="w-14 h-14 animate-spin text-blue-500" />
      </div>
    </section>
  );
}
