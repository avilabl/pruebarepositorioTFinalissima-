import React, { useState } from "react";
import "../Modal.css";

export default function CrearPuesto() {
  const [showModal, setShowModal] = useState(false);
  const [nombrePuesto, setNombrePuesto] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/oficina/puestos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // token si corresponde
        },
        body: JSON.stringify({ nombrePuesto }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al crear el puesto");
      }

      const data = await response.json();
      setMensaje(`${data.message} (ID: ${data.idPuesto})`);
      setNombrePuesto("");

      // opcional: cerrar el modal después de crear
      setTimeout(() => {
        setShowModal(false);
        setMensaje(null);
      }, 2000);
    } catch (err) {
      setError(` ${err.message}`);
    }
  };

  return (
    <div>
      <button className="boton-abrir crear-puesto" onClick={() => setShowModal(true)}>
         Crear Puesto
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Nuevo Puesto</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nombre del Puesto"
                value={nombrePuesto}
                onChange={(e) => setNombrePuesto(e.target.value)}
                required
              />
              <div className="form-botones">
                <button
                  type="button"
                  className="boton-cancelar"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="boton-guardar">
                  Crear
                </button>
              </div>
            </form>

            {mensaje && <p className="mensaje-exito">{mensaje}</p>}
            {error && <p className="mensaje-error">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}