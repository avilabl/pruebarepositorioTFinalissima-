import React, { useState, useEffect } from "react";
import '../Modal.css';

function BajaPuesto() {
  const [puestos, setPuestos] = useState([]);
  const [selectedPuesto, setSelectedPuesto] = useState("");
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar puestos activos al abrir el modal
  useEffect(() => {
    let mounted = true;
    async function fetchPuestos() {
      setMessage(null);
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/oficina/puestos/activos", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        // debug: ver estado de respuesta
        console.log("GET /puestos/activos status:", res.status);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }

        const data = await res.json();
        if (mounted) {
          console.log("puestos activos recibidos:", data);
          setPuestos(data);
        }
      } catch (err) {
        console.error("Error fetch puestos activos:", err);
        if (mounted) setMessage("Error al cargar los puestos activos: " + err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (showModal) fetchPuestos();

    return () => { mounted = false; };
  }, [showModal]);

  const handleBajaPuesto = async () => {
    setMessage(null);
    if (!selectedPuesto) {
      setMessage("Selecciona un puesto primero");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/oficina/puestos/baja/${selectedPuesto}`, // idPuesto en la URL
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      console.log("PUT /puestos/baja/:id status:", res.status);

      // manejar respuesta no-JSON con gracia
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }

      const data = await res.json();
      setMessage(data.message || "Baja realizada");
      // actualizar lista local
      setPuestos(prev => prev.filter(p => p.idPuesto !== Number(selectedPuesto)));
    } catch (err) {
      console.error("Error al dar de baja:", err);
      setMessage("Error al dar de baja: " + err.message);
    } finally {
      setShowModal(false);
      setSelectedPuesto("");
    }
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="boton-abrir baja-puesto">
      Baja Puesto
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Baja de Puesto</h2>

            {loading ? (
              <p>Cargando puestos...</p>
            ) : (
              <>
                <select
                  value={selectedPuesto}
                  onChange={(e) => setSelectedPuesto(e.target.value)}
                >
                  <option value="">Seleccione un puesto</option>
                  {puestos.map((p) => (
                    <option key={p.idPuesto} value={p.idPuesto}>
                      {p.nombrePuesto}
                    </option>
                  ))}
                </select>

                <div className="form-botones">
                  <button onClick={() => { setShowModal(false); setSelectedPuesto(""); }} className="boton-cancelar">
                    Cancelar
                  </button>
                  <button onClick={handleBajaPuesto} className="boton-guardar" disabled={!selectedPuesto}>
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

export default BajaPuesto;