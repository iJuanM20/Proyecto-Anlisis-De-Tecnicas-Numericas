// src/App.js
import React, { useState, useCallback, useMemo } from 'react';
import './App.css';
import { evaluate, derivative } from 'mathjs';
import ResultadosComparativos from './components/ResultadosComparativos';
import CalculadoraMatematica from './components/CalculadoraMatematica';
import GraficasComparativas from './components/GraficasComparativas';

/**
 * Componente principal para evaluar métodos de localización de raíces
 * @author Estudiante de Ingeniería de Sistemas
 * @version 1.0.0
 */
function App() {
  // Estados del componente
  const [funcion, setFuncion] = useState('');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('todos');
  const [parametros, setParametros] = useState({
    a: 0,
    b: 0,
    x0: 0,
    x1: 0,
    tolerancia: 0.000001, // Tolerancia editable por el usuario
    maxIteraciones: 100 // Oculto pero funcional
  });
  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(true);

  /**
   * Valida si una función es válida y puede ser evaluada
   * @param {string} func - Función matemática a validar
   * @returns {boolean} - True si la función es válida
   */
  const validarFuncion = useCallback((func) => {
    try {
      evaluate(func, { x: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  /**
   * Método de Bisección
   * Algoritmo: Divide el intervalo por la mitad iterativamente
   * Complejidad: O(log n)
   * Convergencia: Lineal
   */
  const metodoBiseccion = useCallback((f, a, b, tol, maxIter) => {
    const iteraciones = [];
    let iteracion = 0;
    let error = Math.abs(b - a);
    
    try {
      let fa = evaluate(f, { x: a });
      let fb = evaluate(f, { x: b });
      
      // Verificar el Teorema de Bolzano
      if (fa * fb > 0) {
        throw new Error('La función debe tener signos opuestos en los extremos del intervalo');
      }

      while (error > tol && iteracion < maxIter) {
        const c = (a + b) / 2;
        const fc = evaluate(f, { x: c });
        
        iteraciones.push({
          iteracion: iteracion + 1,
          a: a,
          b: b,
          c: c,
          fc: fc,
          error: error
        });

        // Criterio de parada: f(c) ≈ 0
        if (Math.abs(fc) < tol) {
          return { raiz: c, iteraciones, exito: true, metodo: 'Bisección' };
        }

        // Actualizar intervalo según el teorema de Bolzano
        if (fa * fc < 0) {
          b = c;
          fb = fc;
        } else {
          a = c;
          fa = fc;
        }

        error = Math.abs(b - a);
        iteracion++;
      }

      return { 
        raiz: (a + b) / 2, 
        iteraciones, 
        exito: iteracion < maxIter,
        metodo: 'Bisección'
      };
    } catch (e) {
      throw new Error(`Error en Bisección: ${e.message}`);
    }
  }, []);

  /**
   * Método de Regla Falsa (False Position)
   * Algoritmo: Usa interpolación lineal para aproximar la raíz
   * Convergencia: Superlineal
   */
  const metodoReglaFalsa = useCallback((f, a, b, tol, maxIter) => {
    const iteraciones = [];
    let iteracion = 0;
    let c = a;
    let cAnterior = a;
    
    try {
      let fa = evaluate(f, { x: a });
      let fb = evaluate(f, { x: b });
      
      if (fa * fb > 0) {
        throw new Error('La función debe tener signos opuestos en los extremos del intervalo');
      }

      while (iteracion < maxIter) {
        // Fórmula de interpolación lineal
        c = (a * fb - b * fa) / (fb - fa);
        const fc = evaluate(f, { x: c });
        const error = Math.abs(c - cAnterior);
        
        iteraciones.push({
          iteracion: iteracion + 1,
          a: a,
          b: b,
          c: c,
          fc: fc,
          error: error
        });

        // Criterios de parada
        if (Math.abs(fc) < tol || error < tol) {
          return { raiz: c, iteraciones, exito: true, metodo: 'Regla Falsa' };
        }

        // Actualizar intervalo
        if (fa * fc < 0) {
          b = c;
          fb = fc;
        } else {
          a = c;
          fa = fc;
        }

        cAnterior = c;
        iteracion++;
      }

      return { raiz: c, iteraciones, exito: false, metodo: 'Regla Falsa' };
    } catch (e) {
      throw new Error(`Error en Regla Falsa: ${e.message}`);
    }
  }, []);

  /**
   * Método de Newton-Raphson
   * Algoritmo: x_{n+1} = x_n - f(x_n)/f'(x_n)
   * Convergencia: Cuadrática (bajo condiciones apropiadas)
   * Requiere: Función derivable
   */
  const metodoNewtonRaphson = useCallback((f, x0, tol, maxIter) => {
    const iteraciones = [];
    let x = x0;
    let iteracion = 0;
    
    try {
      while (iteracion < maxIter) {
        const fx = evaluate(f, { x: x });
        const fpx = derivative(f, 'x').evaluate({ x: x });
        
        // Evitar división por cero
        if (Math.abs(fpx) < 1e-10) {
          throw new Error('Derivada muy pequeña, posible división por cero');
        }

        // Fórmula de Newton-Raphson
        const xNuevo = x - fx / fpx;
        const error = Math.abs(xNuevo - x);
        
        iteraciones.push({
          iteracion: iteracion + 1,
          x: x,
          fx: fx,
          fpx: fpx,
          xNuevo: xNuevo,
          error: error
        });

        // Criterios de parada
        if (error < tol || Math.abs(fx) < tol) {
          return { raiz: xNuevo, iteraciones, exito: true, metodo: 'Newton-Raphson' };
        }

        x = xNuevo;
        iteracion++;
      }

      return { raiz: x, iteraciones, exito: false, metodo: 'Newton-Raphson' };
    } catch (e) {
      throw new Error(`Error en Newton-Raphson: ${e.message}`);
    }
  }, []);

  /**
   * Método de la Secante
   * Algoritmo: Aproximación de la derivada usando diferencias finitas
   * Convergencia: Superlineal (orden ≈ 1.618)
   * Ventaja: No requiere calcular derivadas
   */
  const metodoSecante = useCallback((f, x0, x1, tol, maxIter) => {
    const iteraciones = [];
    let xAnterior = x0;
    let x = x1;
    let iteracion = 0;
    
    try {
      while (iteracion < maxIter) {
        const fx = evaluate(f, { x: x });
        const fxAnterior = evaluate(f, { x: xAnterior });
        
        // Evitar división por cero
        if (Math.abs(fx - fxAnterior) < 1e-10) {
          throw new Error('División por cero en método de la secante');
        }

        // Fórmula del método de la secante
        const xNuevo = x - fx * (x - xAnterior) / (fx - fxAnterior);
        const error = Math.abs(xNuevo - x);
        
        iteraciones.push({
          iteracion: iteracion + 1,
          xAnterior: xAnterior,
          x: x,
          fx: fx,
          xNuevo: xNuevo,
          error: error
        });

        // Criterios de parada
        if (error < tol || Math.abs(fx) < tol) {
          return { raiz: xNuevo, iteraciones, exito: true, metodo: 'Secante' };
        }

        xAnterior = x;
        x = xNuevo;
        iteracion++;
      }

      return { raiz: x, iteraciones, exito: false, metodo: 'Secante' };
    } catch (e) {
      throw new Error(`Error en Secante: ${e.message}`);
    }
  }, []);

  /**
   * Método de Punto Fijo
   * Algoritmo: Transforma f(x)=0 en x=g(x)
   * Convergencia: Depende de |g'(x)| < 1
   * Nota: Puede diverger si g(x) no está bien definida
   */
  const metodoPuntoFijo = useCallback((f, x0, tol, maxIter) => {
    const iteraciones = [];
    let x = x0;
    let iteracion = 0;
    
    try {
      // Transformación: f(x) = 0 → x = x + f(x) = g(x)
      // Esta es una transformación simple; en la práctica, se puede optimizar
      const g = `x + (${f})`;
      
      while (iteracion < maxIter) {
        const xNuevo = evaluate(g, { x: x });
        const fx = evaluate(f, { x: xNuevo });
        const error = Math.abs(xNuevo - x);
        
        iteraciones.push({
          iteracion: iteracion + 1,
          x: x,
          xNuevo: xNuevo,
          fx: fx,
          error: error
        });

        // Criterio de parada
        if (error < tol) {
          return { raiz: xNuevo, iteraciones, exito: true, metodo: 'Punto Fijo' };
        }

        // Verificar divergencia
        if (Math.abs(xNuevo) > 1e6) {
          throw new Error('El método diverge. Intenta con otro valor inicial o función g(x)');
        }

        x = xNuevo;
        iteracion++;
      }

      return { raiz: x, iteraciones, exito: false, metodo: 'Punto Fijo' };
    } catch (e) {
      throw new Error(`Error en Punto Fijo: ${e.message}`);
    }
  }, []);

  /**
   * Ejecuta el análisis de los métodos seleccionados
   * Maneja errores y actualiza el estado de resultados
   */
  const ejecutarAnalisis = useCallback(() => {
    setError('');
    setCargando(true);
    
    // Validar función
    if (!validarFuncion(funcion)) {
      setError('La función ingresada no es válida. Use "x" como variable y sintaxis matemática correcta.');
      setCargando(false);
      return;
    }

    const resultadosMetodos = {};

    try {
      // Parsear parámetros
      const params = {
        a: parseFloat(parametros.a),
        b: parseFloat(parametros.b),
        x0: parseFloat(parametros.x0),
        x1: parseFloat(parametros.x1),
        tolerancia: parseFloat(parametros.tolerancia),
        maxIteraciones: parseInt(parametros.maxIteraciones)
      };

      // Validar parámetros numéricos
      if (isNaN(params.tolerancia) || params.tolerancia <= 0) {
        throw new Error('La tolerancia debe ser un número positivo');
      }
      if (isNaN(params.maxIteraciones) || params.maxIteraciones <= 0) {
        throw new Error('El máximo de iteraciones debe ser un número entero positivo');
      }

      // Ejecutar métodos seleccionados
      if (metodoSeleccionado === 'todos' || metodoSeleccionado === 'biseccion') {
        try {
          resultadosMetodos.biseccion = metodoBiseccion(
            funcion, params.a, params.b, params.tolerancia, params.maxIteraciones
          );
        } catch (e) {
          resultadosMetodos.biseccion = { error: e.message, metodo: 'Bisección' };
        }
      }

      if (metodoSeleccionado === 'todos' || metodoSeleccionado === 'reglaFalsa') {
        try {
          resultadosMetodos.reglaFalsa = metodoReglaFalsa(
            funcion, params.a, params.b, params.tolerancia, params.maxIteraciones
          );
        } catch (e) {
          resultadosMetodos.reglaFalsa = { error: e.message, metodo: 'Regla Falsa' };
        }
      }

      if (metodoSeleccionado === 'todos' || metodoSeleccionado === 'newtonRaphson') {
        try {
          resultadosMetodos.newtonRaphson = metodoNewtonRaphson(
            funcion, params.x0, params.tolerancia, params.maxIteraciones
          );
        } catch (e) {
          resultadosMetodos.newtonRaphson = { error: e.message, metodo: 'Newton-Raphson' };
        }
      }

      if (metodoSeleccionado === 'todos' || metodoSeleccionado === 'secante') {
        try {
          resultadosMetodos.secante = metodoSecante(
            funcion, params.x0, params.x1, params.tolerancia, params.maxIteraciones
          );
        } catch (e) {
          resultadosMetodos.secante = { error: e.message, metodo: 'Secante' };
        }
      }

      if (metodoSeleccionado === 'todos' || metodoSeleccionado === 'puntoFijo') {
        try {
          resultadosMetodos.puntoFijo = metodoPuntoFijo(
            funcion, params.x0, params.tolerancia, params.maxIteraciones
          );
        } catch (e) {
          resultadosMetodos.puntoFijo = { error: e.message, metodo: 'Punto Fijo' };
        }
      }

      setResultados(resultadosMetodos);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [funcion, metodoSeleccionado, parametros, validarFuncion, metodoBiseccion, 
      metodoReglaFalsa, metodoNewtonRaphson, metodoSecante, metodoPuntoFijo]);

  // Handler para actualizar parámetros
  const actualizarParametro = useCallback((campo, valor) => {
    setParametros(prev => ({ ...prev, [campo]: valor }));
  }, []);

  // Memoizar el estado de los botones
  const puedeEjecutar = useMemo(() => {
    return funcion.trim() !== '' && !cargando;
  }, [funcion, cargando]);

  return (
    <div className="App">
      <header className="App-header-custom">
        <h1>Evaluador de Métodos de Localización de Raíces</h1>
        <p className="subtitle">Análisis Comparativo de Métodos Numéricos</p>
      </header>

      <main className="App-main">
        <div className="input-section">
          <div className="form-group">
            <label htmlFor="funcion">
              <span className="label-icon">📝</span> Función f(x) = 0:
            </label>
            <div className="input-con-toggle">
              <input
                id="funcion-input"
                type="text"
                value={funcion}
                onChange={(e) => setFuncion(e.target.value)}
                placeholder="Usa la calculadora o escribe aquí (ej: x^3 - x - 2)"
                className="input-funcion"
                disabled={cargando}
              />
              <button 
                className="btn-toggle-calc"
                onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
                disabled={cargando}
                title={mostrarCalculadora ? 'Ocultar calculadora' : 'Mostrar calculadora'}
              >
                {mostrarCalculadora ? '🔼' : '🔽'} Calculadora
              </button>
            </div>
            <small>Use "x" como variable. Operadores: +, -, *, /, ^, sin(), cos(), tan(), exp(), log(), sqrt()</small>
          </div>

          {mostrarCalculadora && (
            <CalculadoraMatematica 
              valor={funcion}
              onChange={setFuncion}
              disabled={cargando}
            />
          )}

          <div className="form-group">
            <label htmlFor="metodo">
              <span className="label-icon">🎯</span> Método a evaluar:
            </label>
            <select 
              id="metodo"
              value={metodoSeleccionado} 
              onChange={(e) => setMetodoSeleccionado(e.target.value)}
              className="select-metodo"
              disabled={cargando}
            >
              <option value="todos">🔍 Todos los métodos</option>
              <option value="biseccion">📏 Bisección</option>
              <option value="reglaFalsa">📐 Regla Falsa</option>
              <option value="newtonRaphson">⚡ Newton-Raphson</option>
              <option value="secante">📊 Secante</option>
              <option value="puntoFijo">🎲 Punto Fijo</option>
            </select>
          </div>

          <div className="parametros-grid">
            <div className="form-group">
              <label>
                <span className="label-icon">📌</span> Intervalo [a, b]:
              </label>
              <div className="input-group">
                <input
                  type="number"
                  step="0.1"
                  value={parametros.a}
                  onChange={(e) => actualizarParametro('a', e.target.value)}
                  placeholder="Valor inicial a"
                  disabled={cargando}
                />
                <input
                  type="number"
                  step="0.1"
                  value={parametros.b}
                  onChange={(e) => actualizarParametro('b', e.target.value)}
                  placeholder="Valor final b"
                  disabled={cargando}
                />
              </div>
              <small>Para métodos cerrados (Bisección, Regla Falsa)</small>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">🎯</span> Valores iniciales:
              </label>
              <div className="input-group">
                <input
                  type="number"
                  step="0.1"
                  value={parametros.x0}
                  onChange={(e) => actualizarParametro('x0', e.target.value)}
                  placeholder="Valor x₀"
                  disabled={cargando}
                />
                <input
                  type="number"
                  step="0.1"
                  value={parametros.x1}
                  onChange={(e) => actualizarParametro('x1', e.target.value)}
                  placeholder="Valor x₁"
                  disabled={cargando}
                />
              </div>
              <small>Para métodos abiertos (Newton, Secante, Punto Fijo)</small>
            </div>

            <div className="form-group">
              <label htmlFor="tolerancia">
                <span className="label-icon">🎛️</span> Tolerancia:
              </label>
              <input
                id="tolerancia"
                type="number"
                step="0.000001"
                min="0.000000001"
                max="0.1"
                value={parametros.tolerancia}
                onChange={(e) => actualizarParametro('tolerancia', e.target.value)}
                placeholder="Ej: 0.000001"
                disabled={cargando}
              />
              <small>Precisión del error (valores típicos: 0.000001 a 0.0001)</small>
            </div>
          </div>

          <button 
            onClick={ejecutarAnalisis} 
            className="btn-analizar"
            disabled={!puedeEjecutar}
          >
            {cargando ? (
              <>
                <span className="spinner"></span> Analizando...
              </>
            ) : (
              <>
                🔬 Ejecutar Análisis Completo
              </>
            )}
          </button>

          {error && (
            <div className="error-message" role="alert">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}
        </div>

        {resultados && !cargando && (
          <>
            <GraficasComparativas resultados={resultados} funcion={funcion} />
            <ResultadosComparativos resultados={resultados} funcion={funcion} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;