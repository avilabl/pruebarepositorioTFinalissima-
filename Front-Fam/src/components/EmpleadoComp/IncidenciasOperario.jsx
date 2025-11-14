import React, { useEffect, useState } from 'react';
import './IncidenciasOperario.css';

const IncidenciasOperario = ({
  incidence,
  onChange,
  type,
  onTypeChange,
  onSelectImage,
  selectedImage,
  showBuscarButton = false,
  onSuccess,
  rol = 4, // 4 = operario (por defecto), 2 = encargado
  idProceso // para encargado, debe venir por props
}) => {
  const [incidenceTypes, setIncidenceTypes] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [internalIdProceso, setInternalIdProceso] = useState(1); // solo para operario

  // Solo para encargado (cuando showBuscarButton es true)
  const [productos, setProductos] = useState([]);
  const [nombreProductoSeleccionado, setNombreProductoSeleccionado] = useState('');

  // Cargar tipos de incidencias
  useEffect(() => {
    const fetchIncidenceTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        let url;
        if (rol === 2) {
          url = 'http://localhost:3000/encargado/tipoincidencias';
        } else {
          url = 'http://localhost:3000/operario/tipoincidencias';
        }
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Error al obtener tipos de incidencias');
        const data = await response.json();
        if (Array.isArray(data)) setIncidenceTypes(data);
      } catch (error) {
        console.error('Error al hacer fetch:', error);
      }
    };
    fetchIncidenceTypes();
  }, [rol]);

  // Cargar productos solo para encargado (cuando showBuscarButton es true)
  useEffect(() => {
    if (!showBuscarButton) return;
    const fetchProductos = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch('http://localhost:3000/encargado/productos', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) throw new Error('Error al obtener productos');
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };
    fetchProductos();
  }, [showBuscarButton]);

  // Cargar planos según el flujo
  useEffect(() => {
    const fetchPlanos = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      if (showBuscarButton && nombreProductoSeleccionado) {
        // Encargado: fetch de planos según producto seleccionado
        const response = await fetch('http://localhost:3000/encargado/producto/' + nombreProductoSeleccionado, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) return;
        const dataProducto = await response.json();
        setPlanos(dataProducto);
      } else if (!showBuscarButton && rol === 4) {
        // Operario: igual que antes
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        const response = await fetch('http://localhost:3000/operario/producto/' + user.idUsuario, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) return;
        const dataProducto = await response.json();
        setPlanos(dataProducto);
      }
    };
    fetchPlanos();
  }, [showBuscarButton, nombreProductoSeleccionado, rol]);

  // Enviar incidencia (sin cambios)
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const selected = incidenceTypes.find(t => t.tipoIncidencia === type);
      if (!selected) return;
      const proceso = rol === 2 ? idProceso : internalIdProceso;
      let url;
      if (rol === 2) {
        url = 'http://localhost:3000/encargado/incidencia';
      } else {
        url = 'http://localhost:3000/operario/incidencia';
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idProceso: proceso,
          descripcion: incidence,
          idTipoIncidencia: selected.idTipoIncidencia
        })
      });
      if (!res.ok) throw new Error('Error al cargar la incidencia');
      alert('Incidencia cargada correctamente');
      if (onSuccess) onSuccess();
    } catch (err) {
      alert('Error al cargar la incidencia');
      console.error(err);
    }
  };

  return (
    <div className="product-info">
      <div className="product-plan">
        <h3>Planos de Productos</h3>
        {/* Select solo para encargado */}
        {showBuscarButton && (
          <div className="selector-producto">
            <select
              value={nombreProductoSeleccionado}
              onChange={e => setNombreProductoSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un producto</option>
              {productos.map((prod, idx) => (
                <option key={idx} value={prod.nombreProducto}>
                  {prod.nombreProducto}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="plan-list">
          {planos.length > 0 ? (
            planos.map((plano, index) => (
              <button key={index} onClick={() => onSelectImage(plano.urlPlano)}>
                {plano.nombrePlano || `Plano ${index + 1}`}
              </button>
            ))
          ) : (
            <p>No hay planos disponibles</p>
          )}
        </div>
      </div>

      <div className="product-view">
        <h3>Vistas</h3>
        {selectedImage ? (
          <img src={selectedImage} alt="Vista seleccionada" />
        ) : (
          <p>Selecciona un plano para verlo aquí</p>
        )}
      </div>

      <div className="incident-section">
        <h3>Cargar Incidencia</h3>
        <select id="type" value={type} onChange={onTypeChange}>
          <option value="">Seleccione una opción</option>
          {incidenceTypes.map((tipo) => (
            <option key={tipo.idTipoIncidencia} value={tipo.tipoIncidencia}>
              {tipo.tipoIncidencia}
            </option>
          ))}
        </select>

        <textarea
          value={incidence}
          onChange={onChange}
          placeholder="Describe la incidencia..."
        />
        <button onClick={handleSubmit} disabled={!incidence || !type}>
          Cargar Incidencia
        </button>
      </div>
    </div>
  );
};

export default IncidenciasOperario;