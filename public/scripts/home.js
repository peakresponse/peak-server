'use strict'

$(document).ready(function() {
  const $window = $(window);
  const $sections = $('section');

  const onResize = function(event) {
    $sections.css('min-height', $window.height());
  }
  $window.on('resize', onResize);
  onResize();

  const $nav = $('nav.navbar');
  const $navLinks = $('#navbarCollapse .nav-link');
  const $navLinksRev = $('#navbarCollapse .nav-link').get().reverse().map(nl => $(nl));
  const onScroll = function(event) {
    $navLinks.removeClass('active');
    const windowTop = $window.scrollTop();
    const windowBottom = windowTop + $window.height();
    for (let $navLink of $navLinksRev) {
      const attr = $navLink.attr('href');
      if ($(attr).offset().top < windowBottom) {
        $navLink.addClass('active');
        break;
      }
    }
    if (windowTop == 0) {
      $nav.addClass('top');
    } else {
      $nav.removeClass('top');
    }
  }

  $('a[href^="#"]').on('click', function(event) {
    event.preventDefault();
    const hash = $(event.target).closest('a').attr('href');
    window.scrollTo({
      top: $(hash).offset().top,
      behavior: 'smooth'
    });
    history.pushState(null, null, hash);
  });

  $window.on('scroll', onScroll);
  onScroll();

  const $form = $('form');
  $form.on('submit', function(event) {
    event.preventDefault();
    $.post($form.attr('action'), $form.serialize())
      .done(() => {
        alert('Thank you, your message has been successfully sent!');
        $form.trigger('reset');
      })
      .fail(() => {
        alert("I'm sorry, but your message could not be sent at this time. Please try again later.");
      });
  });
});
