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

const PRICING_PERIODOS = {
  monthly: { label: 'mensal', months: 1, multiplier: 1 },
  quarterly: { label: '3 meses', months: 3, multiplier: 3 },
  semiannual: { label: '6 meses', months: 6, multiplier: 6 },
  yearly: { label: 'anual', months: 12, multiplier: 11 },
};

const PRICING_PLANOS = [
  {
    id: 'trial',
    nome: 'Trial',
    precoMensal: 0,
    profissionais: 'Acesso completo por 30 dias',
    trial: true,
    features: [
      '30 dias grátis',
      'Acesso completo sem limites',
      'Sem cartão no cadastro',
      'Assine um plano pago antes do fim do trial',
    ],
  },
  {
    id: 'solo',
    nome: 'Solo',
    precoMensal: 29.9,
    profissionais: '1 profissional',
    features: ['Agendamentos ilimitados', '1 profissional', 'Painel completo', 'App para clientes'],
  },
  {
    id: 'equipe',
    nome: 'Equipe',
    precoMensal: 49.9,
    profissionais: 'Até 5 profissionais',
    featured: true,
    features: ['Agendamentos ilimitados', 'Até 5 profissionais', 'Painel completo', 'App para clientes'],
  },
  {
    id: 'pro',
    nome: 'Pro',
    precoMensal: 79.9,
    profissionais: 'Profissionais ilimitados',
    features: ['Agendamentos ilimitados', 'Profissionais ilimitados', 'Painel completo', 'App para clientes'],
  },
];

const formatBRL = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const calcPreco = (precoMensal, periodId) => {
  const periodo = PRICING_PERIODOS[periodId];
  return Math.round(precoMensal * periodo.multiplier * 100) / 100;
};

const initPricing = () => {
  const grid = document.getElementById('pricing-grid');
  const toggle = document.querySelector('.pricing-period-toggle');
  if (!grid || !toggle) return;

  let period = 'monthly';

  const render = () => {
    const periodo = PRICING_PERIODOS[period];
    grid.innerHTML = PRICING_PLANOS.map((plano) => {
      if (plano.trial) {
        return `
          <article class="pricing-card pricing-card--trial">
            <h3>${plano.nome}</h3>
            <p class="pricing-price">Grátis <small>/ 30 dias</small></p>
            <p class="pricing-meta">${plano.profissionais}</p>
            <ul class="pricing-features">${plano.features.map((f) => `<li>${f}</li>`).join('')}</ul>
          </article>
        `;
      }

      const total = calcPreco(plano.precoMensal, period);
      const equiv = period !== 'monthly' ? total / periodo.months : null;
      const classes = ['pricing-card', plano.featured ? 'pricing-card--featured' : ''].filter(Boolean).join(' ');

      return `
        <article class="${classes}">
          <h3>${plano.nome}</h3>
          <p class="pricing-price">${formatBRL(total)} <small>/ ${periodo.label}</small></p>
          ${equiv ? `<p class="pricing-meta">≈ ${formatBRL(equiv)}/mês</p>` : ''}
          <p class="pricing-meta">${plano.profissionais}</p>
          <ul class="pricing-features">${plano.features.map((f) => `<li>${f}</li>`).join('')}</ul>
        </article>
      `;
    }).join('');
  };

  toggle.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-period]');
    if (!button) return;
    period = button.dataset.period;
    toggle.querySelectorAll('button').forEach((btn) => btn.classList.toggle('is-active', btn === button));
    render();
  });

  render();
};

initPricing();
