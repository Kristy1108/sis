import { Outlet, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateSchoolRoutes = () => {
    const authToken = Cookies.get('sisAuthToken');
    return authToken ? <Outlet /> : <Navigate to="/schoolLogin" />;
};

export default PrivateSchoolRoutes;
