// 1. DATA MASTER: Definimos la estructura real del complejo La Redonda con fotos estables de fútbol
const canchasLaRedonda = [
    { 
        id: 1, 
        nombre: "Cancha 1 (Fútbol 5 / Hockey)", 
        caracteristicas: "Césped sintético • Descubierta • Con Iluminación",
        imagen: "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=600&auto=format&fit=crop" 
    },
    { 
        id: 2, 
        nombre: "Cancha 2 (Fútbol 5)", 
        caracteristicas: "Césped sintético • Techada • Con Iluminación",
        imagen: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop"
    },
    { 
        id: 3, 
        nombre: "Cancha 3 (Fútbol 5)", 
        caracteristicas: "Césped sintético • Descubierta • Con Iluminación",
        imagen: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=600&auto=format&fit=crop"
    },
    { 
        id: 4, 
        nombre: "Canchita de Cumpleaños", 
        caracteristicas: "Espacio techado infantil • Salón de eventos integrado",
        imagen: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600&auto=format&fit=crop"
    }
];

// Horarios de alquiler de 14:00 a 23:00 (último turno operativo)
const horasOperativas = ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

// Elementos capturados de la interfaz
const daysBar = document.getElementById('days-bar');
const canchasContainer = document.getElementById('canchas-container');
const modal = document.getElementById('modal-reserva');
const formConfirmar = document.getElementById('form-confirmar');

let fechaSeleccionada = "";
let datosTurnoAProcesar = null; 

// 2. MOVIMIENTO 1: Generar la barra de días dinámicamente (Hoy + siguientes 6 días)
function inicializarBarraDias() {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    for (let i = 0; i < 7; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + i);
        
        const fechaISO = fecha.toISOString().split('T')[0];
        const nombreDia = i === 0 ? "Hoy" : diasSemana[fecha.getDay()];
        const numeroDia = fecha.getDate();

        const botonDia = document.createElement('button');
        botonDia.classList.add('day-btn');
        if (i === 0) {
            botonDia.classList.add('active');
            fechaSeleccionada = fechaISO; 
        }

        botonDia.innerHTML = `${nombreDia} <small>${numeroDia}</small>`;
        
        botonDia.addEventListener('click', () => {
            document.querySelector('.day-btn.active').classList.remove('active');
            botonDia.classList.add('active');
            fechaSeleccionada = fechaISO;
            renderizarCanchasYHorarios(); 
        });

        daysBar.appendChild(botonDia);
    }
}

// 3. MOVIMIENTO 2: Construir las tarjetas e inyectar turnos independientes
function renderizarCanchasYHorarios() {
    canchasContainer.innerHTML = ""; 

    const turnosReservados = JSON.parse(localStorage.getItem('turnos_laredonda')) || [];

    canchasLaRedonda.forEach(cancha => {
        const card = document.createElement('div');
        card.classList.add('cancha-card');
        
        card.style.setProperty('--bg-image', `url('${cancha.imagen}')`);

        card.innerHTML = `
            <div class="cancha-info">
                <h2>${cancha.nombre}</h2>
                <p class="cancha-features">${cancha.caracteristicas}</p>
            </div>
            <div class="grid-horarios" id="grid-cancha-${cancha.id}"></div>
        `;
        canchasContainer.appendChild(card);

        const gridHorarios = document.getElementById(`grid-cancha-${cancha.id}`);

        horasOperativas.forEach(hora => {
            const btnHora = document.createElement('button');
            btnHora.classList.add('hora-btn');
            btnHora.innerText = hora;

            const estaOcupada = turnosReservados.some(t => t.fecha === fechaSeleccionada && t.canchaId === cancha.id && t.hora === hora);

            if (estaOcupada) {
                btnHora.classList.add('ocupado');
                btnHora.disabled = true;
            } else {
                btnHora.addEventListener('click', () => {
                    datosTurnoAProcesar = { cancha, hora, fecha: fechaSeleccionada };
                    abrirModal();
                });
            }
            gridHorarios.appendChild(btnHora);
        });
    });
}

// 4. MOVIMIENTO 3: Manejo del Modal de confirmación
function abrirModal() {
    document.getElementById('modal-detalles-turno').innerText = 
        `🏟️ Cancha: ${datosTurnoAProcesar.cancha.nombre}\n📅 Fecha: ${datosTurnoAProcesar.fecha}\n⏰ Hora: ${datosTurnoAProcesar.hora} hs`;
    modal.classList.add('open');
}

document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
    modal.classList.remove('open');
});

// 5. MOVIMIENTO 4: Al enviar, se guarda local y se dispara el WhatsApp directo
formConfirmar.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre-cliente').value;
    const telefono = document.getElementById('tel-cliente').value;

    const nuevoTurno = {
        id: Date.now(),
        canchaId: datosTurnoAProcesar.cancha.id,
        nombreCancha: datosTurnoAProcesar.cancha.nombre,
        fecha: datosTurnoAProcesar.fecha,
        hora: datosTurnoAProcesar.hora,
        nombre,
        telefono
    };

    const turnosReservados = JSON.parse(localStorage.getItem('turnos_laredonda')) || [];
    turnosReservados.push(nuevoTurno);
    localStorage.setItem('turnos_laredonda', JSON.stringify(turnosReservados));

    const numeroLaRedonda = "3434468191"; 
    const mensaje = `¡Hola La Redonda! ⚽\nQuiero confirmar una reserva:\n\n🏟️ *${nuevoTurno.nombreCancha}*\n📅 *Fecha:* ${nuevoTurno.fecha}\n⏰ *Hora:* ${nuevoTurno.hora} hs\n👤 *A nombre de:* ${nombre}\n📱 *Contacto:* ${telefono}`;
    
    window.open(`https://wa.me/${numeroLaRedonda}?text=${encodeURIComponent(mensaje)}`, '_blank');

    modal.classList.remove('open');
    formConfirmar.reset();
    renderizarCanchasYHorarios();
});

// Inicialización de la App
inicializarBarraDias();
renderizarCanchasYHorarios();