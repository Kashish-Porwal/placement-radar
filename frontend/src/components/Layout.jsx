import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Background3D from './Background3D';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      <Background3D />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {/* Subtle gradient orb for background ambiance */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary-light/20 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen opacity-50" />
          
          <div className="p-8 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
