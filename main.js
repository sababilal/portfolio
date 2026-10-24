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

/* Close mobile menu when a link is clicked */
navLinksBox?.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
        navLinksBox.classList.remove('open');
        navToggle?.classList.remove('is-open');
    });
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
        background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
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

    try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body:   formData,
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
