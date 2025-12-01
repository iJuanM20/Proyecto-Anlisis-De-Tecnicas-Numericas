// src/components/ResultadosComparativos.js
import React, { useState } from 'react';
import './ResultadosComparativos.css';

function ResultadosComparativos({ resultados, funcion }) {
  const [metodoExpandido, setMetodoExpandido] = useState(null);

  const toggleMetodo = (metodo) => {
    setMetodoExpandido(metodoExpandido === metodo ? null : metodo);
  };

  const obtenerMejorMetodo = () => {
    let mejorMetodo = null;
    let menorIteraciones = Infinity;

    Object.entries(resultados).forEach(([key, resultado]) => {
      if (resultado.exito && resultado.iteraciones && resultado.iteraciones.length < menorIteraciones) {
        menorIteraciones = resultado.iteraciones.length;
        mejorMetodo = resultado.metodo;
      }
    });

    return mejorMetodo;
  };

  const mejorMetodo = obtenerMejorMetodo();

  return (
    <div className="resultados-container">
      <div className="resultados-header">
        <h2>📊 Resultados del Análisis</h2>
        <div className="funcion-analizada">
          <span className="funcion-label">Función:</span>
          <code className="funcion-code">f(x) = {funcion}</code>
        </div>
      </div>

      {/* Cards de Análisis Rápido */}
      <div className="analisis-rapido">
        <h3>🎯 Análisis de Convergencia</h3>
        <div className="convergencia-grid">
          {Object.entries(resultados)
            .filter(([_, r]) => !r.error)
            .map(([key, resultado]) => {
              const iteraciones = resultado.iteraciones || [];
              const ultimoError = iteraciones[iteraciones.length - 1]?.error || 0;
              
              return (
                <div key={key} className={`convergencia-card ${resultado.metodo === mejorMetodo ? 'mejor' : ''}`}>
                  <div className="card-header-conv">
                    <h4>{resultado.metodo}</h4>
                    {resultado.metodo === mejorMetodo && (
                      <span className="badge-estrella">⭐</span>
                    )}
                  </div>
                  <div className="card-body-conv">
                    <div className="stat-row">
                      <span className="stat-icon-conv">🔄</span>
                      <div className="stat-info">
                        <span className="stat-label-conv">Iteraciones</span>
                        <span className="stat-number">{iteraciones.length}</span>
                      </div>
                    </div>
                    <div className="stat-row">
                      <span className="stat-icon-conv">📉</span>
                      <div className="stat-info">
                        <span className="stat-label-conv">Error Final</span>
                        <span className="stat-number-small">{ultimoError.toExponential(2)}</span>
                      </div>
                    </div>
                    <div className="stat-row">
                      <span className="stat-icon-conv">✓</span>
                      <div className="stat-info">
                        <span className="stat-label-conv">Raíz</span>
                        <span className="stat-number-small">{resultado.raiz?.toFixed(8) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`card-footer-conv ${resultado.exito ? 'exito' : 'fallo'}`}>
                    {resultado.exito ? '✅ Convergió' : '⚠️ No convergió'}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Tabla Comparativa */}
      <div className="resumen-section">
        <h3>📋 Tabla Comparativa</h3>
        <div className="tabla-wrapper-modern">
          <table className="tabla-moderna">
            <thead>
              <tr>
                <th>Método</th>
                <th>Raíz</th>
                <th>Iteraciones</th>
                <th>Error Final</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(resultados).map(([key, resultado]) => (
                <tr key={key} className={resultado.error ? 'row-error' : resultado.metodo === mejorMetodo ? 'row-mejor' : ''}>
                  <td className="col-metodo">
                    <div className="metodo-name">
                      {resultado.metodo}
                      {resultado.metodo === mejorMetodo && !resultado.error && (
                        <span className="inline-star">⭐</span>
                      )}
                    </div>
                  </td>
                  <td className="col-numero">
                    {resultado.error ? 
                      <span className="na">—</span> : 
                      <code className="codigo-valor">{resultado.raiz?.toFixed(8)}</code>
                    }
                  </td>
                  <td className="col-numero">
                    {resultado.error ? 
                      <span className="na">—</span> : 
                      <span className="numero-destacado">{resultado.iteraciones?.length}</span>
                    }
                  </td>
                  <td className="col-numero">
                    {resultado.error ? 
                      <span className="na">—</span> : 
                      <code className="codigo-error">
                        {resultado.iteraciones?.[resultado.iteraciones.length - 1]?.error?.toExponential(3)}
                      </code>
                    }
                  </td>
                  <td className="col-estado">
                    {resultado.error ? (
                      <span className="badge-estado error">❌ Error</span>
                    ) : resultado.exito ? (
                      <span className="badge-estado exito">✅ Convergió</span>
                    ) : (
                      <span className="badge-estado warning">⚠️ No convergió</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Errores si existen */}
        {Object.entries(resultados).some(([_, r]) => r.error) && (
          <div className="errores-box">
            <h4>⚠️ Errores Detectados</h4>
            <div className="errores-list">
              {Object.entries(resultados)
                .filter(([_, r]) => r.error)
                .map(([key, resultado]) => (
                  <div key={key} className="error-message-item">
                    <span className="error-metodo">{resultado.metodo}:</span>
                    <span className="error-texto">{resultado.error}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Detalles Expandibles */}
      <div className="detalles-section">
        <h3>🔍 Detalles por Método</h3>
        <div className="metodos-acordeon">
          {Object.entries(resultados).map(([key, resultado]) => (
            <div key={key} className={`acordeon-item ${metodoExpandido === key ? 'expandido' : ''} ${resultado.error ? 'tiene-error' : ''}`}>
              <div 
                className="acordeon-header" 
                onClick={() => toggleMetodo(key)}
              >
                <div className="header-left">
                  <span className="expand-icon">
                    {metodoExpandido === key ? '▼' : '▶'}
                  </span>
                  <h4>{resultado.metodo}</h4>
                  {resultado.metodo === mejorMetodo && !resultado.error && (
                    <span className="header-badge">⭐ Más Eficiente</span>
                  )}
                </div>
                <span className="header-hint">
                  {metodoExpandido === key ? 'Click para ocultar' : 'Click para ver detalles'}
                </span>
              </div>

              {metodoExpandido === key && (
                <div className="acordeon-body">
                  {resultado.error ? (
                    <div className="error-box-detalle">
                      <span className="error-icon">❌</span>
                      <div className="error-content">
                        <strong>Error encontrado:</strong>
                        <p>{resultado.error}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="info-cards">
                        <div className="info-card">
                          <div className="info-icon-wrap">🎯</div>
                          <div className="info-text">
                            <span className="info-title">Raíz Encontrada</span>
                            <code className="info-valor">{resultado.raiz?.toFixed(10)}</code>
                          </div>
                        </div>
                        <div className="info-card">
                          <div className="info-icon-wrap">🔄</div>
                          <div className="info-text">
                            <span className="info-title">Total Iteraciones</span>
                            <span className="info-valor">{resultado.iteraciones?.length}</span>
                          </div>
                        </div>
                        <div className="info-card">
                          <div className="info-icon-wrap">📉</div>
                          <div className="info-text">
                            <span className="info-title">Error Final</span>
                            <code className="info-valor-small">
                              {resultado.iteraciones?.[resultado.iteraciones.length - 1]?.error?.toExponential(6)}
                            </code>
                          </div>
                        </div>
                        <div className="info-card">
                          <div className="info-icon-wrap">✓</div>
                          <div className="info-text">
                            <span className="info-title">Estado</span>
                            <span className={`info-badge-inline ${resultado.exito ? 'exito' : 'fallo'}`}>
                              {resultado.exito ? 'Convergió' : 'No convergió'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="iteraciones-section">
                        <h5>📊 Tabla de Iteraciones</h5>
                        <div className="tabla-scroll-wrapper">
                          {renderTablaIteraciones(resultado)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conclusión */}
      {mejorMetodo && (
        <div className="conclusion-box">
          <div className="conclusion-icon-wrap">🏆</div>
          <div className="conclusion-text">
            <h3>Conclusión del Análisis</h3>
            <p>
              El método <strong className="mejor-metodo-nombre">{mejorMetodo}</strong> demostró ser el más eficiente,
              convergiendo en el <strong>menor número de iteraciones</strong> con una precisión de <strong>1×10⁻⁶</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function renderTablaIteraciones(resultado) {
  const { metodo, iteraciones } = resultado;

  if (metodo === 'Bisección' || metodo === 'Regla Falsa') {
    return (
      <table className="tabla-iteraciones-detalle">
        <thead>
          <tr>
            <th>n</th>
            <th>a</th>
            <th>b</th>
            <th>c</th>
            <th>f(c)</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {iteraciones.map((iter) => (
            <tr key={iter.iteracion}>
              <td>{iter.iteracion}</td>
              <td>{iter.a?.toFixed(6)}</td>
              <td>{iter.b?.toFixed(6)}</td>
              <td>{iter.c?.toFixed(6)}</td>
              <td>{iter.fc?.toExponential(4)}</td>
              <td>{iter.error?.toExponential(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (metodo === 'Newton-Raphson') {
    return (
      <table className="tabla-iteraciones-detalle">
        <thead>
          <tr>
            <th>n</th>
            <th>xₙ</th>
            <th>f(xₙ)</th>
            <th>f'(xₙ)</th>
            <th>xₙ₊₁</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {iteraciones.map((iter) => (
            <tr key={iter.iteracion}>
              <td>{iter.iteracion}</td>
              <td>{iter.x?.toFixed(6)}</td>
              <td>{iter.fx?.toExponential(4)}</td>
              <td>{iter.fpx?.toFixed(6)}</td>
              <td>{iter.xNuevo?.toFixed(6)}</td>
              <td>{iter.error?.toExponential(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (metodo === 'Secante') {
    return (
      <table className="tabla-iteraciones-detalle">
        <thead>
          <tr>
            <th>n</th>
            <th>xₙ₋₁</th>
            <th>xₙ</th>
            <th>f(xₙ)</th>
            <th>xₙ₊₁</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {iteraciones.map((iter) => (
            <tr key={iter.iteracion}>
              <td>{iter.iteracion}</td>
              <td>{iter.xAnterior?.toFixed(6)}</td>
              <td>{iter.x?.toFixed(6)}</td>
              <td>{iter.fx?.toExponential(4)}</td>
              <td>{iter.xNuevo?.toFixed(6)}</td>
              <td>{iter.error?.toExponential(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (metodo === 'Punto Fijo') {
    return (
      <table className="tabla-iteraciones-detalle">
        <thead>
          <tr>
            <th>n</th>
            <th>xₙ</th>
            <th>g(xₙ) = xₙ₊₁</th>
            <th>f(xₙ₊₁)</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {iteraciones.map((iter) => (
            <tr key={iter.iteracion}>
              <td>{iter.iteracion}</td>
              <td>{iter.x?.toFixed(6)}</td>
              <td>{iter.xNuevo?.toFixed(6)}</td>
              <td>{iter.fx?.toExponential(4)}</td>
              <td>{iter.error?.toExponential(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return null;
}

export default ResultadosComparativos;