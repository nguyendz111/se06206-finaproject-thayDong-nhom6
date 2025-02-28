import { Outlet } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-800">
      {/* Sidebar cố định bên trái */}
      <SidebarMenu className="w-64 flex-shrink-0" />

      {/* Nội dung trang sẽ thay đổi dựa trên route */}
      <div className="flex-grow overflow-auto p-4">
        <Outlet />  {/* Hiển thị HomePage, Board, Profile,... */}
      </div>
    </div>
  );
};

export default Layout;
