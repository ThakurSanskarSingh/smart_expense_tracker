/**
 * @fileoverview Main responsive layout shell component with sidebar and bottom-bar.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import BottomNav from './BottomNav.jsx';
import Toast from '../common/Toast.jsx';

export default function Layout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <Toast />
    </div>
  );
}
