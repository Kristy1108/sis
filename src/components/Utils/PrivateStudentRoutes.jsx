import { Outlet, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateStudentRoutes = () => {
    const authToken = Cookies.get('studentAuthToken');
    return authToken ? <Outlet /> : <Navigate to="/studentLogin" />;
};

export default PrivateStudentRoutes;
