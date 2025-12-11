/*import React, { useState, useEffect } from "react";
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

export default AltaPuesto;*/

import React, { useState, useEffect } from "react";
import '../Modal.css'; // Asegúrate de que este path sea correcto si estás usando Modal.css o Modal2.css

function AltaPuesto() {
    const [puestos, setPuestos] = useState([]);
    const [selectedPuesto, setSelectedPuesto] = useState("");
    const [message, setMessage] = useState({ text: null, type: null }); 
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const updateMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: null, type: null }), 3500);
    };

    // Cargar puestos inactivos al abrir el modal
    useEffect(() => {
        let mounted = true;

        async function fetchPuestos() {
            updateMessage(null, null);
            setLoading(true);
            try {
                const res = await fetch("http://localhost:3000/oficina/puestos/inactivos", {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                });

                console.log("GET /puestos/inactivos status:", res.status);
                
                if (!res.ok) {
                    const text = await res.text();
                    console.error(`ERROR DEL BACKEND AL CARGAR PUESTOS INACTIVOS: ${text}`);
                    throw new Error("Fallo la carga de puestos inactivos.");
                }
                
                const data = await res.json();
                if (mounted) {
                    setPuestos(data);
                }
            } catch (err) {
                console.error("Error fetch puestos inactivos:", err);
                if (mounted) updateMessage("Error al cargar los puestos inactivos. Intente de nuevo.", 'error');
            } finally {
                if (mounted) setLoading(false);
            }
        }

        if (showModal) fetchPuestos();
        return () => { mounted = false; };
    }, [showModal]);

    const handleAltaPuesto = async () => {
        updateMessage(null, null);
        if (!selectedPuesto) {
            updateMessage("Selecciona un puesto primero.", 'error');
            return;
        }

        // NUEVO: Buscar el puesto seleccionado por ID antes de la alta
        const puestoParaAlta = puestos.find(
            p => p.idPuesto === Number(selectedPuesto)
        );

        try {
            const res = await fetch(
                `http://localhost:3000/oficina/puestos/alta/${selectedPuesto}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                }
            );

            console.log("PUT /puestos/alta/:id status:", res.status);

            if (!res.ok) {
                const text = await res.text();
                console.error(`ERROR DEL BACKEND AL DAR DE ALTA EL PUESTO: ${text}`);
                throw new Error("No se pudo completar el alta del puesto. Revise el log.");
            }

            // Leemos el body
            await res.json();
            
            // MODIFICACIÓN CLAVE: Usar el nombre del puesto en el mensaje de éxito
            if (puestoParaAlta) {
                 updateMessage(
                    `Puesto "${puestoParaAlta.nombrePuesto}" dado de alta correctamente.`, 
                    'success'
                 );
            } else {
                 updateMessage("Puesto dado de alta correctamente.", 'success');
            }
            
            // Eliminar el puesto de la lista local
            setPuestos(prev => prev.filter(p => p.idPuesto !== Number(selectedPuesto))); 
        } catch (err) {
            console.error("Error al dar de alta (frontend):", err);
            updateMessage(err.message || "Ocurrió un error de conexión con el servidor.", 'error');
        } finally {
            setShowModal(false);
            setSelectedPuesto("");
        }
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
                        {loading ? (
                            <p>Cargando puestos inactivos...</p>
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
                                    <button onClick={handleAltaPuesto} className="boton-guardar" disabled={!selectedPuesto}>
                                        Confirmar Alta
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {message.text && <p className={`message message-${message.type}`}>{message.text}</p>}
        </div>
    );
}

export default AltaPuesto;