import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useApp();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>; // Simple loading or Spinner
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
