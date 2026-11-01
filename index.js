$(document).ready(function () {
    var $navbar = $('#header');
    var $toggle = $('.toggle-button');

    function setMenuOpen(open) {
        $navbar.toggleClass('toggle-left', open);
        $toggle.attr('aria-expanded', String(open));
        $toggle.attr('aria-label', open ? 'Close navigation' : 'Open navigation');
    }

    $toggle.on('click', function () {
        setMenuOpen(!$navbar.hasClass('toggle-left'));
    });

    $(window).on('resize', function () {
        if (window.matchMedia('(min-width: 768px)').matches) {
            setMenuOpen(false);
        }
    });

    $navbar.find('a[href^="#"]').on('click', function () {
        setMenuOpen(false);
    });

    $(document).on('keydown', function (event) {
        if (event.key === 'Escape' && $navbar.hasClass('toggle-left')) {
            setMenuOpen(false);
            $toggle.trigger('focus');
        }
    });
});

var typed = new Typed('#typed', {
    strings: [
        'Photographer'
    ],
    typeSpeed: 45,
    backSpeed: 45,
    loop: true
});

var typed_2 = new Typed('#typed_2', {
    strings: [
        'Photographer'
    ],
    typeSpeed: 45,
    backSpeed: 45,
    loop: true
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Bootstrap owns carousel and other data-driven controls.
        if (this.hasAttribute('data-slide') || this.hasAttribute('data-toggle')) {
            return;
        }

        var href = this.getAttribute('href');
        if (!href || href === '#') {
            return;
        }

        var target = document.getElementById(href.slice(1));
        if (!target) {
            return;
        }

        e.preventDefault();
        target.scrollIntoView({
            behavior: 'smooth'
        });
    });
});
