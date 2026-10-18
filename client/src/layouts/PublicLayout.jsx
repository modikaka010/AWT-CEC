import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import LandingFooter from '../components/landing/LandingFooter';

/**
 * PublicLayout — used for: /, /about, /schemes, /news, /help
 * Auth pages (register, login, etc.) render WITHOUT this layout — they have
 * their own full-page card design.
 */
const PublicLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flex: 1 }}>
      <Outlet />
    </main>
    <LandingFooter />
  </div>
);

export default PublicLayout;
