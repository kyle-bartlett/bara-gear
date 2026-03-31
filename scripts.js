/**
 * BARA Pre-Launch Landing Page — Scripts
 * A/B testing, analytics, scroll tracking, form handling
 * Total budget: <2KB (this file)
 */

(function () {
  'use strict';

  // ============================================
  // A/B TESTING
  // ============================================

  function getVariant() {
    var stored = null;
    try {
      stored = localStorage.getItem('bara_variant');
    } catch (e) {
      // localStorage blocked (private browsing) — fall through
    }
    if (stored === 'A' || stored === 'B') return stored;
    var variant = Math.random() < 0.5 ? 'A' : 'B';
    try {
      localStorage.setItem('bara_variant', variant);
    } catch (e) {
      // silent fail
    }
    return variant;
  }

  var variant = getVariant();

  if (variant === 'B') {
    var headline = document.getElementById('headline');
    var subheadline = document.getElementById('subheadline');
    var ctaBtn = document.getElementById('cta-button');
    if (headline) headline.textContent = 'Premium outdoor gear for developers.';
    if (subheadline) subheadline.innerHTML = 'Heavyweight hoodies. Subtle designs. For devs who go outside.';
    if (ctaBtn) ctaBtn.textContent = 'Notify Me';
  }

  // Track variant in GA4
  if (typeof gtag === 'function') {
    gtag('set', 'user_properties', { ab_variant: variant });
  }

  // ============================================
  // EMAIL FORM HANDLING
  // ============================================

  var form = document.getElementById('email-capture');
  var emailInput = document.getElementById('email-input');
  var formSuccess = document.getElementById('form-success');
  var formError = document.getElementById('form-error');
  var microcopy = document.getElementById('microcopy');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = emailInput ? emailInput.value.trim() : '';
      if (!email || !isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
      }

      // Track signup in GA4
      if (typeof gtag === 'function') {
        gtag('event', 'email_signup', {
          event_category: 'engagement',
          event_label: 'pre_launch_landing',
          variant: variant
        });
      }

      // Track signup in Meta Pixel
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', { content_name: 'pre_launch_signup' });
      }

      // NOTE: When Klaviyo is connected, this form submission will be handled
      // by Klaviyo's embedded form JS. For now, show success state.
      // The Klaviyo embed replaces this form entirely.
      showSuccess();
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showSuccess() {
    if (form) form.style.display = 'none';
    if (microcopy) microcopy.style.display = 'none';
    if (formError) formError.style.display = 'none';
    if (formSuccess) formSuccess.style.display = 'block';
  }

  function showError(msg) {
    if (formError) {
      formError.textContent = msg;
      formError.style.display = 'block';
    }
    if (emailInput) {
      emailInput.style.borderColor = '#FF4444';
      emailInput.focus();
      emailInput.addEventListener('input', function clearErr() {
        emailInput.style.borderColor = '';
        if (formError) formError.style.display = 'none';
        emailInput.removeEventListener('input', clearErr);
      });
    }
  }

  // ============================================
  // SCROLL DEPTH TRACKING
  // ============================================

  var scrollThresholds = [25, 50, 75, 100];
  var firedThresholds = {};

  window.addEventListener('scroll', function () {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var scrollPct = Math.round((window.scrollY / docHeight) * 100);

    for (var i = 0; i < scrollThresholds.length; i++) {
      var threshold = scrollThresholds[i];
      if (scrollPct >= threshold && !firedThresholds[threshold]) {
        firedThresholds[threshold] = true;
        if (typeof gtag === 'function') {
          gtag('event', 'scroll_depth', {
            depth: threshold + '%',
            page: 'landing'
          });
        }
      }
    }
  }, { passive: true });

  // ============================================
  // FOUNDING 100 SECTION VIEWED
  // ============================================

  var f100Section = document.getElementById('founding-100');
  if (f100Section && 'IntersectionObserver' in window) {
    var f100Observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (typeof gtag === 'function') {
          gtag('event', 'founding_100_viewed', {
            event_category: 'engagement'
          });
        }
        f100Observer.disconnect();
      }
    }, { threshold: 0.3 });
    f100Observer.observe(f100Section);
  }

  // ============================================
  // CTA CLICK TRACKING
  // ============================================

  var ctaButtons = document.querySelectorAll('.cta-button');
  for (var j = 0; j < ctaButtons.length; j++) {
    ctaButtons[j].addEventListener('click', function () {
      if (typeof gtag === 'function') {
        gtag('event', 'cta_click', {
          event_label: this.textContent.trim(),
          page: 'landing'
        });
      }
    });
  }

})();
