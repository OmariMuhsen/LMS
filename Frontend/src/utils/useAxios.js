import axios from "axios";
import { API_BASE_URL } from "./constanats";  // Importing base URL for API requests
import { getRefreshToken, isAccessTokenExpired, setAuthUser } from "./auth";  // Importing utility functions for handling authentication
import Cookie from "js-cookie";  // Library for working with cookies

const useAxios = () => {
    // Get access token and refresh token from cookies
    const accessToken = Cookie.get("access_token");
    const refreshToken = Cookie.get("refresh_token");

    // Create an Axios instance with the base URL and Authorization header
    const axiosInstance = axios.create({
        baseURL: API_BASE_URL,  // API base URL
        headers: { Authorization: `Bearer ${accessToken}` },  // Attach the access token to all outgoing requests
    });

    // Intercept requests to check if the access token is expired
    axiosInstance.interceptors.request.use(async (req) => {
        // Check if the access token is expired
        if (!isAccessTokenExpired(accessToken)) {
            return req;  // If not expired, proceed with the request as usual
        }

        // If the access token is expired, get a new one using the refresh token
        const response = await getRefreshToken(refreshToken);
        
        // Update the user with the new tokens
        setAuthUser(response.data?.access, response.data?.refresh);

        // Update the Authorization header with the new access token
        req.headers.Authorization = `Bearer ${response.data?.access}`;

        return req;  // Return the modified request
    });

    return axiosInstance;  // Return the Axios instance with the interceptor
};

export default useAxios;  // Export the hook for use in other parts of the app
