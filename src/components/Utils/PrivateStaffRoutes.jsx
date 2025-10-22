import { Outlet, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateStaffRoutes = () => {
    const authToken = Cookies.get('staffAuthToken');
    return authToken ? <Outlet /> : <Navigate to="/staffLogin" />;
};

export default PrivateStaffRoutes;
