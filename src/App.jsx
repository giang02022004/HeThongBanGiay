import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CareerPathway from './pages/CareerPathway';
import QuizSession from './pages/QuizSession';
import QuizResult from './pages/QuizResult';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/common/AdminRoute';
import Profile from './pages/Profile';
import AIChatBot from './components/AIChatBot';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/career-pathway" element={
            <PrivateRoute>
              <CareerPathway />
            </PrivateRoute>
          } />
          <Route path="/quiz/:id" element={
            <PrivateRoute>
              <QuizSession />
            </PrivateRoute>
          } />
          <Route path="/quiz-result/:id" element={
            <PrivateRoute>
              <QuizResult />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <AIChatBot />
      </Router>
    </AuthProvider>
  );
}

export default App;
