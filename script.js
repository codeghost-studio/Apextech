/* ===========================================
   APEX TECH PERFORMANCE — script.js
   Versión mejorada con todas las funciones
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 1. CANVAS DE PARTÍCULAS (sin librería externa)
    // =============================================
    const canvas  = document.getElementById('particle-canvas');
    const ctx     = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 12000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x:     Math.random() * canvas.width,
                y:     Math.random() * canvas.height,
                vx:    (Math.random() - 0.5) * 0.6,
                vy:    (Math.random() - 0.5) * 0.6,
                r:     Math.random() * 1.8 + 0.5,
                alpha: Math.random() * 0.4 + 0.1,
            });
        }
    }

    let mouseX = -9999, mouseY = -9999;
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            // Atraer suavemente hacia el cursor
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                p.vx += dx / dist * 0.015;
                p.vy += dy / dist * 0.015;
            }

            // Velocidad máxima
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 1.5) { p.vx *= 0.95; p.vy *= 0.95; }

            p.x += p.vx;
            p.y += p.vy;

            // Rebote en bordes
            if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height)  p.vy *= -1;
            p.x = Math.max(0, Math.min(canvas.width,  p.x));
            p.y = Math.max(0, Math.min(canvas.height, p.y));

            // Dibujar partícula
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
            ctx.fill();
        });

        // Líneas de conexión entre partículas cercanas
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    const opacity = (1 - dist / 140) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        animFrame = requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animFrame);
        resizeCanvas();
        createParticles();
        drawParticles();
    });


    // =============================================
    // 2. MENÚ MÓVIL
    // =============================================
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu   = document.querySelector('.nav-menu');

    const resetMenu = () => {
        navMenu.classList.remove('active');
        const icon = navToggle.querySelector('i');
        icon.classList.replace('fa-times', 'fa-bars');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpening = !navMenu.classList.contains('active');
        navMenu.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', String(isOpening));
        const icon = navToggle.querySelector('i');
        if (isOpening) {
            icon.classList.replace('fa-bars', 'fa-times');
            document.body.style.overflow = 'hidden';
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active')
            && !navMenu.contains(e.target)
            && !navToggle.contains(e.target)) {
            resetMenu();
        }
    });

    // Cerrar al hacer click en un enlace
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) resetMenu();
        });
    });


    // =============================================
    // 3. HEADER AL HACER SCROLL
    // =============================================
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const current = window.scrollY;
            header.classList.toggle('scrolled', current > 60);
            lastScroll = current;
        });
    });


    // =============================================
    // 4. REVEAL CON INTERSECTION OBSERVER
    // =============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


    // =============================================
    // 5. CONTADOR ANIMADO DE MÉTRICAS
    // =============================================
    function animateCounter(el, end, prefix = '', suffix = '', duration = 1800) {
        const start     = 0;
        const startTime = performance.now();
        const isFloat   = String(end).includes('.');

        function update(now) {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out quart
            const eased    = 1 - Math.pow(1 - progress, 4);
            const current  = start + (end - start) * eased;
            el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = prefix + end + suffix;
        }

        requestAnimationFrame(update);
    }

    const metricObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el     = entry.target;
                const end    = parseFloat(el.dataset.end);
                const prefix = el.dataset.prefix || '';
                const suffix = el.dataset.suffix || '';
                animateCounter(el, end, prefix, suffix);
                metricObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.metric-number').forEach(el => metricObserver.observe(el));


    // =============================================
    // 6. FORMULARIO DE CONTACTO CON VALIDACIÓN
    // =============================================
    const form = document.getElementById('apex-form');

    if (form) {
        const nameInput  = form.querySelector('#name');
        const emailInput = form.querySelector('#email');
        const msgInput   = form.querySelector('#msg');
        const btn        = form.querySelector('.btn-submit');

        function setError(input, errorId, message) {
            input.classList.add('error');
            const errorEl = document.getElementById(errorId);
            errorEl.textContent = message;
            errorEl.classList.add('visible');
        }

        function clearError(input, errorId) {
            input.classList.remove('error');
            const errorEl = document.getElementById(errorId);
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }

        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function validate() {
            let valid = true;

            if (nameInput.value.trim().length < 2) {
                setError(nameInput, 'name-error', 'El nombre debe tener al menos 2 caracteres.');
                valid = false;
            } else {
                clearError(nameInput, 'name-error');
            }

            if (!validateEmail(emailInput.value.trim())) {
                setError(emailInput, 'email-error', 'Ingresa un correo electrónico válido.');
                valid = false;
            } else {
                clearError(emailInput, 'email-error');
            }

            if (msgInput.value.trim().length < 10) {
                setError(msgInput, 'msg-error', 'El mensaje debe ser más descriptivo (mín. 10 caracteres).');
                valid = false;
            } else {
                clearError(msgInput, 'msg-error');
            }

            return valid;
        }

        // Validar en tiempo real
        [nameInput, emailInput, msgInput].forEach(input => {
            input.addEventListener('input', () => {
                validate();
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Anti-spam honeypot
            const honeypot = form.querySelector('input[name="honeypot"]');
            if (honeypot && honeypot.value) return;

            if (!validate()) return;

            // Estado de carga
            const originalHTML = btn.innerHTML;
            btn.innerHTML  = 'Transfiriendo Datos... <i class="fas fa-sync fa-spin"></i>';
            btn.disabled   = true;
            btn.classList.remove('success');

            // ─── Si tienes backend propio, reemplaza esta sección ───
            // const response = await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         name:    nameInput.value.trim(),
            //         email:   emailInput.value.trim(),
            //         message: msgInput.value.trim(),
            //     })
            // });
            // const data = await response.json();
            // ────────────────────────────────────────────────────────

            // Simulación de envío (2 segundos)
            await new Promise(res => setTimeout(res, 2000));

            btn.innerHTML = '¡Solicitud Enviada! <i class="fas fa-check"></i>';
            btn.classList.add('success');
            form.reset();

            // Resetear botón tras 4 segundos
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled  = false;
                btn.classList.remove('success');
            }, 4000);
        });
    }


    // =============================================
    // 7. SCROLL SUAVE PARA ANCLAS
    // =============================================
    function scrollToSection(id) {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    window.scrollToSection = scrollToSection;
    window.closeMenu       = resetMenu;

});
