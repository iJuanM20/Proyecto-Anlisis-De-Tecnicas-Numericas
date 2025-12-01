// src/components/CalculadoraMatematica.js
import React, { useState } from 'react';
import './CalculadoraMatematica.css';

function CalculadoraMatematica({ valor, onChange, disabled }) {
  const [categoriaActiva, setCategoriaActiva] = useState('basico');

  const insertarTexto = (texto) => {
    if (disabled) return;
    const input = document.getElementById('funcion-input');
    if (!input) return;
    
    const inicio = input.selectionStart || 0;
    const fin = input.selectionEnd || 0;
    const textoActual = valor || '';
    const nuevoTexto = textoActual.substring(0, inicio) + texto + textoActual.substring(fin);
    
    onChange(nuevoTexto);
    
    // Actualizar cursor después de insertar
    setTimeout(() => {
      if (input) {
        input.focus();
        const nuevaPosicion = inicio + texto.length;
        input.setSelectionRange(nuevaPosicion, nuevaPosicion);
      }
    }, 10);
  };

  const borrar = () => {
    if (disabled) return;
    const input = document.getElementById('funcion-input');
    if (!input) return;
    
    const inicio = input.selectionStart || 0;
    const fin = input.selectionEnd || 0;
    const textoActual = valor || '';
    
    if (inicio !== fin) {
      // Si hay texto seleccionado, borrarlo
      const nuevoTexto = textoActual.substring(0, inicio) + textoActual.substring(fin);
      onChange(nuevoTexto);
      setTimeout(() => {
        if (input) {
          input.focus();
          input.setSelectionRange(inicio, inicio);
        }
      }, 10);
    } else if (inicio > 0) {
      // Borrar un carácter antes del cursor
      const nuevoTexto = textoActual.substring(0, inicio - 1) + textoActual.substring(inicio);
      onChange(nuevoTexto);
      setTimeout(() => {
        if (input) {
          input.focus();
          const nuevaPosicion = inicio - 1;
          input.setSelectionRange(nuevaPosicion, nuevaPosicion);
        }
      }, 10);
    }
  };

  const limpiar = () => {
    if (disabled) return;
    onChange('');
  };

  const categorias = {
    basico: {
      nombre: 'Básico',
      icono: '123',
      botones: [
        [
          { texto: '7', tipo: 'numero' },
          { texto: '8', tipo: 'numero' },
          { texto: '9', tipo: 'numero' },
          { texto: '÷', valor: '/', tipo: 'operador' },
          { texto: 'AC', accion: limpiar, tipo: 'clear' },
        ],
        [
          { texto: '4', tipo: 'numero' },
          { texto: '5', tipo: 'numero' },
          { texto: '6', tipo: 'numero' },
          { texto: '×', valor: '*', tipo: 'operador' },
          { texto: '⌫', accion: borrar, tipo: 'borrar' },
        ],
        [
          { texto: '1', tipo: 'numero' },
          { texto: '2', tipo: 'numero' },
          { texto: '3', tipo: 'numero' },
          { texto: '−', valor: '-', tipo: 'operador' },
          { texto: '(', tipo: 'parentesis' },
        ],
        [
          { texto: '0', tipo: 'numero-grande', span: 2 },
          { texto: '.', tipo: 'numero' },
          { texto: '+', tipo: 'operador' },
          { texto: ')', tipo: 'parentesis' },
        ],
      ]
    },
    algebra: {
      nombre: 'Álgebra',
      icono: 'f(x)',
      botones: [
        [
          { texto: 'x', tipo: 'variable' },
          { texto: 'y', tipo: 'variable' },
          { texto: 'x²', valor: '^2', tipo: 'potencia' },
          { texto: 'xⁿ', valor: '^', tipo: 'potencia' },
          { texto: '√', valor: 'sqrt()', tipo: 'raiz', cursorBack: 1 },
        ],
        [
          { texto: 'π', valor: 'pi', tipo: 'constante' },
          { texto: 'e', tipo: 'constante' },
          { texto: '1/x', valor: '1/', tipo: 'fraccion' },
          { texto: 'x³', valor: '^3', tipo: 'potencia' },
          { texto: '|x|', valor: 'abs()', tipo: 'funcion', cursorBack: 1 },
        ],
        [
          { texto: '∛', valor: 'cbrt()', tipo: 'raiz', cursorBack: 1 },
          { texto: 'x!', valor: 'factorial()', tipo: 'funcion', cursorBack: 1 },
          { texto: ',', tipo: 'separador' },
          { texto: '<', tipo: 'operador' },
          { texto: '>', tipo: 'operador' },
        ],
      ]
    },
    trigonometria: {
      nombre: 'Trigonometría',
      icono: '∿',
      botones: [
        [
          { texto: 'sin', valor: 'sin()', tipo: 'trig', cursorBack: 1 },
          { texto: 'cos', valor: 'cos()', tipo: 'trig', cursorBack: 1 },
          { texto: 'tan', valor: 'tan()', tipo: 'trig', cursorBack: 1 },
        ],
        [
          { texto: 'asin', valor: 'asin()', tipo: 'trig', cursorBack: 1 },
          { texto: 'acos', valor: 'acos()', tipo: 'trig', cursorBack: 1 },
          { texto: 'atan', valor: 'atan()', tipo: 'trig', cursorBack: 1 },
        ],
        [
          { texto: 'sinh', valor: 'sinh()', tipo: 'trig', cursorBack: 1 },
          { texto: 'cosh', valor: 'cosh()', tipo: 'trig', cursorBack: 1 },
          { texto: 'tanh', valor: 'tanh()', tipo: 'trig', cursorBack: 1 },
        ],
      ]
    },
    exponencial: {
      nombre: 'Exponencial',
      icono: 'eˣ',
      botones: [
        [
          { texto: 'eˣ', valor: 'exp()', tipo: 'exp', cursorBack: 1 },
          { texto: 'ln', valor: 'log()', tipo: 'log', cursorBack: 1 },
          { texto: 'log₁₀', valor: 'log10()', tipo: 'log', cursorBack: 1 },
          { texto: 'log₂', valor: 'log2()', tipo: 'log', cursorBack: 1 },
        ],
        [
          { texto: '10ˣ', valor: '10^', tipo: 'exp' },
          { texto: '2ˣ', valor: '2^', tipo: 'exp' },
          { texto: 'e', tipo: 'constante' },
          { texto: 'π', valor: 'pi', tipo: 'constante' },
        ],
      ]
    },
  };

  const manejarClick = (boton) => {
    if (boton.accion) {
      boton.accion();
    } else {
      const textoInsertar = boton.valor || boton.texto;
      insertarTexto(textoInsertar);
      
      // Si tiene cursorBack, mover el cursor hacia atrás
      if (boton.cursorBack) {
        setTimeout(() => {
          const input = document.getElementById('funcion-input');
          if (input) {
            input.focus();
            const posicionActual = input.selectionStart || 0;
            const nuevaPosicion = Math.max(0, posicionActual - boton.cursorBack);
            input.setSelectionRange(nuevaPosicion, nuevaPosicion);
          }
        }, 20);
      }
    }
  };

  return (
    <div className="calculadora-geogebra">
      <div className="calc-tabs">
        {Object.entries(categorias).map(([key, cat]) => (
          <button
            key={key}
            className={`calc-tab ${categoriaActiva === key ? 'activo' : ''}`}
            onClick={() => setCategoriaActiva(key)}
            disabled={disabled}
          >
            <span className="tab-icono">{cat.icono}</span>
            <span className="tab-nombre">{cat.nombre}</span>
          </button>
        ))}
      </div>

      <div className="calc-panel">
        <div className="calc-grid">
          {categorias[categoriaActiva].botones.map((fila, indexFila) => (
            <div key={indexFila} className="calc-fila">
              {fila.map((boton, indexBoton) => (
                <button
                  key={indexBoton}
                  className={`calc-btn calc-btn-${boton.tipo} ${boton.span ? `span-${boton.span}` : ''}`}
                  onClick={() => manejarClick(boton)}
                  disabled={disabled}
                  title={boton.valor ? `Insertar: ${boton.valor}` : boton.texto}
                >
                  {boton.texto}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="calc-ejemplos">
        <span className="ejemplo-titulo">💡 Ejemplos:</span>
        <button 
          className="ejemplo-btn"
          onClick={() => !disabled && onChange('x^3 - x - 2')}
          disabled={disabled}
          title="Polinomio cúbico"
        >
          x³ - x - 2
        </button>
        <button 
          className="ejemplo-btn"
          onClick={() => !disabled && onChange('sin(x) - x/2')}
          disabled={disabled}
          title="Función trigonométrica"
        >
          sin(x) - x/2
        </button>
        <button 
          className="ejemplo-btn"
          onClick={() => !disabled && onChange('exp(x) - 3*x')}
          disabled={disabled}
          title="Función exponencial"
        >
          eˣ - 3x
        </button>
        <button 
          className="ejemplo-btn"
          onClick={() => !disabled && onChange('x^2 - 4')}
          disabled={disabled}
          title="Ecuación cuadrática"
        >
          x² - 4
        </button>
      </div>
    </div>
  );
}

export default CalculadoraMatematica;