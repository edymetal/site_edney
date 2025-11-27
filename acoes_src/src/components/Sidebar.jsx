import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <i className="bi bi-graph-up-arrow"></i>
                    <span>StockDash</span>
                </div>
                <button className="close-btn" onClick={toggleSidebar}>
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                    <i className="bi bi-grid-1x2-fill"></i>
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/stocks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-list-ul"></i>
                    <span>Ações</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">E</div>
                    <div className="details">
                        <span className="name">Edney</span>
                        <span className="role">Investidor</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
