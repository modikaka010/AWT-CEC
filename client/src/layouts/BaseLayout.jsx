import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import LandingFooter from '../components/landing/LandingFooter';
import NewsTicker from '../components/common/NewsTicker';
/**
 * BaseLayout — used for public pages (landing, about, schemes, news, help).
 * Auth pages render their own full-page card design.
 */
const BaseLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <NewsTicker />
    <main style={{ flex: 1 }}>
      <Outlet />
    </main>
    <LandingFooter />
  </div>
);

export default BaseLayout;