import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet from React Router
import Header from './components/Header';
import SideBar from './components/SideBar'; // Import SideBar component
import Footer from './components/Footer';


function App() {
  return (
     <div className='grid grid-cols-12'>
      <div className='sm:col-span-2'><SideBar /></div>
      <div className='col-span-12 sm:col-span-10'>
      <Header />
        <Outlet />
        <Footer />
        </div>
     </div>
  );
}

export default App;

