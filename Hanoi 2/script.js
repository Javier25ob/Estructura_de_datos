class Pila {
    constructor() {
        this.items = [];
    }
    apilar(elemento) {
        this.items.push(elemento);
    }
    desapilar() {
        return this.items.pop();
    }
    cima() {
        return this.items[this.items.length - 1];
    }
    estaVacia() {
        return this.items.length === 0;
    }
    copiar() {
        const nuevaPila = new Pila();
        nuevaPila.items = [...this.items];
        return nuevaPila;
    }
}

// Variables globales
let torres = [new Pila(), new Pila(), new Pila()];
let numDiscos = 3;
let contador = 0;
let autoEjecutando = false;
let modoManual = false;
let discoSeleccionado = null;
let torreOrigenSeleccionada = null;
const sonido = document.getElementById('moveSound');

const torresHTML = [
    document.getElementById('torre1'),
    document.getElementById('torre2'),
    document.getElementById('torre3')
];

function iniciar() {
    autoEjecutando = false;
    modoManual = false;
    
    numDiscos = parseInt(document.getElementById('numDiscos').value);
    contador = 0;
    actualizarContador();

    // Restaurar botones
    const btnManual = document.getElementById('btnManual');
    const btnAuto = document.getElementById('btnAuto');
    btnManual.style.background = '#27ae60';
    btnManual.textContent = '👆 Modo Manual';
    if (btnAuto) {
        btnAuto.disabled = false;
        btnAuto.textContent = '🤖 Solución Automática';
    }
    
    const instrucciones = document.getElementById('instrucciones');
    if (instrucciones) {
        instrucciones.textContent = '';
    }
    
    limpiarSeleccion();
    
    // Reiniciar torres
    torres = [new Pila(), new Pila(), new Pila()];
    torresHTML.forEach(t => {
        if (t) {
            t.querySelectorAll('.disco').forEach(d => d.remove());
        }
    });

    // Crear discos iniciales
    for (let i = numDiscos; i >= 1; i--) {
        torres[0].apilar(i);
    }
    
    render();
}

function actualizarContador() {
    const contadorElement = document.getElementById('contador');
    if (contadorElement) {
        contadorElement.textContent = `Movimientos: ${contador}`;
    }
}

function verificarVictoria() {
    if (torres[2].items.length === numDiscos) {
        setTimeout(() => {
            alert(`🎉 ¡Felicidades! Completaste el juego en ${contador} movimientos.\n\nLa solución óptima para ${numDiscos} discos es ${Math.pow(2, numDiscos) - 1} movimientos.`);
        }, 500);
        return true;
    }
    return false;
}

function moverDisco(origen, destino) {
    if (torres[origen].estaVacia()) return false;
    const disco = torres[origen].cima();
    if (!torres[destino].estaVacia() && torres[destino].cima() < disco) return false;

    torres[origen].desapilar();
    torres[destino].apilar(disco);
    
    if (sonido) {
        sonido.play().catch(e => console.log('Error reproduciendo sonido:', e));
    }
    
    contador++;
    actualizarContador();
    render();
    
    if (!autoEjecutando) {
        verificarVictoria();
    }
    
    return true;
}

function render() {
    torresHTML.forEach((torreEl, i) => {
        if (torreEl) {
            torreEl.querySelectorAll('.disco').forEach(d => d.remove());
            
            const discos = torres[i].items;
            discos.forEach((disco, index) => {
                const d = document.createElement('div');
                d.classList.add('disco');
                d.textContent = disco;
                d.style.width = `${50 + disco * 15}px`;
                d.style.background = `hsl(${disco * 35}, 80%, 60%)`;
                d.style.height = '25px';
                d.style.lineHeight = '25px';
                d.style.bottom = `${index * 28}px`;
                d.style.zIndex = disco;
                torreEl.appendChild(d);
            });
        }
    });
}

// Funciones para el modo manual
function limpiarSeleccion() {
    discoSeleccionado = null;
    torreOrigenSeleccionada = null;
    document.querySelectorAll('.disco.seleccionado').forEach(disco => {
        disco.classList.remove('seleccionado');
    });
}

function activarModoManual() {
    if (autoEjecutando) {
        autoEjecutando = false;
        const btnAuto = document.getElementById('btnAuto');
        if (btnAuto) {
            btnAuto.disabled = false;
            btnAuto.textContent = '🤖 Solución Automática';
        }
    }
    
    modoManual = !modoManual;
    const btnManual = document.getElementById('btnManual');
    const instrucciones = document.getElementById('instrucciones');
    
    if (modoManual) {
        btnManual.style.background = '#e74c3c';
        btnManual.textContent = '❌ Salir Modo Manual';
        if (instrucciones) {
            instrucciones.textContent = 'Haz clic en un disco para seleccionarlo, luego en una torre para moverlo';
        }
    } else {
        btnManual.style.background = '#27ae60';
        btnManual.textContent = '👆 Modo Manual';
        if (instrucciones) {
            instrucciones.textContent = '';
        }
        limpiarSeleccion();
    }
}

function manejarClicTorre(indiceTorre) {
    if (!modoManual || indiceTorre < 0 || indiceTorre > 2) return;
    
    if (discoSeleccionado === null) {
        if (!torres[indiceTorre].estaVacia()) {
            torreOrigenSeleccionada = indiceTorre;
            discoSeleccionado = torres[indiceTorre].cima();
            
            const torreEl = torresHTML[indiceTorre];
            if (torreEl) {
                const discosEnTorre = torreEl.querySelectorAll('.disco');
                if (discosEnTorre.length > 0) {
                    discosEnTorre[discosEnTorre.length - 1].classList.add('seleccionado');
                }
            }
            
            const instrucciones = document.getElementById('instrucciones');
            if (instrucciones) {
                instrucciones.textContent = `Disco ${discoSeleccionado} seleccionado. Haz clic en la torre destino`;
            }
        }
    } else {
        if (indiceTorre !== torreOrigenSeleccionada) {
            const exito = moverDisco(torreOrigenSeleccionada, indiceTorre);
            const instrucciones = document.getElementById('instrucciones');
            if (instrucciones) {
                if (exito) {
                    instrucciones.textContent = `Movimiento exitoso! Disco ${discoSeleccionado} movido a Torre ${indiceTorre + 1}`;
                } else {
                    instrucciones.textContent = 'Movimiento inválido. Intenta con otra torre';
                }
            }
        } else {
            const instrucciones = document.getElementById('instrucciones');
            if (instrucciones) {
                instrucciones.textContent = 'Selecciona una torre diferente a la origen';
            }
        }
        limpiarSeleccion();
    }
}

// SOLUCIÓN AUTOMÁTICA CORREGIDA - TRABAJA CON EL ESTADO ACTUAL
function encontrarTorreDisco(discoBuscado) {
    for (let i = 0; i < 3; i++) {
        if (torres[i].items.includes(discoBuscado)) {
            return i;
        }
    }
    return -1;
}

async function resolverDesdeEstadoActual() {
    // Encontrar dónde está cada disco
    const posiciones = {};
    for (let disco = 1; disco <= numDiscos; disco++) {
        posiciones[disco] = encontrarTorreDisco(disco);
    }
    
    // Resolver recursivamente desde el estado actual
    await resolverRecursivo(numDiscos, 2, posiciones);
}

async function resolverRecursivo(disco, destino, posiciones) {
    if (!autoEjecutando || disco === 0) return;
    
    const torreActual = posiciones[disco];
    
    // Si el disco ya está en su posición destino, resolver el siguiente
    if (torreActual === destino) {
        await resolverRecursivo(disco - 1, destino, posiciones);
        return;
    }
    
    // Encontrar torre auxiliar (la que no es la actual ni el destino)
    const torreAuxiliar = [0, 1, 2].find(t => t !== torreActual && t !== destino);
    
    // Mover discos más pequeños a la torre auxiliar
    await resolverRecursivo(disco - 1, torreAuxiliar, posiciones);
    
    if (!autoEjecutando) return;
    
    // Mover el disco actual al destino
    await new Promise(r => setTimeout(r, 600));
    if (!autoEjecutando) return;
    
    const exito = moverDisco(torreActual, destino);
    if (exito) {
        posiciones[disco] = destino; // Actualizar posición
    }
    
    if (!autoEjecutando) return;
    
    // Mover discos más pequeños del auxiliar al destino
    await resolverRecursivo(disco - 1, destino, posiciones);
}

// SOLUCIÓN AUTOMÁTICA COMPLETA DESDE CERO
async function solucionAutomaticaCompleta(n, origen, auxiliar, destino) {
    if (n === 0 || !autoEjecutando) return;
    
    if (n === 1) {
        if (!autoEjecutando) return;
        await new Promise(r => setTimeout(r, 600));
        if (!autoEjecutando) return;
        moverDisco(origen, destino);
    } else {
        await solucionAutomaticaCompleta(n - 1, origen, destino, auxiliar);
        if (!autoEjecutando) return;
        await solucionAutomaticaCompleta(1, origen, auxiliar, destino);
        if (!autoEjecutando) return;
        await solucionAutomaticaCompleta(n - 1, auxiliar, origen, destino);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const btnIniciar = document.getElementById('btnIniciar');
    const btnReiniciar = document.getElementById('btnReiniciar');
    const btnManual = document.getElementById('btnManual');
    const btnAuto = document.getElementById('btnAuto');
    const btnCancelar = document.getElementById('btnCancelar');
    
    if (btnIniciar) btnIniciar.addEventListener('click', iniciar);
    if (btnReiniciar) btnReiniciar.addEventListener('click', iniciar);
    if (btnManual) btnManual.addEventListener('click', activarModoManual);
    
    if (btnAuto) {
        btnAuto.addEventListener('click', async () => {
            if (!autoEjecutando) {
                if (modoManual) {
                    activarModoManual();
                }
                
                autoEjecutando = true;
                btnAuto.disabled = true;
                btnAuto.textContent = '⏳ Ejecutando...';
                
                try {
                    // Verificar si el juego está en estado inicial
                    const torre3Vacia = torres[2].estaVacia();
                    const torre2Vacia = torres[1].estaVacia();
                    
                    if (torre3Vacia && torre2Vacia) {
                        // Estado inicial - usar solución completa
                        await solucionAutomaticaCompleta(numDiscos, 0, 1, 2);
                    } else {
                        // Estado intermedio - usar solución desde estado actual
                        await resolverDesdeEstadoActual();
                    }
                    
                    // Verificar victoria al finalizar
                    setTimeout(() => {
                        if (torres[2].items.length === numDiscos) {
                            alert(`✅ Solución automática completada en ${contador} movimientos.`);
                        }
                    }, 1000);
                    
                } catch (error) {
                    console.log('Ejecución cancelada');
                } finally {
                    autoEjecutando = false;
                    btnAuto.disabled = false;
                    btnAuto.textContent = '🤖 Solución Automática';
                }
            }
        });
    }
    
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            autoEjecutando = false;
            const btnAuto = document.getElementById('btnAuto');
            if (btnAuto) {
                btnAuto.disabled = false;
                btnAuto.textContent = '🤖 Solución Automática';
            }
        });
    }
    
    // Agregar event listeners a las torres
    torresHTML.forEach((torre, index) => {
        if (torre) {
            torre.addEventListener('click', () => manejarClicTorre(index));
        }
    });
    
    // Iniciar el juego al cargar
    iniciar();
});