import { Outlet, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateTeacherRoutes = () => {
    const authToken = Cookies.get('teacherAuthToken');
    return authToken ? <Outlet /> : <Navigate to="/teacherLogin" />;
};

export default PrivateTeacherRoutes;
