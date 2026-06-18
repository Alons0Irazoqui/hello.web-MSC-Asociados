(function () {
                'use strict';

                /* ----------------------------------------------------------
                   REFERENCIAS DOM
                   ---------------------------------------------------------- */
                var plEl = document.getElementById('preloader');
                var plRing = document.getElementById('plRing');
                var plBar = document.getElementById('plBar');
                var plCount = document.getElementById('plCount');
                var heroRan = false;

                /* ----------------------------------------------------------
                   1. PRELOADER — anillo SVG + letras + contador
                   ---------------------------------------------------------- */
                var CIRCUM = 534.07; // 2π × 85
                var PL_DUR = 2000;   // ms duración total

                setTimeout(function () {
                    var logo = document.getElementById('plLogoImg');
                    if (logo) logo.classList.remove('opacity-0', 'translate-y-2', 'scale-90');
                }, 180);
                setTimeout(function () { var firm = document.getElementById('plFirm'); if (firm) firm.classList.add('pl-show'); }, 500);

                var t0 = performance.now();
                function tickLoader(now) {
                    var elapsed = now - t0;
                    var raw = Math.min(elapsed / PL_DUR, 1);
                    var eased = 1 - Math.pow(1 - raw, 3);
                    var pct = Math.round(eased * 100);
                    if (plRing) plRing.style.strokeDashoffset = CIRCUM * (1 - eased);
                    if (plBar) plBar.style.width = pct + '%';
                    if (plCount) plCount.textContent = pct + '%';
                    if (raw < 1) { requestAnimationFrame(tickLoader); }
                    else { setTimeout(dismissLoader, 150); }
                }
                requestAnimationFrame(tickLoader);

                /* ----------------------------------------------------------
                   2. IRIS REVEAL — radial-gradient animado con rAF
                      Crea un círculo que se abre de ADENTRO hacia AFUERA
                   ---------------------------------------------------------- */
                var irisEl = document.getElementById('irisOverlay');
                var irisT0 = null;
                var IRIS_DUR = 1550; // ms que tarda el círculo en abrirse

                function animateIris(now) {
                    if (!irisT0) irisT0 = now;
                    var t = Math.min((now - irisT0) / IRIS_DUR, 1);
                    // Ease-out cubic → arranca rápido, desacelera al final
                    var ease = 1 - Math.pow(1 - t, 3);
                    var r = ease * 210; // % — llega a 210% para cubrir toda la pantalla diagonal

                    // Centro transparente (página visible) + borde dorado brillante + exterior oscuro
                    irisEl.style.background =
                        'radial-gradient(circle at 50% 50%, ' +
                        'transparent ' + (r - 0.1).toFixed(2) + '%, ' +
                        'rgba(197,160,89,0.55) ' + r.toFixed(2) + '%, ' +
                        '#0B132B ' + (r + 1.2).toFixed(2) + '%)';

                    if (t < 1) {
                        requestAnimationFrame(animateIris);
                    } else {
                        irisEl.style.display = 'none'; // retira el overlay
                    }
                }

                /* ----------------------------------------------------------
                   3. DISMISS PRELOADER + ABRIR IRIS
                   ---------------------------------------------------------- */
                function dismissLoader() {
                    // Lanzar la animación iris INMEDIATAMENTE
                    requestAnimationFrame(animateIris);

                    // Fade del preloader empieza 300ms después
                    // (así el iris ya es visible cuando el preloader se va)
                    setTimeout(function () { plEl.classList.add('pl-hidden'); }, 300);

                    // Animaciones de entrada del hero
                    setTimeout(startHeroEntrance, 600);

                    // Corner accents
                    setTimeout(function () {
                        document.querySelectorAll('.ca').forEach(function (ca) {
                            ca.classList.add('ca-on');
                        });
                    }, 1000);

                    // Habilitar scroll cuando el iris termina
                    setTimeout(function () {
                        document.body.style.overflow = '';
                    }, IRIS_DUR + 200);
                }

                // Bloquear scroll durante iris
                document.body.style.overflow = 'hidden';

                // Fallback de seguridad
                window.addEventListener('load', function () {
                    setTimeout(function () {
                        if (!plEl.classList.contains('pl-hidden')) dismissLoader();
                    }, 3800);
                });

                /* ----------------------------------------------------------
                   3. SPLIT TEXTO HERO LINE 1 — palabras individuales
                   ---------------------------------------------------------- */
                var wordSpans = [];

                function splitWords(el) {
                    if (!el) return [];
                    var raw = el.textContent;
                    var words = raw.trim().split(/\s+/);
                    el.innerHTML = '';
                    var spans = [];
                    words.forEach(function (word, i) {
                        var wrap = document.createElement('span');
                        wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
                        var inner = document.createElement('span');
                        inner.className = 'hw';
                        inner.textContent = word;
                        wrap.appendChild(inner);
                        el.appendChild(wrap);
                        spans.push(inner);
                        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
                    });
                    return spans;
                }

                /* ----------------------------------------------------------
                   4. SECUENCIA DE ENTRADA HERO
                   ---------------------------------------------------------- */
                function startHeroEntrance() {
                    if (heroRan) return;
                    heroRan = true;

                    var hLine1 = document.getElementById('hLine1');

                    // Partir headline línea 1 en palabras
                    wordSpans = splitWords(hLine1);
                    if (hLine1) hLine1.style.opacity = '1';

                    // Animar palabras una por una
                    wordSpans.forEach(function (span, i) {
                        setTimeout(function () {
                            span.classList.add('hw-in');
                        }, 60 + i * 85);
                    });

                    // Calcular cuándo terminan las palabras
                    var wordsDone = 60 + (wordSpans.length - 1) * 85 + 900;

                    // Switch a float wave después de la entrada
                    setTimeout(function () {
                        activateFloatWave();
                    }, wordsDone + 400);

                    // Animar el resto de .hero-el normalmente
                    var heroEls = document.querySelectorAll('.hero-el');
                    var scrl = document.querySelector('.scroll-indicator');
                    heroEls.forEach(function (el) {
                        var d = parseInt(el.getAttribute('data-delay')) || 0;
                        setTimeout(function () { el.classList.add('visible'); }, d);
                    });
                    setTimeout(function () { scrl && scrl.classList.add('si-visible'); }, 1300);

                    // Arrancar typewriter cuando el elemento del tw ya es visible
                    setTimeout(startTypewriter, 820);
                }

                /* ----------------------------------------------------------
                   5. FLOAT WAVE — movimiento constante en palabras del headline
                   ---------------------------------------------------------- */
                function activateFloatWave() {
                    wordSpans.forEach(function (span, i) {
                        // Reset clase de entrada, mantener visible
                        span.style.opacity = '1';
                        span.style.transform = 'translateY(0)';
                        span.className = 'hw';
                        // Delay escalonado para efecto de ola
                        var dur = (3.0 + Math.random() * 1.0).toFixed(2);
                        var delay = (i * 0.18).toFixed(2);
                        span.style.animation = 'hwFloat ' + dur + 's ease-in-out ' + delay + 's infinite';
                    });
                }

                /* ----------------------------------------------------------
                   6. TYPEWRITER — cicla especialidades legales
                   ---------------------------------------------------------- */
                var twPhrases = [
                    'Derecho Familiar',
                    'Derecho Corporativo',
                    'Derecho Laboral',
                    'Derecho Fiscal',
                    'Protección Constitucional',
                    'Derecho Civil'
                ];
                var twIdx = 0, twChar = 0, twDel = false, twRunning = false;

                function twTick() {
                    var el = document.getElementById('twText');
                    if (!el) return;
                    var phrase = twPhrases[twIdx];

                    if (!twDel) {
                        twChar++;
                        el.textContent = phrase.substring(0, twChar);
                        if (twChar === phrase.length) {
                            twDel = true;
                            setTimeout(twTick, 2200); // pausa en texto completo
                            return;
                        }
                        setTimeout(twTick, 65 + Math.random() * 45); // velocidad humana
                    } else {
                        twChar--;
                        el.textContent = phrase.substring(0, twChar);
                        if (twChar === 0) {
                            twDel = false;
                            twIdx = (twIdx + 1) % twPhrases.length;
                            setTimeout(twTick, 380);
                            return;
                        }
                        setTimeout(twTick, 32);
                    }
                }

                function startTypewriter() {
                    if (twRunning) return;
                    twRunning = true;
                    setTimeout(twTick, 200);
                }

                /* ----------------------------------------------------------
                   7. CANVAS PARTICLES — partículas + streaks dorados
                   ---------------------------------------------------------- */
                var canvas = document.getElementById('heroCanvas');
                var ctx = canvas ? canvas.getContext('2d') : null;

                function resizeCanvas() {
                    if (!canvas) return;
                    canvas.width = canvas.parentElement.offsetWidth;
                    canvas.height = canvas.parentElement.offsetHeight;
                }
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas, { passive: true });

                var pts = [];
                var streaks = [];
                var PT_COUNT = 110; // más partículas ahora que son visibles

                function rnd(a, b) { return a + Math.random() * (b - a); }

                function mkPt() {
                    return {
                        x: rnd(0, canvas ? canvas.width : window.innerWidth),
                        y: rnd(0, canvas ? canvas.height : window.innerHeight),
                        r: rnd(0.5, 2.8),
                        vx: rnd(-0.12, 0.12),
                        vy: rnd(-0.48, -0.06),
                        o: rnd(0.15, 0.60), // más opacidad → visibles sobre el fondo
                        gold: Math.random() > 0.35,
                        pulse: Math.random() * Math.PI * 2  // fase aleatoria para brillo pulsante
                    };
                }

                function mkStreak() {
                    return {
                        x: -150,
                        y: rnd(canvas ? canvas.height * 0.1 : 60, canvas ? canvas.height * 0.75 : 500),
                        len: rnd(60, 130),
                        vx: rnd(2.5, 4.5),
                        o: rnd(0.12, 0.28),
                        life: 0,
                        maxLife: 60 + Math.random() * 50
                    };
                }

                if (ctx) {
                    for (var i = 0; i < PT_COUNT; i++) pts.push(mkPt());
                    // Lanzar streaks periódicamente
                    setInterval(function () {
                        if (Math.random() > 0.35) streaks.push(mkStreak());
                    }, 3500);
                }

                var ptTick = 0;
                function drawPts() {
                    if (!ctx || !canvas) return;
                    ptTick++;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Partículas
                    pts.forEach(function (p) {
                        var glowFactor = (Math.sin(ptTick * 0.02 + p.pulse) + 1) * 0.5;
                        var alpha = p.o * (0.7 + glowFactor * 0.3);

                        if (p.gold) {
                            ctx.shadowBlur = 6 * glowFactor;
                            ctx.shadowColor = 'rgba(197,160,89,0.6)';
                        } else {
                            ctx.shadowBlur = 0;
                        }
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fillStyle = p.gold
                            ? 'rgba(197,160,89,' + alpha + ')'
                            : 'rgba(255,255,255,' + (alpha * 0.55) + ')';
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        p.x += p.vx;
                        p.y += p.vy;
                        if (p.y < -6) p.y = canvas.height + 6;
                        if (p.x < -6) p.x = canvas.width + 6;
                        if (p.x > canvas.width + 6) p.x = -6;
                    });

                    // Shooting star streaks
                    for (var si = streaks.length - 1; si >= 0; si--) {
                        var s = streaks[si];
                        var grad = ctx.createLinearGradient(s.x - s.len, s.y, s.x, s.y);
                        grad.addColorStop(0, 'rgba(197,160,89,0)');
                        grad.addColorStop(0.6, 'rgba(232,211,153,' + s.o + ')');
                        grad.addColorStop(1, 'rgba(197,160,89,' + (s.o * 0.5) + ')');
                        ctx.beginPath();
                        ctx.moveTo(s.x - s.len, s.y);
                        ctx.lineTo(s.x, s.y);
                        ctx.strokeStyle = grad;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        s.x += s.vx;
                        s.life++;
                        if (s.x > canvas.width + s.len) streaks.splice(si, 1);
                    }

                    requestAnimationFrame(drawPts);
                }
                drawPts();

                /* ----------------------------------------------------------
                   7. MOUSE PARALLAX + 3D TILT
                   ---------------------------------------------------------- */
                var heroSection = document.querySelector('.hero-section');
                var orbs = document.querySelectorAll('.orb[data-speed]');
                var heroContent = document.getElementById('heroContent');
                var mxN = 0, myN = 0, sxN = 0, syN = 0;

                if (heroSection) {
                    heroSection.addEventListener('mousemove', function (e) {
                        var r = heroSection.getBoundingClientRect();
                        mxN = ((e.clientX - r.left) / r.width - 0.5) * 2;
                        myN = ((e.clientY - r.top) / r.height - 0.5) * 2;
                    }, { passive: true });
                    heroSection.addEventListener('mouseleave', function () { mxN = 0; myN = 0; });
                }

                function loopParallax() {
                    sxN += (mxN - sxN) * 0.055;
                    syN += (myN - syN) * 0.055;

                    orbs.forEach(function (orb) {
                        var sp = parseFloat(orb.getAttribute('data-speed')) || 0.03;
                        orb.style.transform = 'translate(' + (sxN * sp * 65) + 'px,' + (syN * sp * 65) + 'px)';
                    });

                    if (heroContent) {
                        heroContent.style.transform =
                            'translate(' + (sxN * 5) + 'px,' + (syN * 5) + 'px)' +
                            ' perspective(1100px) rotateX(' + (syN * -1.4) + 'deg) rotateY(' + (sxN * 1.4) + 'deg)';
                    }
                    requestAnimationFrame(loopParallax);
                }
                loopParallax();

                /* ----------------------------------------------------------
                   8. NAVBAR SCROLL
                   ---------------------------------------------------------- */
                var navbar = document.getElementById('navbar');
                window.addEventListener('scroll', function () {
                    navbar.classList.toggle('scrolled', window.scrollY > 50);
                }, { passive: true });

                /* ----------------------------------------------------------
                   9. SCROLL REVEAL (otras secciones)
                   ---------------------------------------------------------- */
                var revEls = document.querySelectorAll('.reveal');
                var revObs = new IntersectionObserver(function (entries, obs) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('active');
                            obs.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
                revEls.forEach(function (el) { revObs.observe(el); });

                /* ----------------------------------------------------------
                   10. WHATSAPP FORM
                   ---------------------------------------------------------- */
                document.getElementById('waForm').addEventListener('submit', function (e) {
                    e.preventDefault();
                    var name = document.getElementById('waName').value.trim();
                    var service = document.getElementById('waService').value;
                    var message = document.getElementById('waMessage').value.trim();
                    var phone = '525512441146';
                    var txt = '*NUEVA SOLICITUD DE ASESORÍA*%0A%0A';
                    txt += '*Nombre:* ' + name + '%0A';
                    txt += '*Asunto:* ' + service + '%0A';
                    if (message) txt += '*Detalles del caso:* ' + message + '%0A';
                    txt += '%0A_Enviado desde la Landing Page_';
                    window.open('https://wa.me/' + phone + '?text=' + txt, '_blank');
                });

                /* ----------------------------------------------------------
                   11. FOOTER YEAR
                   ---------------------------------------------------------- */
                document.getElementById('year').textContent = new Date().getFullYear();

            })();

// MOBILE MENU LOGIC
document.addEventListener('DOMContentLoaded', function() {
    const openMobileMenu = document.getElementById('openMobileMenu');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (openMobileMenu && closeMobileMenu && mobileMenu) {
        openMobileMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-full');
        });
        closeMobileMenu.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
        });
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('translate-x-full');
            });
        });
    }
});
