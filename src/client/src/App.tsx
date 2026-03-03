import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Tasks } from './pages/Tasks';
import { SelfTalkPage } from './pages/SelfTalkPage';
import { LogOut, CheckSquare, Mic } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar/Top Navigation */}
      <nav className="bg-white border-r border-gray-200 md:w-64 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            Better Every Day
          </h1>
        </div>

        <div className="flex-1 pt-6 px-4 space-y-2 flex flex-col md:block overflow-x-auto md:overflow-visible">
          <div className="flex md:flex-col gap-2">
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${location.pathname === '/' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <CheckSquare size={20} />
              Tasks
            </Link>
            <Link
              to="/selftalk"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${location.pathname === '/selftalk' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Mic size={20} />
              Self-Talk
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 mt-auto hidden md:block">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 w-full px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#fdfdfd]">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/selftalk"
          element={
            <ProtectedRoute>
              <SelfTalkPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
