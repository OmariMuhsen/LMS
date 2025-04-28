import { Navigate } from 'react-router-dom';  // Importing Navigate from react-router-dom to redirect users
import { useAuthStore } from '../store/auth';  // Importing custom authentication store to check login status

// PrivateRoute component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
    // Using the useAuthStore hook to get the current authentication status from the store
    const loggedIn = useAuthStore(state => state.isLoggedIn);

    // If the user is logged in, render the children components (protected route content)
    // Otherwise, redirect them to the login page
    return loggedIn ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;  // Exporting the PrivateRoute component for use in other parts of the app
