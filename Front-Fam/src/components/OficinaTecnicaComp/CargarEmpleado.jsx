import React, { useState, useEffect } from 'react';
import '../Modal.css';

const EmpleadoNuevo = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [roles, setRoles] = useState([]);

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  
  useEffect(() => {
    const token = localStorage.getItem('token');
  }, []);

  
  useEffect(() => {
    if (mostrarModal) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:3000/oficina/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Error en la autenticación o en la petición');
          return res.json();
        })
        .then(data => {
          setRoles(data);
        })
        .catch(err => console.error('Error al obtener roles:', err));
    }
  }, [mostrarModal]);

 
  const manejarSubmit = (e) => {
    e.preventDefault();

    const nombreEmpleado = e.target.nombreEmpleado.value;
    const apellidoEmpleado = e.target.apellidoEmpleado.value;
    const dniEmpleado = e.target.dniEmpleado.value;
    const direccionEmpleado = e.target.direccionEmpleado.value;
    const telefonoEmpleado = e.target.telefonoEmpleado.value;
    const nombreUsuario = e.target.nombreUsuario.value;
    const pass = e.target.pass.value;
    const idRol = Number(e.target.idRol.value);
    //falta fechaIngreso


    const token = localStorage.getItem('token');

    fetch('http://localhost:3000/oficina/newempleado', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombreEmpleado,
        apellidoEmpleado,
        dniEmpleado,
        direccionEmpleado,
        telefonoEmpleado,
        nombreUsuario,
        pass,
        idRol
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Error en la carga de datos del empleado:', data.error);
        } else {
          console.log('Empleado creado exitosamente:', data);
        }
      })
      .catch(err => {
        console.error('Error en la solicitud POST:', err);
      });

    cerrarModal();
  };

  return (
    <div>
      <button className="boton-abrir cargar-empleado" onClick={abrirModal}>Cargar Empleado</button>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Datos Nuevo Empleado</h2>
            <form onSubmit={manejarSubmit} className="formulario-empleado">
              <div className="form-grupo">
                <label>Nombre:</label>
                <input type="text" name="nombreEmpleado" required />
              </div>
              <div className="form-grupo">
                <label>Apellido:</label>
                <input type="text" name="apellidoEmpleado" required />
              </div>
              <div className="form-grupo">
                <label>DNI:</label>
                <input type="text" name="dniEmpleado" required />
              </div>
              <div className="form-grupo">
                <label>Dirección:</label>
                <input type="text" name="direccionEmpleado" required />
              </div>
              <div className="form-grupo">
                <label>Teléfono:</label>
                <input type="text" name="telefonoEmpleado" required />
              </div>

              <div className="form-grupo">
                <label>Usuario:</label>
                <input type="text" name="nombreUsuario" required />
              </div>
              <div className="form-grupo">
                <label>Contraseña:</label>
                <input type="text" name="pass" required />
              </div>

              <div className="form-grupo">
                <label>Rol:</label>
                <select name="idRol" required defaultValue="">
                  <option value="" disabled>Seleccionar rol</option>
                  {roles.map((rol) => {
                    let nombreVisible = '';
                    if (rol.idRol === 2) nombreVisible = 'Encargado';
                    else if (rol.idRol === 3) nombreVisible = 'Oficina';
                    else if (rol.idRol === 4) nombreVisible = 'Empleado';
                    else nombreVisible = rol.nombreRol;

                    return (
                      <option key={rol.idRol} value={rol.idRol}>
                        {nombreVisible}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-botones">
                <button type="button" onClick={cerrarModal} className="boton-cancelar">Cancelar</button>
                <button type="submit" className="boton-guardar">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpleadoNuevo;