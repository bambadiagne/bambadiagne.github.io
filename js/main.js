/* =======================================================
 * Portfolio — Ahmadou Bamba Diagne
 * Main JavaScript — No frameworks, pure vanilla JS
 *
 * MODULES
 * -------
 * 1. Language Manager  — EN/FR switcher with localStorage
 * 2. Navigation        — Sticky header, mobile menu, active link
 * 3. Tab Manager       — Resume experience/education tabs
 * 4. Scroll Reveal     — IntersectionObserver animations
 * 5. Back-to-Top       — Floating button visibility
 * 6. Medium Articles   — Fetch & render posts from Medium RSS
 * 7. Lightbox          — Certificate image overlay viewer
 * 8. Initialisation    — Boot all modules
 * ======================================================= */

(function () {
  'use strict';


  /* =====================================================
     1. LANGUAGE MANAGER
     ===================================================== */
  var Lang = {
    current: 'en',

    /** Bootstrap: read localStorage, bind toggle button */
    init: function () {
      var saved = localStorage.getItem('lang') || 'en';
      this.set(saved);

      var btn = document.getElementById('lang-toggle');
      if (btn) {
        btn.addEventListener('click', function () {
          Lang.set(Lang.current === 'en' ? 'fr' : 'en');
        });
      }
    },

    /** Apply language across all [data-en][data-fr] elements */
    set: function (lang) {
      this.current = lang;
      localStorage.setItem('lang', lang);

      // Update toggle label
      var label = document.getElementById('current-lang');
      if (label) label.textContent = lang.toUpperCase();

      // Swap text for every bilingual element
      var els = document.querySelectorAll('[data-en][data-fr]');
      els.forEach(function (el) {
        var text = el.getAttribute('data-' + lang);
        if (!text) return;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      });

      // Update <html lang>
      document.documentElement.lang = lang;
    }
  };


  /* =====================================================
     2. NAVIGATION
     ===================================================== */
  var Nav = {
    navbar: null,
    hamburger: null,
    menu: null,

    init: function () {
      this.navbar = document.getElementById('navbar');
      this.hamburger = document.getElementById('hamburger');
      this.menu = document.getElementById('nav-menu');

      this.handleScroll();
      this.handleMobile();
      this.handleActiveLink();
      this.handleSmoothScroll();
    },

    /** Add .scrolled class on scroll for shadow */
    handleScroll: function () {
      var navbar = this.navbar;
      if (!navbar) return;

      window.addEventListener('scroll', function () {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }, { passive: true });
    },

    /** Mobile hamburger toggle */
    handleMobile: function () {
      var hamburger = this.hamburger;
      var menu = this.menu;
      if (!hamburger || !menu) return;

      hamburger.addEventListener('click', function () {
        var isOpen = menu.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close menu on link click
      var links = menu.querySelectorAll('.nav-link');
      links.forEach(function (link) {
        link.addEventListener('click', function () {
          menu.classList.remove('open');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    },

    /** Highlight current section's nav link on scroll */
    handleActiveLink: function () {
      var sections = document.querySelectorAll('section[id]');
      var links = document.querySelectorAll('.nav-link');
      if (!sections.length || !links.length) return;

      window.addEventListener('scroll', function () {
        var scrollY = window.scrollY + 120;
        var current = '';

        sections.forEach(function (sec) {
          if (scrollY >= sec.offsetTop) {
            current = sec.getAttribute('id');
          }
        });

        links.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
      }, { passive: true });
    },

    /** Smooth scrolling for all anchor links */
    handleSmoothScroll: function () {
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var href = this.getAttribute('href');
          if (href === '#') return;
          e.preventDefault();
          var target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
  };


  /* =====================================================
     3. TAB MANAGER (Resume section)
     ===================================================== */
  var Tabs = {
    init: function () {
      var buttons = document.querySelectorAll('.tab');
      if (!buttons.length) return;

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var target = btn.getAttribute('data-tab');

          // Deactivate all
          document.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); });
          document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });

          // Activate selected
          btn.classList.add('active');
          var panel = document.getElementById(target);
          if (panel) panel.classList.add('active');
        });
      });
    }
  };


  /* =====================================================
     4. SCROLL REVEAL (IntersectionObserver)
     ===================================================== */
  var Reveal = {
    init: function () {
      if (!('IntersectionObserver' in window)) {
        // Fallback: show everything immediately
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
          el.classList.add('revealed');
        });
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // animate once
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      });

      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        observer.observe(el);
      });
    }
  };


  /* =====================================================
     5. BACK-TO-TOP BUTTON
     ===================================================== */
  var BackToTop = {
    init: function () {
      var btn = document.getElementById('back-to-top');
      if (!btn) return;

      // Show/hide based on scroll position
      window.addEventListener('scroll', function () {
        if (window.scrollY > 500) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      }, { passive: true });

      // Scroll to top on click
      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };


  /* =====================================================
     6. MEDIUM ARTICLES (Fetch from RSS feed)
     ===================================================== */
  var MediumArticles = {
    username: 'ahmadoubambadiagne',
    gridId: 'articles-grid',
    maxPosts: 6,

    init: function () {
      var grid = document.getElementById(this.gridId);
      if (!grid) return;
      this.fetch(grid);
    },

    /** Fetch Medium RSS via rss2json API */
    fetch: function (grid) {
      var self = this;
      var feedUrl = 'https://medium.com/feed/@' + this.username;
      var apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);

      fetch(apiUrl)
        .then(function (res) {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then(function (data) {
          if (data.status !== 'ok' || !data.items || !data.items.length) {
            throw new Error('No articles found');
          }
          self.render(grid, data.items.slice(0, self.maxPosts));
        })
        .catch(function () {
          self.renderError(grid);
        });
    },

    /** Extract first image from HTML content as thumbnail */
    extractImage: function (html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var img = tmp.querySelector('img');
      return img ? img.src : '';
    },

    /** Extract plain text snippet from HTML content */
    extractSnippet: function (html, maxLen) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var text = tmp.textContent || tmp.innerText || '';
      return text.length > maxLen ? text.substring(0, maxLen).trim() + '…' : text;
    },

    /** Format date string */
    formatDate: function (dateStr) {
      var d = new Date(dateStr);
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    },

    /** Render article cards into the grid */
    render: function (grid, items) {
      var self = this;
      var html = '';

      items.forEach(function (item) {
        var thumb = item.thumbnail || self.extractImage(item.description || item.content || '');
        var snippet = self.extractSnippet(item.description || item.content || '', 140);
        var date = self.formatDate(item.pubDate);
        var categories = (item.categories || []).slice(0, 3);

        var tagsHtml = '';
        categories.forEach(function (cat) {
          tagsHtml += '<span>' + cat + '</span>';
        });

        html += '<article class="article-card">';
        if (thumb) {
          html += '<div class="article-card__img">';
          html += '<img src="' + thumb + '" alt="" loading="lazy">';
          html += '</div>';
        }
        html += '<div class="article-card__body">';
        html += '<div class="article-card__top">';
        html += '<span class="article-date"><i class="far fa-calendar-alt"></i> ' + date + '</span>';
        if (tagsHtml) {
          html += '<div class="article-tags">' + tagsHtml + '</div>';
        }
        html += '</div>';
        html += '<h3>' + item.title + '</h3>';
        html += '<p>' + snippet + '</p>';
        html += '<a href="' + item.link + '" target="_blank" rel="noopener noreferrer" class="article-read">Read on Medium →</a>';
        html += '</div>';
        html += '</article>';
      });

      grid.innerHTML = html;
      // Re-trigger reveal animation
      grid.classList.remove('revealed');
      void grid.offsetWidth; // force reflow
      grid.classList.add('revealed');
    },

    /** Show error message when fetch fails */
    renderError: function (grid) {
      grid.innerHTML =
        '<div class="articles-error">' +
        '<i class="fas fa-exclamation-circle"></i>' +
        '<p>Unable to load articles. Visit my <a href="https://medium.com/@' + this.username + '" target="_blank" rel="noopener noreferrer">Medium profile</a> directly.</p>' +
        '</div>';
    }
  };


  /* =====================================================
     7. LIGHTBOX (Certificate image overlay)
     ===================================================== */
  var Lightbox = {
    el: null,
    img: null,
    cards: [],
    currentIndex: 0,

    init: function () {
      this.el = document.getElementById('lightbox');
      if (!this.el) return;
      this.img = this.el.querySelector('.lightbox-img');
      this.cards = Array.prototype.slice.call(document.querySelectorAll('.cert-card[data-src]'));
      if (!this.cards.length) return;

      var self = this;

      // Open on card click
      this.cards.forEach(function (card, i) {
        card.addEventListener('click', function () {
          self.open(i);
        });
      });

      // Close button
      this.el.querySelector('.lightbox-close').addEventListener('click', function () {
        self.close();
      });

      // Click backdrop to close
      this.el.addEventListener('click', function (e) {
        if (e.target === self.el) self.close();
      });

      // Prev / Next
      this.el.querySelector('.lightbox-prev').addEventListener('click', function (e) {
        e.stopPropagation();
        self.navigate(-1);
      });
      this.el.querySelector('.lightbox-next').addEventListener('click', function (e) {
        e.stopPropagation();
        self.navigate(1);
      });

      // Keyboard navigation
      document.addEventListener('keydown', function (e) {
        if (!self.el.classList.contains('active')) return;
        if (e.key === 'Escape') self.close();
        if (e.key === 'ArrowLeft') self.navigate(-1);
        if (e.key === 'ArrowRight') self.navigate(1);
      });
    },

    open: function (index) {
      this.currentIndex = index;
      this.img.src = this.cards[index].getAttribute('data-src');
      this.el.classList.add('active');
      this.el.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    },

    close: function () {
      this.el.classList.remove('active');
      this.el.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    navigate: function (dir) {
      this.currentIndex = (this.currentIndex + dir + this.cards.length) % this.cards.length;
      this.img.src = this.cards[this.currentIndex].getAttribute('data-src');
    }
  };


  /* =====================================================
     8. INITIALISATION
     ===================================================== */
  function boot() {
    Lang.init();
    Nav.init();
    Tabs.init();
    Reveal.init();
    BackToTop.init();
    MediumArticles.init();
    Lightbox.init();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();