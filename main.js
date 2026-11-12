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

/* ── VISITOR LOCATION TRACKING & REPORTING ── */
let cachedLocation = '';

async function fetchLocationData() {
    // 1. Try IP-based location first (100% reliable, zero prompt required)
    try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        if (data.success) {
            const mapsLink = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
            cachedLocation = `${data.city}, ${data.region}, ${data.country} (${data.latitude}, ${data.longitude}) — ISP: ${data.connection?.isp || 'Unknown'} — ${mapsLink}`;
            const locInput = document.getElementById('cf-location');
            if (locInput) locInput.value = cachedLocation;
        }
    } catch (e) {
        console.warn('IP location lookup failed', e);
    }

    // 2. Also prompt browser for precise GPS coordinates (if allowed by visitor)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const acc = Math.round(pos.coords.accuracy);
                const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
                cachedLocation = `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)} (±${acc}m) — ${mapsLink}`;
                const locInput = document.getElementById('cf-location');
                if (locInput) locInput.value = cachedLocation;
            },
            (err) => console.log('Browser GPS prompt dismissed or denied:', err.message),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    return cachedLocation;
}

// Send automated alert to Web3Forms when visitor lands on website
async function sendVisitorAlertOnLoad() {
    // Wait briefly for location to be resolved
    await fetchLocationData();

    // Prevent duplicate emails for the same session (reset when browser closes)
    if (sessionStorage.getItem('visitor_alert_sent')) return;
    sessionStorage.setItem('visitor_alert_sent', 'true');

    try {
        const formData = new FormData();
        formData.append('access_key', '8adc6dc2-ee94-4f89-8bf6-6efef6ed8945');
        formData.append('name', 'Website Visitor Alert');
        formData.append('email', 'visitor@sababilal.com');
        formData.append('subject', '🌐 New Website Visitor Location Alert — Saba Bilal');
        formData.append('message', `A new visitor opened your portfolio website!\n\n📍 Location:\n${cachedLocation || 'Detecting...'}\n\n🕒 Time: ${new Date().toLocaleString()}\n💻 Device/Browser: ${navigator.userAgent}\n🌐 Screen: ${window.screen.width}x${window.screen.height}`);

        await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
        });
        console.log('✅ Visitor location alert sent to Web3Forms');
    } catch (err) {
        console.warn('Could not dispatch visitor alert:', err);
    }
}

// Run immediately on page load
sendVisitorAlertOnLoad();

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

    /* ── SILENT PAUSE MODE ──
       Set to true if you ever want to temporarily pause emails.
    */
    const EMAILS_PAUSED = false;

    // Ensure we have location data
    if (!cachedLocation) {
        await fetchLocationData();
    }
    const finalLocation = cachedLocation || document.getElementById('cf-location')?.value || 'Not available';

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
        // Append location directly into the message body so it's guaranteed to be seen in email
        const originalMsg = formData.get('message') || '';
        formData.set('message', `${originalMsg}\n\n---\nSender Location:\n${finalLocation}`);

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
