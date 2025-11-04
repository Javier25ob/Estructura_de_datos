
// Clase Nodo
class Nodo {
  constructor(valor) {
    this.valor = valor;
    this.siguiente = null;
    this.anterior = null;
  }
}

// Clase ListaDoble
class ListaDoble {
  constructor() {
    this.cabeza = null;
    this.cola = null;
    this.longitud = 0;
  }

  apilar(valor) {
    const nuevoNodo = new Nodo(valor);
    if (!this.cabeza) {
      this.cabeza = nuevoNodo;
      this.cola = nuevoNodo;
    } else {
      nuevoNodo.anterior = this.cola;
      this.cola.siguiente = nuevoNodo;
      this.cola = nuevoNodo;
    }
    this.longitud++;
  }

  desapilar() {
    if (!this.cola) return undefined;
    const valor = this.cola.valor;
    if (this.cabeza === this.cola) {
      this.cabeza = null;
      this.cola   = null;
    } else {
      const previo = this.cola.anterior;
      previo.siguiente = null;
      this.cola = previo;
    }
    this.longitud--;
    return valor;
  }

  tope() {
    return this.cola ? this.cola.valor : undefined;
  }

  obtenerLongitud() {
    return this.longitud;
  }
}

// Variables globales
let torreA, torreB, torreC;
let numeroDiscos = 3;
let contadorMovimientos = 0;
let juegoTerminado = false;

const elementoContadorMovimientos = document.getElementById('contadorMovimientos');
const botonAutoSolucion = document.getElementById('botonAutoSolucion');
const botonIniciar = document.getElementById('botonIniciar');
const botonReiniciar = document.getElementById('botonReiniciar');
const entradaNumeroDiscos = document.getElementById('entradaNumDiscos');

// Iniciar juego
botonIniciar.addEventListener('click', () => {
  let n = parseInt(entradaNumeroDiscos.value, 10);
  if (isNaN(n) || n < 3) {
    n = 3;
    entradaNumeroDiscos.value = 3;
  }
  numeroDiscos = n;
  inicializarJuego();
});

// Reiniciar
botonReiniciar.addEventListener('click', inicializarJuego);

// Inicializar juego
function inicializarJuego() {
  torreA = new ListaDoble();
  torreB = new ListaDoble();
  torreC = new ListaDoble();

  contadorMovimientos = 0;
  juegoTerminado = false;
  elementoContadorMovimientos.textContent = `Movimientos: ${contadorMovimientos}`;
  botonAutoSolucion.disabled = false;

  for (let i = numeroDiscos; i >= 1; i--) {
    torreA.apilar(i);
  }

  renderizarTorres();
  activarArrastrarSoltar();
}

// Renderizar torres
function renderizarTorres() {
  ['A','B','C'].forEach(id => {
    const poste = document.querySelector(`#torre${id} .poste`);
    poste.innerHTML = '';

    const torre = (id === 'A' ? torreA : id === 'B' ? torreB : torreC);
    const arreglo = [];
    let actual = torre.cabeza;
    while (actual) {
      arreglo.push(actual.valor);
      actual = actual.siguiente;
    }

    arreglo.forEach((tamano, idx) => {
      const disco = document.createElement('div');
      disco.className = 'disco';
      disco.dataset.tamano = tamano;
      disco.dataset.torre  = id;

      // solo el disco superior es arrastrable
      if (idx === arreglo.length - 1) {
        disco.setAttribute('draggable', true);
      } else {
        disco.removeAttribute('draggable');
      }

      disco.style.width  = `${tamano * (100 / numeroDiscos)}%`;
      disco.style.left   = `${(100 - tamano*(100/numeroDiscos))/2}%`;
      disco.style.bottom = `${idx * 26}px`;
      disco.textContent   = tamano;
      poste.appendChild(disco);
    });
  });
}

// Obtener torre por ID
function obtenerTorrePorId(id) {
  if (id === 'A') return torreA;
  if (id === 'B') return torreB;
  if (id === 'C') return torreC;
  return null;
}

// Verificar si se puede mover
function puedeMover(origen, destino) {
  const valorMover   = origen.tope();
  const valorDestino = destino.tope();
  if (valorMover === undefined) return false;
  if (valorDestino === undefined) return true;
  return valorMover < valorDestino;
}

// Mover disco manual
function moverDisco(idDesde, idHacia) {
  if (juegoTerminado) return;

  const torreDesde  = obtenerTorrePorId(idDesde);
  const torreHacia  = obtenerTorrePorId(idHacia);

  const valorMover   = torreDesde.tope();
  const valorDestino = torreHacia.tope();

  if (valorMover === undefined) {
    return;
  }
  if (!puedeMover(torreDesde, torreHacia)) {
    return;
  }

  torreDesde.desapilar();
  torreHacia.apilar(valorMover);

  contadorMovimientos++;
  elementoContadorMovimientos.textContent = `Movimientos: ${contadorMovimientos}`;
  renderizarTorres();
  activarArrastrarSoltar();
  verificarVictoria();
}

// Arrastrar y soltar
function activarArrastrarSoltar() {
  const discos = document.querySelectorAll('.disco');
  const postes = document.querySelectorAll('.poste');

  discos.forEach(disco => {
    disco.addEventListener('dragstart', e => {
      if (juegoTerminado) {
        e.preventDefault();
        return;
      }
      if (!disco.hasAttribute('draggable')) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData('torreOrigen', disco.dataset.torre);
    });
  });

  postes.forEach(poste => {
    poste.addEventListener('dragover', e => {
      if (juegoTerminado) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
    });
    poste.addEventListener('drop', e => {
      if (juegoTerminado) return;
      const idDesde = e.dataTransfer.getData('torreOrigen');
      const idHacia = poste.dataset.torre;
      moverDisco(idDesde, idHacia);
    });
  });
}

// Verificar victoria
function verificarVictoria() {
  if (torreC.obtenerLongitud() === numeroDiscos) {
    juegoTerminado = true;
    setTimeout(() => {
      alert("¡Felicidades! Has completado la Torre de Hanoi!");
    }, 100);
  }
}

// Función para desactivar arrastre manual
function desactivarArrastrarSoltar() {
  const discos = document.querySelectorAll('.disco');
  discos.forEach(disco => {
    disco.removeAttribute('draggable');
  });
  const postes = document.querySelectorAll('.poste');
  postes.forEach(poste => {
    poste.removeEventListener('dragover', e => {});
    poste.removeEventListener('drop',    e => {});
  });
}

// Solución automática
botonAutoSolucion.addEventListener('click', () => {
  if (juegoTerminado) return;
  desactivarArrastrarSoltar();
  botonAutoSolucion.disabled = true;
  resolverAutomaticamenteAdaptado(numeroDiscos, 'A', 'C', 'B')
    .then(() => {
      juegoTerminado = true;
      alert("Solución automática completada!");
    });
});

function resolverAutomaticamenteAdaptado(n, desde, hacia, aux) {
  if (n === 0) {
    return Promise.resolve();
  }
  return resolverAutomaticamenteAdaptado(n - 1, desde, aux, hacia)
    .then(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          moverDisco(desde, hacia);
          resolve();
        }, 500);
      });
    })
    .then(() => {
      return resolverAutomaticamenteAdaptado(n - 1, aux, hacia, desde);
    });
}

// Inicializar por defecto al cargar
inicializarJuego();
