import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChildDetails from './pages/ChildDetails';
import Settings from './pages/Settings';
import ProgressLog from './pages/ProgressLog';
import PageTransition from './components/PageTransition';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/child/:id" element={<PageTransition><ChildDetails /></PageTransition>} />
        <Route path="/child/:childId/subject/:subjectId/milestone/:milestoneId" element={<PageTransition><ProgressLog /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
