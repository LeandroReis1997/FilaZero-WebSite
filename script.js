const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const initGalleries = () => {
  const galleries = document.querySelectorAll('[data-gallery]');

  galleries.forEach((gallery) => {
    const images = Array.from(gallery.querySelectorAll('.gallery-image'));
    const controls = gallery.querySelector('.gallery-controls');

    if (images.length <= 1 || !controls) return;

    let current = 0;
    let intervalId = null;

    const dots = images.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot';
      dot.setAttribute('aria-label', `Ir para slide ${index + 1}`);
      dot.addEventListener('click', () => setSlide(index));
      controls.appendChild(dot);
      return dot;
    });

    const setSlide = (index) => {
      current = index;

      images.forEach((image, imageIndex) => {
        image.classList.toggle('is-active', imageIndex === current);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const advance = () => {
      const next = (current + 1) % images.length;
      setSlide(next);
    };

    const startAuto = () => {
      if (intervalId) return;
      intervalId = window.setInterval(advance, 4200);
    };

    const stopAuto = () => {
      if (!intervalId) return;
      window.clearInterval(intervalId);
      intervalId = null;
    };

    setSlide(0);
    startAuto();

    gallery.addEventListener('mouseenter', stopAuto);
    gallery.addEventListener('mouseleave', startAuto);
    gallery.addEventListener('focusin', stopAuto);
    gallery.addEventListener('focusout', startAuto);
  });
};

initGalleries();

const form = document.querySelector('.demo-form');

if (form) {
  const feedback = form.querySelector('.form-feedback');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      if (feedback) {
        feedback.textContent = 'Preencha nome, estabelecimento e e-mail para continuar.';
      }
      return;
    }

    if (feedback) {
      feedback.textContent = 'Recebemos sua solicitacao. Em breve entraremos em contato.';
    }

    form.reset();
  });
}
