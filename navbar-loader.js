/**
 * navbar-loader.js — Dynamically injects navbar.html into every page
 * Extracts only the navbar portion (not full HTML boilerplate)
 */
(function () {
  function injectNavbar(html) {
    // Extract just the body content from navbar.html
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');

    // Create a container and inject before the first element in body
    var container = document.createElement('div');
    container.id = 'navbar-container';

    // Move all body children of navbar doc into container
    Array.from(doc.body.childNodes).forEach(function (node) {
      container.appendChild(document.importNode(node, true));
    });

    // Also inject the navbar's <style> tags into <head>
    Array.from(doc.head.querySelectorAll('style, link')).forEach(function (el) {
      // skip style.css — already loaded
      if (el.href && el.href.includes('style.css')) return;
      document.head.appendChild(document.importNode(el, true));
    });

    // Insert navbar container at the very top of body
    document.body.insertBefore(container, document.body.firstChild);

    // Re-run any scripts inside the navbar (they don't execute via innerHTML)
    container.querySelectorAll('script').forEach(function (oldScript) {
      var newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
        newScript.async = false;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      document.body.appendChild(newScript);
      oldScript.remove();
    });

    // Mark active link in dropdown based on current page
    var current = window.location.pathname.split('/').pop() || 'index.html';
    container.querySelectorAll('.dd-link').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href === './' + current || href.endsWith('/' + current)) {
        a.classList.add('active');
      }
    });
  }

  function loadNavbar() {
    // Don't inject on login/auth pages
    var page = window.location.pathname.split('/').pop() || 'index.html';
    var noNavPages = ['login.html', 'admin_login.html', 'kitchen_login.html', 'auth.html', 'index.html', 'logout.html'];
    if (noNavPages.indexOf(page) !== -1) return;

    fetch('./navbar.html')
      .then(function (r) { return r.text(); })
      .then(function (html) { injectNavbar(html); })
      .catch(function (e) { console.warn('Navbar load failed:', e); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
  } else {
    loadNavbar();
  }
})();
