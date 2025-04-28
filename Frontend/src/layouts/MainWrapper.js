import {useEffect, useState} from "react";
import {setUser} from "../utils/auth";


const MainWrapper = ({children}) => {
    const [loading, setLoading] = useState(true);  // State to track loading status

    useEffect(() => {
        const handler = async()=> {
           setLoading(true);
           await setUser();

           setLoading(false);

         };
        handler();  // Call the handler function to set the user and update loading status
    }, []);  // Empty dependency array to run effect only once on mount

    return <> {loading ? null : children}</>;  // Render children if not loading, otherwise render null
};

export default MainWrapper;