import React, { useState } from "react";
import "./Header.css";
import { useNavigate } from 'react-router-dom';
import EmpleadoNuevo from './OficinaTecnicaComp/CargarEmpleado'


const Header = ({ setUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();


  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src="/logoFAM.png" alt="Logo Empresa" className="logo" />
      </div>

      <div className="user-section">
        <div className="dropdown-wrapper">
          <button className="login-btn" onClick={toggleDropdown}>
            Logout ⬇
          </button>
          <div className={`dropdown ${dropdownOpen ? "open" : ""}`}>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      </div>
      <div> <EmpleadoNuevo />
      </div>

    </header>
  );
};

export default Header;