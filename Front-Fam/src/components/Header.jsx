import React, { useState } from "react";
import "./Header.css";
import { useNavigate } from 'react-router-dom';

const Header = ({ setUser, tiempoProduccion }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
      console.error('No se encontró usuario o token');
      return;
    }

    try {
      // Logout operario
      if (user.idRol === 4) {
        const response = await fetch('http://localhost:3000/operario/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idUsuario: user.idUsuario,
            tiempoProduccion: tiempoProduccion
          }),
        });

        if (!response.ok) {
          console.error('Error al cerrar sesión (operario):', response.statusText);
          return;
        }

        const dataLogout = await response.json();
        console.log('Logout operario:', dataLogout);
      }

      // Logout encargado
      if (user.idRol === 2) {
        const response = await fetch('http://localhost:3000/encargado/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idUsuario: user.idUsuario }),
        });

        if (!response.ok) {
          console.error('Error al cerrar sesión (encargado):', response.statusText);
          return;
        }

        const dataLogout = await response.json();
        console.log('Logout encargado:', dataLogout);
      }

      // Cierre de sesión local
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.error('Fallo al cerrar sesión:', err);
    }
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
    </header>
  );
};

export default Header;