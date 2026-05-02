import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
