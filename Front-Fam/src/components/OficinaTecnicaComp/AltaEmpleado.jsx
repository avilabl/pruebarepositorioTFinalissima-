import React, { useState, useEffect } from "react";
import '../Modal.css';

function AltaEmpleado() {
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState("");
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar empleados inactivos al abrir el modal
  useEffect(() => {
    let mounted = true;

    async function fetchEmpleados() {
      setMessage(null);
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/oficina/empleados/inactivos", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        console.log("GET /empleados/inactivos status:", res.status);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }

        const data = await res.json();
        if (mounted) {
          const filtrados = data.filter(e => e.nombreEmpleado && e.apellidoEmpleado);
          setEmpleados(filtrados);
          console.log("Empleados inactivos:", filtrados);
        }
      } catch (err) {
        console.error("Error fetch empleados inactivos:", err);
        if (mounted) setMessage("Error al cargar empleados inactivos: " + err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (showModal) fetchEmpleados();

    return () => { mounted = false; };
  }, [showModal]);

  // Dar de alta al empleado seleccionado
  const handleAltaEmpleado = async () => {
    setMessage(null);
    if (!selectedEmpleado) {
      setMessage("Selecciona un empleado primero");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/oficina/empleados/alta/${selectedEmpleado}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      console.log("PUT /empleados/alta/:id status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }

      const data = await res.json();
      setMessage(data.message || "Empleado dado de alta correctamente");
      // actualizar lista local
      setEmpleados(prev => prev.filter(e => e.idEmpleado !== Number(selectedEmpleado)));
    } catch (err) {
      console.error("Error al dar de alta:", err);
      setMessage("Error al dar de alta: " + err.message);
    } finally {
      setShowModal(false);
      setSelectedEmpleado("");
    }
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="boton-abrir alta-empleado">
      Alta Empleado
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Alta de Empleado</h2>

            {loading ? (
              <p>Cargando empleados inactivos...</p>
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
                    onClick={handleAltaEmpleado}
                    className="boton-guardar"
                    disabled={!selectedEmpleado}
                  >
                    Confirmar Alta
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

export default AltaEmpleado;