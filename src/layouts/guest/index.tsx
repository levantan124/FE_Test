import { AppLayout } from '../app';
import { Outlet } from 'react-router-dom';
export const GuestLayout = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};