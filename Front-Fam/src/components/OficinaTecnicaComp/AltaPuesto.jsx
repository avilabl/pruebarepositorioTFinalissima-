import React, { useState, useEffect } from "react";
import '../Modal.css';

function AltaPuesto() {
  const [puestos, setPuestos] = useState([]);
  const [selectedPuesto, setSelectedPuesto] = useState("");
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar puestos inactivos al abrir el modal
  useEffect(() => {
    if (showModal) {
      fetch("http://localhost:3000/oficina/puestos/inactivos", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((res) => res.json())
        .then((data) => setPuestos(data))
        .catch(() => setMessage("Error al cargar los puestos inactivos"));
    }
  }, [showModal]);

  const handleAltaPuesto = async () => {
    if (!selectedPuesto) {
      setMessage("Selecciona un puesto primero");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/oficina/puestos/alta/${selectedPuesto}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setPuestos(puestos.filter(p => p.nombrePuesto !== selectedPuesto)); // sacar de la lista
      } else {
        setMessage(data.error || "Error al dar de alta el puesto");
      }
    } catch (error) {
      setMessage("Error de conexión con el servidor");
    }

    setShowModal(false);
    setSelectedPuesto("");
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="boton-abrir alta-puesto">
      Alta Puesto
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Alta de Puesto</h2>
            <select
              value={selectedPuesto}
              onChange={(e) => setSelectedPuesto(e.target.value)}
            >
              <option value="">Seleccione un puesto</option>
              {puestos.map((p) => (
                <option key={p.idPuesto} value={p.nombrePuesto}>
                  {p.nombrePuesto}
                </option>
              ))}
            </select>

            <div className="form-botones">
              <button onClick={() => setShowModal(false)} className="boton-cancelar">
                Cancelar
              </button>
              <button onClick={handleAltaPuesto} className="boton-guardar">
                Confirmar Alta
              </button>
            </div>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default AltaPuesto;