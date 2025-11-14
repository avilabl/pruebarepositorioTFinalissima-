import React, { useEffect, useState } from "react";
import "./Monitoreo.css";

const Monitoreo = () => {
  const [procesos, setProcesos] = useState([]);
  const [expandidoId, setExpandidoId] = useState(null);

  useEffect(() => {
    const fetchProcesos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/oficina/procesos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Error al obtener procesos");

        const data = await response.json();
        setProcesos(data);
      } catch (error) {
        console.error("Error al obtener procesos:", error);
      }
    };

    fetchProcesos();
  }, []);

  const toggleExpandir = (id) => {
    setExpandidoId(expandidoId === id ? null : id);
  };

  const renderFila = (proceso, color, tipo) => {
    const nombreEmpleado = proceso.nombreEmpleado
      ? `${proceso.nombreEmpleado} ${proceso.apellidoEmpleado}`
      : "Sin asignar";
    const nombrePuesto = proceso.nombrePuesto || "Sin puesto";

    const esExpandido = expandidoId === proceso.idProceso;

    return (
      <div key={proceso.idProceso}>
        <div
          className="monitoreo-fila"
          onClick={() => toggleExpandir(proceso.idProceso)}
          style={{ cursor: "pointer" }}
        >
          <span className="monitoreo-tipo">{tipo}</span>
          <span className="monitoreo-nombre">{proceso.nombreProceso}</span>
          <span className={`circulo circulo-${color}`}></span>
        </div>

        {esExpandido && (
          <div className="monitoreo-expandido">
            <p>
              <strong>Estado producto:</strong> {proceso.estadoProducto}
            </p>
            <p>
              <strong>Empleado:</strong> {nombreEmpleado}
            </p>
            <p>
              <strong>Puesto:</strong> {nombrePuesto}
            </p>
            <p>
              <strong>ID Proceso:</strong> {proceso.idProceso}
            </p>
            {/* Agregá más datos si querés */}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="monitoreo-container">
      <div className="monitoreo-titulo-wrapper">
        <h5 className="monitoreo-titulo">Monitoreo</h5>
      </div>

      {procesos
        .filter((p) => p.estadoProducto === "produccion")
        .map((p) => renderFila(p, "amarillo", "Producción"))}

      {procesos
        .filter((p) => p.estadoProducto === "asignado")
        .map((p) => renderFila(p, "amarillo", "Asignado"))}

      {procesos
        .filter((p) => p.estadoProducto === "pendiente")
        .map((p) => renderFila(p, "rojo", "Pendiente"))}
    </div>
  );
};

export default Monitoreo;