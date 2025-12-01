// src/components/GraficasComparativas.js
import React, { useMemo, Fragment } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';
import { evaluate } from 'mathjs';
import './GraficasComparativas.css';

function GraficasComparativas({ resultados, funcion }) {
  // Calcular dominios apropiados según la función y raíces
  const dominiosCalculados = useMemo(() => {
    if (!funcion || funcion.trim() === '') {
      return { xMin: -12, xMax: 12, yMin: -6, yMax: 6 };
    }

    try {
      // Obtener raíces encontradas
      const raices = Object.values(resultados)
        .filter(r => r.raiz && !r.error && isFinite(r.raiz))
        .map(r => r.raiz);
      
      let xMin, xMax;
      
      if (raices.length > 0) {
        // Si hay raíces, centrar alrededor de ellas
        const minRaiz = Math.min(...raices);
        const maxRaiz = Math.max(...raices);
        const rango = Math.max(Math.abs(maxRaiz - minRaiz), 4);
        
        xMin = minRaiz - rango * 0.5;
        xMax = maxRaiz + rango * 0.5;
      } else {
        // Si NO hay raíces, usar rango amplio por defecto
        xMin = -10;
        xMax = 10;
      }

      // Evaluar la función en varios puntos para determinar rango Y apropiado
      const numPuntosMuestra = 100;
      const paso = (xMax - xMin) / numPuntosMuestra;
      const valoresY = [];
      
      for (let i = 0; i <= numPuntosMuestra; i++) {
        const x = xMin + i * paso;
        try {
          const y = evaluate(funcion, { x: x });
          if (isFinite(y) && Math.abs(y) < 1e10) {
            valoresY.push(y);
          }
        } catch (e) {
          // Ignorar puntos problemáticos
        }
      }

      let yMin, yMax;
      if (valoresY.length > 0) {
        const minY = Math.min(...valoresY);
        const maxY = Math.max(...valoresY);
        const rangoY = maxY - minY;
        const margen = rangoY * 0.15; // 15% de margen
        
        yMin = minY - margen;
        yMax = maxY + margen;
        
        // Asegurar que incluya y=0 si está cerca
        if (yMin > -1 && yMin < 0) yMin = -1;
        if (yMax < 1 && yMax > 0) yMax = 1;
      } else {
        yMin = -6;
        yMax = 6;
      }

      // Redondear a valores limpios
      xMin = Math.floor(xMin);
      xMax = Math.ceil(xMax);
      yMin = Math.floor(yMin);
      yMax = Math.ceil(yMax);

      return { xMin, xMax, yMin, yMax };
    } catch (e) {
      console.error('Error calculando dominios:', e);
      return { xMin: -12, xMax: 12, yMin: -6, yMax: 6 };
    }
  }, [resultados, funcion]);

  // Generar puntos para graficar la función - SIEMPRE
  const datosGraficaFuncion = useMemo(() => {
    // Si no hay función, no graficar
    if (!funcion || funcion.trim() === '') return [];
    
    try {
      const { xMin, xMax } = dominiosCalculados;
      
      const numPuntos = 400;
      const paso = (xMax - xMin) / numPuntos;
      
      const datos = [];
      let puntosValidos = 0;
      
      for (let i = 0; i <= numPuntos; i++) {
        const x = xMin + i * paso;
        try {
          const y = evaluate(funcion, { x: x });
          
          // Aceptar valores finitos que no sean excesivamente grandes
          if (isFinite(y) && Math.abs(y) < 1e10) {
            datos.push({ 
              x: parseFloat(x.toFixed(5)), 
              y: parseFloat(y.toFixed(5)) 
            });
            puntosValidos++;
          }
        } catch (e) {
          // Ignorar puntos donde la función no está definida
          // pero continuar generando la gráfica
        }
      }
      
      // Si no se generaron suficientes puntos, intentar con rangos alternativos
      if (puntosValidos < 20) {
        console.log('Pocos puntos generados, intentando rangos alternativos...');
        
        // Probar diferentes rangos
        const rangosAlternativos = [
          [-5, 5],
          [-20, 20],
          [-2, 2],
          [-50, 50],
          [-1, 1],
          [0, 10],
          [-100, 100]
        ];
        
        for (const [rMin, rMax] of rangosAlternativos) {
          const datos2 = [];
          const paso2 = (rMax - rMin) / numPuntos;
          let puntosValidos2 = 0;
          
          for (let i = 0; i <= numPuntos; i++) {
            const x = rMin + i * paso2;
            try {
              const y = evaluate(funcion, { x: x });
              if (isFinite(y) && Math.abs(y) < 1e10) {
                datos2.push({ 
                  x: parseFloat(x.toFixed(5)), 
                  y: parseFloat(y.toFixed(5)) 
                });
                puntosValidos2++;
              }
            } catch (e) {
              // Ignorar
            }
          }
          
          // Si este rango generó buenos puntos, usarlo
          if (puntosValidos2 >= 50) {
            console.log(`Rango exitoso: [${rMin}, ${rMax}] con ${puntosValidos2} puntos`);
            return datos2;
          }
        }
      }
      
      console.log(`Gráfica generada con ${puntosValidos} puntos válidos`);
      return datos;
      
    } catch (e) {
      console.error('Error al generar gráfica de función:', e);
      
      // Último intento: usar dominios calculados
      try {
        const datos = [];
        const numPuntos = 400;
        const { xMin, xMax } = dominiosCalculados;
        const paso = (xMax - xMin) / numPuntos;
        
        for (let i = 0; i <= numPuntos; i++) {
          const x = xMin + i * paso;
          try {
            const y = evaluate(funcion, { x: x });
            if (isFinite(y) && Math.abs(y) < 1e10) {
              datos.push({ 
                x: parseFloat(x.toFixed(5)), 
                y: parseFloat(y.toFixed(5)) 
              });
            }
          } catch (err) {
            // Ignorar
          }
        }
        return datos;
      } catch (err2) {
        return [];
      }
    }
  }, [resultados, funcion, dominiosCalculados]);

  // Datos para gráfica de convergencia (iteraciones vs error)
  const datosConvergencia = useMemo(() => {
    const metodos = Object.entries(resultados).filter(([_, r]) => r.iteraciones && !r.error);
    
    if (metodos.length === 0) return [];
    
    const maxIteraciones = Math.max(...metodos.map(([_, r]) => r.iteraciones.length));
    const datos = [];
    
    for (let i = 0; i < maxIteraciones; i++) {
      const punto = { iteracion: i + 1 };
      metodos.forEach(([key, resultado]) => {
        if (i < resultado.iteraciones.length) {
          punto[resultado.metodo] = resultado.iteraciones[i].error;
        }
      });
      datos.push(punto);
    }
    
    return datos;
  }, [resultados]);

  // Datos para gráfica de barras (comparación de iteraciones)
  const datosComparacion = useMemo(() => {
    return Object.entries(resultados)
      .filter(([_, r]) => r.iteraciones && !r.error && r.exito)
      .map(([_, resultado]) => ({
        metodo: resultado.metodo,
        iteraciones: resultado.iteraciones.length,
        errorFinal: resultado.iteraciones[resultado.iteraciones.length - 1]?.error || 0
      }));
  }, [resultados]);

  // Puntos de las raíces encontradas
  const puntosRaices = useMemo(() => {
    return Object.values(resultados)
      .filter(r => r.raiz && !r.error && r.exito)
      .map(r => ({ x: r.raiz, y: 0, metodo: r.metodo }));
  }, [resultados]);

  const coloresMetodos = {
    'Bisección': '#667eea',
    'Regla Falsa': '#f093fb',
    'Newton-Raphson': '#43e97b',
    'Secante': '#4facfe',
    'Punto Fijo': '#fa709a'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Iteración: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toExponential(4)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomTooltipFuncion = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`x: ${payload[0].payload.x}`}</p>
          <p style={{ color: '#667eea' }}>{`f(x): ${payload[0].payload.y}`}</p>
        </div>
      );
    }
    return null;
  };

  // Mostrar al menos la gráfica de la función si existe
  const hayResultados = Object.keys(resultados).length > 0;
  const hayDatosGrafica = datosGraficaFuncion.length > 0;

  // Si no hay resultados ni datos de gráfica, no mostrar nada
  if (!hayResultados && !hayDatosGrafica) {
    return null;
  }

  return (
    <div className="graficas-container">
      <h2>📊 Análisis Gráfico</h2>

      {/* Gráfica de la función con raíces - ESTILO GEOGEBRA */}
      {datosGraficaFuncion.length > 0 && (
        <div className="grafica-card">
          <h3>📈 Gráfica de la Función</h3>
          <p className="grafica-descripcion">f(x) = {funcion}</p>
          <ResponsiveContainer width="100%" height={550}>
            <LineChart 
              data={datosGraficaFuncion}
              margin={{ top: 20, right: 40, left: 50, bottom: 40 }}
            >
              {/* Grilla estilo GeoGebra - MÁS VISIBLE */}
              <CartesianGrid 
                strokeDasharray="1 1" 
                stroke="#d3d3d3" 
                strokeWidth={0.8}
                vertical={true}
                horizontal={true}
              />
              
              {/* Eje X con números */}
              <XAxis 
                dataKey="x" 
                type="number"
                domain={[dominiosCalculados.xMin, dominiosCalculados.xMax]}
                stroke="#333"
                strokeWidth={2}
                axisLine={{ stroke: '#333', strokeWidth: 2 }}
                tickLine={{ stroke: '#333', strokeWidth: 1.5 }}
                tick={{ 
                  fontSize: 13, 
                  fill: '#333',
                  fontWeight: 600
                }}
                label={{ 
                  value: 'Eje X', 
                  position: 'insideBottomRight', 
                  offset: -5,
                  style: { 
                    fontSize: 15, 
                    fontWeight: 'bold', 
                    fill: '#000',
                    textAnchor: 'end'
                  }
                }}
              />
              
              {/* Eje Y con números */}
              <YAxis 
                type="number"
                domain={[dominiosCalculados.yMin, dominiosCalculados.yMax]}
                stroke="#333"
                strokeWidth={2}
                axisLine={{ stroke: '#333', strokeWidth: 2 }}
                tickLine={{ stroke: '#333', strokeWidth: 1.5 }}
                tick={{ 
                  fontSize: 13, 
                  fill: '#333',
                  fontWeight: 600
                }}
                label={{ 
                  value: 'Eje Y', 
                  angle: -90, 
                  position: 'insideTopLeft',
                  offset: 5,
                  style: { 
                    fontSize: 15, 
                    fontWeight: 'bold', 
                    fill: '#000',
                    textAnchor: 'middle'
                  }
                }}
              />
              
              <Tooltip content={<CustomTooltipFuncion />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              {/* EJE Y (x=0) - LÍNEA NEGRA GRUESA COMO GEOGEBRA */}
              <ReferenceLine 
                x={0} 
                stroke="#000" 
                strokeWidth={3}
                label={{ 
                  value: 'x = 0',
                  position: 'top',
                  fill: '#000',
                  fontSize: 12,
                  fontWeight: 'bold',
                  offset: 15
                }}
              />
              
              {/* EJE X (y=0) - LÍNEA NEGRA GRUESA COMO GEOGEBRA */}
              <ReferenceLine 
                y={0} 
                stroke="#000" 
                strokeWidth={3}
                label={{ 
                  value: 'y = 0',
                  position: 'insideTopRight',
                  fill: '#000',
                  fontSize: 12,
                  fontWeight: 'bold',
                  offset: 10
                }}
              />
              
              {/* Curva de la función - AZUL GEOGEBRA */}
              <Line 
                type="monotone" 
                dataKey="y" 
                stroke="#1a73e8" 
                strokeWidth={3.5}
                dot={false}
                name="f(x)"
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
              
              {/* Marcadores de raíces encontradas con líneas verticales */}
              {puntosRaices.map((punto, index) => (
                <React.Fragment key={`raiz-${index}`}>
                  {/* Línea vertical de la raíz */}
                  <ReferenceLine 
                    x={punto.x} 
                    stroke={coloresMetodos[punto.metodo] || '#27ae60'}
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    label={{ 
                      value: `${punto.metodo}`,
                      position: 'top',
                      fill: coloresMetodos[punto.metodo] || '#27ae60',
                      fontSize: 12,
                      fontWeight: 'bold',
                      offset: 5
                    }}
                  />
                  {/* Punto en la raíz (x, 0) */}
                  <ReferenceLine 
                    segment={[
                      { x: punto.x - 0.01, y: 0 },
                      { x: punto.x + 0.01, y: 0 }
                    ]}
                    stroke={coloresMetodos[punto.metodo] || '#27ae60'}
                    strokeWidth={10}
                    dot={true}
                  />
                </React.Fragment>
              ))}
            </LineChart>
          </ResponsiveContainer>
          
          {/* Leyenda de raíces */}
          {puntosRaices.length > 0 && (
            <div className="leyenda-raices">
              <div className="leyenda-titulo">🎯 Raíces Encontradas:</div>
              {puntosRaices.map((punto, index) => (
                <div key={index} className="leyenda-item">
                  <span 
                    className="leyenda-color" 
                    style={{ backgroundColor: coloresMetodos[punto.metodo] }}
                  ></span>
                  <span className="leyenda-metodo">{punto.metodo}:</span>
                  <code className="leyenda-valor">x = {punto.x.toFixed(8)}</code>
                </div>
              ))}
            </div>
          )}
          
          {/* Información adicional de los ejes */}
          <div className="info-ejes">
            <div className="info-eje-item">
              <strong>📏 Ejes:</strong> Las líneas negras gruesas representan x = 0 (eje Y) e y = 0 (eje X)
            </div>
            <div className="info-eje-item">
              <strong>📊 Curva azul:</strong> Representa la función f(x) = {funcion}
            </div>
            {puntosRaices.length > 0 && (
              <div className="info-eje-item">
                <strong>🎯 Líneas punteadas:</strong> Indican las raíces encontradas por cada método
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gráfica de convergencia */}
      {datosConvergencia.length > 0 && (
        <div className="grafica-card">
          <h3>Convergencia de los Métodos</h3>
          <p className="grafica-descripcion">Error vs Número de Iteraciones (escala logarítmica)</p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={datosConvergencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="iteracion" 
                label={{ value: 'Iteración', position: 'insideBottom', offset: -5 }}
                stroke="#2c3e50"
              />
              <YAxis 
                scale="log"
                domain={['auto', 'auto']}
                label={{ value: 'Error (log)', angle: -90, position: 'insideLeft' }}
                stroke="#2c3e50"
                tickFormatter={(value) => value.toExponential(0)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {Object.entries(resultados)
                .filter(([_, r]) => r.iteraciones && !r.error)
                .map(([key, resultado]) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={resultado.metodo}
                    stroke={coloresMetodos[resultado.metodo] || '#000000'}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfica de barras - Comparación de iteraciones */}
      {datosComparacion.length > 0 && (
        <div className="grafica-card">
          <h3>Comparación de Eficiencia</h3>
          <p className="grafica-descripcion">Número de iteraciones requeridas por cada método</p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={datosComparacion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="metodo" 
                stroke="#2c3e50"
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                label={{ value: 'Iteraciones', angle: -90, position: 'insideLeft' }}
                stroke="#2c3e50"
              />
              <Tooltip />
              <Bar 
                dataKey="iteraciones" 
                fill="#667eea"
                radius={[8, 8, 0, 0]}
              >
                {datosComparacion.map((entry, index) => (
                  <Bar 
                    key={`cell-${index}`} 
                    fill={coloresMetodos[entry.metodo] || '#667eea'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Análisis de velocidad de convergencia */}
      <div className="analisis-convergencia">
        <h3>📈 Análisis de Convergencia</h3>
        <div className="analisis-grid">
          {Object.entries(resultados)
            .filter(([_, r]) => r.iteraciones && !r.error && r.exito)
            .map(([key, resultado]) => {
              const iteraciones = resultado.iteraciones;
              const primerError = iteraciones[0]?.error || 0;
              const ultimoError = iteraciones[iteraciones.length - 1]?.error || 0;
              const reduccionError = primerError > 0 ? (primerError / ultimoError) : 0;
              
              return (
                <div key={key} className="analisis-item" style={{ borderLeftColor: coloresMetodos[resultado.metodo] }}>
                  <h4>{resultado.metodo}</h4>
                  <div className="analisis-stat">
                    <span className="stat-label">Iteraciones:</span>
                    <span className="stat-value">{iteraciones.length}</span>
                  </div>
                  <div className="analisis-stat">
                    <span className="stat-label">Error inicial:</span>
                    <span className="stat-value">{primerError.toExponential(2)}</span>
                  </div>
                  <div className="analisis-stat">
                    <span className="stat-label">Error final:</span>
                    <span className="stat-value">{ultimoError.toExponential(2)}</span>
                  </div>
                  <div className="analisis-stat">
                    <span className="stat-label">Reducción:</span>
                    <span className="stat-value destacado">
                      {reduccionError > 0 ? `${reduccionError.toExponential(2)}×` : 'N/A'}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default GraficasComparativas;