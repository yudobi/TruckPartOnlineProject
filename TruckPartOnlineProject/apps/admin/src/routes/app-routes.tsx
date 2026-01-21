import MainLayout from '@/components/layout/main-layout';
import NotFound from '@/components/utils/NotFound';
import Home from '@/pages/home';
import Login from '@/pages/login';
import { Routes, Route } from 'react-router';


const AppRoutes = () => {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<MainLayout />}>
                <Route path="/home" element={<Home />} />
            </Route>

            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
