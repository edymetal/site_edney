import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/MainLayout.css';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="layout">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <Header toggleSidebar={toggleSidebar} />
                <main className="content-area">
                    <Outlet />
                </main>
            </div>
            {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
        </div>
    );
};

export default MainLayout;
