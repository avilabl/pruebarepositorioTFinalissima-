import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import './CargarTarea.css';

function CargarTarea() {
  // Estados para formulario
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const token = localStorage.getItem('token'); 


  useEffect(() => {
    if (!token) {
      console.error('Token no encontrado');
      return;
    }

    
    fetch("http://localhost:3000/oficina/producto", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === false) {
          alert(`Error: ${data.message}`);
          return;
        }
        setProductos(data); 
      })
      .catch(err => console.error('Error al cargar productos:', err));
  }, []);

  
  const handleCantidadChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setCantidad(value);
    }
  };

  // Manejador de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!productoSeleccionado || !cantidad || !fechaEntrega) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const producto = productos.find(p => p.idProducto === parseInt(productoSeleccionado));
    if (!producto) {
      alert('Producto no encontrado');
      return;
    }

    // Construir nombreProceso
    const nombreProceso = `${producto.nombreProducto}-${cantidad}`;

    // DEFINICIÓN EXPLÍCITA DEL ESTADO DEL PRODUCTO (EVITA ERROR DE BACKEND)
    const estadoProducto = 'pendiente';

    // Objeto a enviar al backend
    const nuevoProceso = {
      idProducto: producto.idProducto,
      nombreProceso,
      cantidadProducto: parseInt(cantidad),
      estadoProducto,
      fechaEntrega
    };

    try {
      const res = await fetch("http://localhost:3000/oficina/proceso", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoProceso)
      });

      if (res.ok) {
        alert('Proceso creado exitosamente');
        // Resetear formulario
        setProductoSeleccionado('');
        setCantidad('');
        setFechaEntrega('');
      } else {
        const errorData = await res.json();
        alert(`Error al crear proceso: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error de red:', err);
      alert('Error de red al crear el proceso');
    }
  };

  // Renderizado del formulario
  return (
    <Form onSubmit={handleSubmit} className="cargar-tarea-container">
      <div className="cargar-tarea-titulo-wrapper">
        <h5 className="monitoreo-titulo">Cargar Tarea</h5>
      </div>

      {/* Primera fila: Producto + Cantidad */}
      <Row className="align-items-center cargar-tarea-row">
        <Col xs="6">
          <Form.Group controlId="formProducto" className="d-flex align-items-center">
            <Form.Label className="mb-0 me-2">Producto:</Form.Label>
            <Form.Select
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
              required
              className="cargar-tarea-select"
            >
              <option value="">Selecciona un producto</option>
              {productos.map((prod) => (
                <option key={prod.idProducto} value={prod.idProducto}>{prod.nombreProducto}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs="4">
          <Form.Group controlId="formCantidad" className="d-flex align-items-center">
            <Form.Label className="mb-0 me-2">Cantidad:</Form.Label>
            <Form.Control
              type="text"
              value={cantidad}
              onChange={handleCantidadChange}
              maxLength={4}
              required
              className="cargar-tarea-input"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Segunda fila: Fecha de Entrega + Botón */}
      <Row className="align-items-center cargar-tarea-row mt-2">
        <Col xs="6">
          <Form.Group controlId="formFechaEntrega" className="d-flex align-items-center">
            <Form.Label className="mb-0 me-2">Entrega:</Form.Label>
            <Form.Control
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              required
              className="cargar-tarea-input"
            />
          </Form.Group>
        </Col>
        <Col xs="2" className="d-flex align-items-end">
          <Button variant="primary" type="submit" className="cargar-tarea-boton">
            Cargar
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default CargarTarea;