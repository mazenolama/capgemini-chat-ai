// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense } from 'react'

import AppLayout from '@/layouts/AppLayout'
// Pages
import ChatShell from './pages/chat/ChatShell'
import Settings from './pages/settings/Settings'
import NotFound from './pages/dashboard/NotFound'
import { Toaster } from 'react-hot-toast'


export default function App() {

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8">Loading…</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout />
            }
          >
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="chat" element={<ChatShell />} />
            <Route path="chat/:id" element={<ChatShell />} />
            <Route path="settings" element={<Settings />} />

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Suspense>
    </BrowserRouter>
  )
}
