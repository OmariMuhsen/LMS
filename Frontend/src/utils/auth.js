import { useAuthStore } from "../store/auth";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Cookie from "js-cookie";
import Swal from "sweetalert2";

// Login function to authenticate user
export const login = async (email, password) => {
    try {
        // Send login request to the server with email and password
        const response = await axios.post('user/token/', {
            email: email,
            password: password
        });

        // Check if the response status is 200 (successful login)
        if (response.status === 200) {
            // Set the authentication tokens in cookies and user data in the store
            setAuthUser(response.data.access, response.data.refresh);
            alert("Login successful");
        }
        
        // Return the data and null error on success
        return { data: response.data, error: null };

    } catch (error) {
        // Return the error message if login fails
        return {
            data: null,
            error: error.response?.data?.detail || "Something went wrong", // Default error message
        };
    }
};

// Register function to create a new user
export const register = async (full_name, email, password, password2) => {
    try {
        // Send registration request to the server
        const { data } = await axios.post('user/register/', {
            full_name,
            email,
            password,
            password2
        });

        // After registration, automatically log in the user
        await login(email, password);
        alert("Registration successful");
        return { data, error: null };

    } catch (error) {
        // Return error if registration fails
        return {
            data: null,
            error: error.response?.data?.detail || "Something went wrong", // Default error message
        };
    }
};

// Logout function to clear user session
export const logout = () => {
    // Remove the access and refresh tokens from cookies
    Cookie.remove("access_token");
    Cookie.remove("refresh_token");

    // Reset the user data in the global state store
    useAuthStore.getState().setUser(null);
    alert("You have been logged out");
};

// Set user data based on existing tokens in cookies
export const setUser = async () => {
    // Get access and refresh tokens from cookies
    const access_token = Cookie.get("access_token");
    const refresh_token = Cookie.get("refresh_token");
    
    // If either token is missing, alert the user and exit
    if (!access_token || !refresh_token) {
        alert("Tokens do not exist");
        return;
    }

    // Check if the access token is expired
    if (isAccessTokenExpired(access_token)) {
        // If expired, get a new access token using the refresh token
        const response = await getRefreshedToken(refresh_token);
        // Set new tokens and user info in cookies and store
        setAuthUser(response.access, response.refresh);
    } else {
        // If the access token is still valid, set user with existing tokens
        setAuthUser(access_token, refresh_token);
    }
};

// Function to set authentication tokens and user info
export const setAuthUser = (access_token, refresh_token) => {
    // Save the access token in cookies with a 1-day expiry
    Cookie.set('access_token', access_token, {
        expires: 1, // 1 day expiry for access token
        secure: true, // Secure cookies (only sent over HTTPS)
    });

    // Save the refresh token in cookies with a 7-day expiry
    Cookie.set('refresh_token', refresh_token, {
        expires: 7, // 7 days expiry for refresh token
        secure: true, // Secure cookies (only sent over HTTPS)
    });

    // Decode the access token to extract user information
    const user = jwt_decode(access_token) ?? null;

    // If decoding the token returns a valid user, set it in the global store
    if (user) {
        useAuthStore.getState().setUser(user);
    }

    // Once user data is set, stop the loading state
    useAuthStore.getState().setLoading(false);
};

// Function to refresh access token using refresh token
export const getRefreshedToken = async () => {
    // Get the refresh token from cookies
    const refresh_token = Cookie.get("refresh_token");

    // Send a request to the backend to refresh the access token using the refresh token
    const response = await axios.post('token/refresh/', {
        refresh: refresh_token,
    });

    // Return the new tokens (access and refresh)
    return response.data;
};

// Function to check if the access token has expired
export const isAccessTokenExpired = (access_token) => {
    try {
        // Decode the access token to extract the expiration date
        const decodedToken = jwt_decode(access_token);
        
        // Check if the token's expiration time has passed (current time > expiration time)
        return decodedToken.exp < Date.now() / 1000; // Token expired if expiration time is in the past
    } catch (error) {
        console.log(error); // Log error if decoding fails
        return true; // If there's an issue decoding, assume the token is expired
    }
};
