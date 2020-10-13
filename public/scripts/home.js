$(() => {
  const $window = $(window);
  const $sections = $('section');

  const onResize = () => {
    $sections.css('min-height', $window.height());
  };
  $window.on('resize', onResize);
  onResize();

  const $nav = $('nav.navbar');
  const $navMenu = $('#navbarCollapse');
  const $navLinks = $('#navbarCollapse .nav-link');
  const $navLinksRev = $('#navbarCollapse .nav-link')
    .get()
    .reverse()
    .map((nl) => $(nl));
  const onScroll = () => {
    $navLinks.removeClass('active');
    const windowTop = $window.scrollTop();
    const windowBottom = windowTop + $window.height();
    for (const $navLink of $navLinksRev) {
      const attr = $navLink.attr('href');
      if ($(attr).offset().top < windowBottom) {
        $navLink.addClass('active');
        break;
      }
    }
    if (windowTop === 0) {
      $nav.addClass('top');
    } else {
      $nav.removeClass('top');
    }
  };

  $('a[href^="#"]').on('click', (event) => {
    event.preventDefault();
    $navMenu.removeClass('show');
    const hash = $(event.target).closest('a').attr('href');
    window.scrollTo({
      top: $(hash).offset().top,
      behavior: 'smooth',
    });
    // eslint-disable-next-line no-restricted-globals
    history.pushState(null, null, hash);
  });

  $window.on('scroll', onScroll);
  onScroll();

  const $form = $('form');
  $form.on('submit', (event) => {
    event.preventDefault();
    $.post($form.attr('action'), $form.serialize())
      .done(() => {
        // eslint-disable-next-line no-alert
        alert('Thank you, your message has been successfully sent!');
        $form.trigger('reset');
      })
      .fail(() => {
        // eslint-disable-next-line no-alert
        alert("I'm sorry, but your message could not be sent at this time. Please try again later.");
      });
  });
});
