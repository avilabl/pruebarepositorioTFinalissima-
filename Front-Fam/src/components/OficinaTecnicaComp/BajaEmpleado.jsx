import React, { useState, useEffect } from "react";
import '../Modal.css';

function BajaEmpleado() {
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState("");
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar empleados activos al abrir el modal
  useEffect(() => {
    let mounted = true;
    async function fetchEmpleados() {
      setMessage(null);
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/oficina/empleados/activos", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        console.log("GET /empleados/activos status:", res.status);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }

        const data = await res.json();
        if (mounted) {
          // Filtrar empleados sin nombre o apellido (por seguridad)
          const filtrados = data.filter(e => e.nombreEmpleado && e.apellidoEmpleado);
          setEmpleados(filtrados);
          console.log("Empleados activos:", filtrados);
        }
      } catch (err) {
        console.error("Error fetch empleados activos:", err);
        if (mounted) setMessage("Error al cargar empleados activos: " + err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (showModal) fetchEmpleados();
    return () => { mounted = false; };
  }, [showModal]);

  const handleBajaEmpleado = async () => {
    setMessage(null);
    if (!selectedEmpleado) {
      setMessage("Selecciona un empleado primero");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/oficina/empleados/baja/${selectedEmpleado}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      console.log("PUT /empleados/baja/:id status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }

      const data = await res.json();
      setMessage(data.message || "Empleado dado de baja correctamente");
      // actualizar lista local
      setEmpleados(prev => prev.filter(e => e.idEmpleado !== Number(selectedEmpleado)));
    } catch (err) {
      console.error("Error al dar de baja:", err);
      setMessage("Error al dar de baja: " + err.message);
    } finally {
      setShowModal(false);
      setSelectedEmpleado("");
    }
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="boton-abrir baja-empleado">
      Baja Empleado
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Baja de Empleado</h2>

            {loading ? (
              <p>Cargando empleados...</p>
            ) : (
              <>
                <select
                  value={selectedEmpleado}
                  onChange={(e) => setSelectedEmpleado(e.target.value)}
                >
                  <option value="">Seleccione un empleado</option>
                  {empleados.map(e => (
                    <option key={e.idEmpleado} value={e.idEmpleado}>
                      {e.nombreEmpleado} {e.apellidoEmpleado}
                    </option>
                  ))}
                </select>

                <div className="form-botones">
                  <button
                    onClick={() => { setShowModal(false); setSelectedEmpleado(""); }}
                    className="boton-cancelar"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBajaEmpleado}
                    className="boton-guardar"
                    disabled={!selectedEmpleado}
                  >
                    Confirmar Baja
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default BajaEmpleado;