import React from 'react';
// @refresh reset
import { RouterProvider } from 'react-router';
import { AuthProvider } from '@/app/context/AuthContext';
import { router } from '@/app/routes';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
