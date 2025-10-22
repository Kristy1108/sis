import { Outlet, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateEmployeeRoutes = () => {
    const authToken = Cookies.get('employeeAuthToken');
    return authToken ? <Outlet /> : <Navigate to="/employeeLogin" />;
};

export default PrivateEmployeeRoutes;
