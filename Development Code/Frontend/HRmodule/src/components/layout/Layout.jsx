import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, sidebarOpen, onMenuToggle, onCloseSidebar }) => {
  return (
    <div className="container">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        onCloseSidebar={onCloseSidebar}
      />
      
      <div className="mainContent">
        <Header onMenuToggle={onMenuToggle} />
        <main className="contentArea">
          {children}
        </main>
      </div>
    </div>
  );
};

export { Layout };
export default Layout;