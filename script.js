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

const formatPriceBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const PRICING_PLANOS = [
  {
    id: 'trial',
    nome: 'Teste grátis',
    precoLabel: 'Grátis',
    precoSufixo: '/ 30 dias',
    destaque: 'Começa no primeiro login',
    features: [
      '30 dias grátis',
      'Acesso completo sem limites',
      'Sem cartão no cadastro',
      'Senha definida por e-mail após o cadastro',
    ],
    cta: 'Começar grátis',
  },
  {
    id: 'solo',
    nome: 'Solo',
    precoMensal: 29.9,
    destaque: '1 profissional',
    features: [
      'Agendamentos ilimitados',
      '1 profissional',
      'Painel completo',
      'App para clientes',
    ],
    cta: 'Quero ser parceiro',
  },
  {
    id: 'equipe',
    nome: 'Equipe',
    precoMensal: 49.9,
    destaque: 'Até 5 profissionais',
    featured: true,
    badge: 'Mais popular',
    features: [
      'Agendamentos ilimitados',
      'Até 5 profissionais',
      'Painel completo',
      'App para clientes',
    ],
    cta: 'Quero ser parceiro',
  },
  {
    id: 'pro',
    nome: 'Pro',
    precoMensal: 79.9,
    destaque: 'Profissionais ilimitados',
    features: [
      'Agendamentos ilimitados',
      'Profissionais ilimitados',
      'Painel completo',
      'App para clientes',
    ],
    cta: 'Quero ser parceiro',
  },
];

const initPricing = () => {
  const grid = document.getElementById('pricing-grid');
  if (!grid) return;

  grid.innerHTML = PRICING_PLANOS.map((plano) => {
    const classes = [
      'pricing-card',
      plano.featured ? 'pricing-card--featured' : '',
      plano.id === 'trial' ? 'pricing-card--trial' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const priceHtml =
      plano.id === 'trial'
        ? `${plano.precoLabel} <small>${plano.precoSufixo}</small>`
        : `${formatPriceBRL(plano.precoMensal)} <small>/ mês</small>`;

    const badgeHtml = plano.badge
      ? `<span class="pricing-badge">${plano.badge}</span>`
      : '';

    return `
      <article class="${classes}">
        ${badgeHtml}
        <h3>${plano.nome}</h3>
        <p class="pricing-price">${priceHtml}</p>
        <p class="pricing-meta">${plano.destaque}</p>
        <ul class="pricing-features">${plano.features.map((f) => `<li>${f}</li>`).join('')}</ul>
        <button type="button" class="btn ${plano.featured || plano.id === 'trial' ? 'btn-primary' : 'btn-ghost'}" data-open-partner-modal>
          ${plano.cta}
        </button>
      </article>
    `;
  }).join('');
};

initPricing();

const SITE_CONFIG = (() => {
  const custom = window.FILA_ZERO_SITE_CONFIG || {};
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  return {
    adminApiBaseUrl: custom.adminApiBaseUrl || (isLocal ? 'http://localhost:4000/api/admin' : 'https://painel.filazerobrasil.com.br/api/admin'),
    adminPanelUrl: custom.adminPanelUrl || (isLocal ? 'http://localhost:3000' : 'https://painel.filazerobrasil.com.br'),
    whatsappUrl: custom.whatsappUrl || 'https://wa.me/5511999999999?text=Ol%C3%A1%2C%20quero%20conhecer%20o%20Fila%20Zero',
  };
})();

const partnerModal = document.querySelector('[data-partner-modal]');
const partnerForm = document.querySelector('[data-partner-form]');
const partnerFeedback = document.querySelector('[data-partner-feedback]');
const partnerSubmitButton = document.querySelector('[data-partner-submit]');
const partnerTipoSelect = document.querySelector('[data-partner-tipo]');
const partnerSuccess = document.querySelector('[data-partner-success]');
const partnerActions = document.querySelector('[data-partner-actions]');
const partnerLoginLink = document.querySelector('[data-partner-login-link]');
const partnerFormFields = partnerForm
  ? Array.from(partnerForm.querySelectorAll('input, select')).filter((el) => !el.closest('[data-partner-success]'))
  : [];

let partnerTiposCarregados = false;

const syncPartnerTipoStyle = () => {
  if (!partnerTipoSelect) return;
  partnerTipoSelect.classList.toggle('option-placeholder', !partnerTipoSelect.value);
};

partnerTipoSelect?.addEventListener('change', syncPartnerTipoStyle);
syncPartnerTipoStyle();

const setPartnerFeedback = (message, type = '') => {
  if (!partnerFeedback) return;
  partnerFeedback.textContent = message || '';
  partnerFeedback.dataset.state = type;
};

const setPartnerLoading = (loading) => {
  if (!partnerSubmitButton) return;
  partnerSubmitButton.disabled = loading;
  partnerSubmitButton.textContent = loading ? 'Criando acesso...' : 'Criar acesso agora';
};

const resetPartnerFormView = () => {
  if (partnerSuccess) partnerSuccess.hidden = true;
  if (partnerActions) partnerActions.hidden = false;
  partnerFormFields.forEach((field) => {
    field.disabled = false;
    const wrap = field.closest('label');
    if (wrap) wrap.hidden = false;
  });
  const info = partnerForm?.querySelector('.partner-form__info');
  if (info) info.hidden = false;
  setPartnerFeedback('');
  syncPartnerTipoStyle();
};

const showPartnerSuccess = (loginUrl) => {
  partnerFormFields.forEach((field) => {
    const wrap = field.closest('label');
    if (wrap) wrap.hidden = true;
  });
  const info = partnerForm?.querySelector('.partner-form__info');
  if (info) info.hidden = true;
  if (partnerActions) partnerActions.hidden = true;
  if (partnerSuccess) partnerSuccess.hidden = false;
  if (partnerLoginLink) {
    partnerLoginLink.href = loginUrl || `${SITE_CONFIG.adminPanelUrl}/login`;
  }
  setPartnerFeedback('');
};

const loadPartnerTipos = async () => {
  if (!partnerTipoSelect || partnerTiposCarregados) return;

  if (window.location.protocol === 'file:') {
    setPartnerFeedback(
      'Abra o site com npm run dev (http://localhost:8080). Abrir o HTML direto bloqueia a lista de tipos.',
      'error'
    );
    return;
  }

  try {
    const response = await fetch(`${SITE_CONFIG.adminApiBaseUrl}/auth/parceiros/tipos-estabelecimento`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.mensagem || 'Não foi possível carregar os tipos.');
    }

    const tipos = Array.isArray(data?.tipos) ? data.tipos : [];
    if (!tipos.length) {
      throw new Error('Nenhum tipo de estabelecimento cadastrado na API.');
    }

    partnerTipoSelect.innerHTML = '<option value="">Selecione</option>';
    tipos.forEach((tipo) => {
      const option = document.createElement('option');
      option.value = String(tipo.id);
      option.textContent = tipo.nome;
      partnerTipoSelect.appendChild(option);
    });
    partnerTiposCarregados = true;
    syncPartnerTipoStyle();
    setPartnerFeedback('');
  } catch (error) {
    const offline =
      error?.name === 'TypeError' ||
      /failed to fetch|networkerror|load failed/i.test(String(error?.message || ''));
    setPartnerFeedback(
      offline
        ? 'Não foi possível falar com a API. Confirme se o backend está em http://localhost:4000.'
        : (error.message || 'Não foi possível carregar os tipos de estabelecimento.'),
      'error'
    );
  }
};

const openPartnerModal = () => {
  if (!partnerModal) return;
  partnerModal.hidden = false;
  document.body.classList.add('modal-open');
  resetPartnerFormView();
  loadPartnerTipos();
};

const closePartnerModal = () => {
  if (!partnerModal) return;
  partnerModal.hidden = true;
  document.body.classList.remove('modal-open');
};

document.querySelectorAll('[data-open-partner-modal]').forEach((button) => {
  button.addEventListener('click', openPartnerModal);
});

partnerModal?.addEventListener('click', (event) => {
  if (event.target.closest('[data-close-partner-modal]')) {
    event.preventDefault();
    closePartnerModal();
    return;
  }

  if (event.target === partnerModal) {
    closePartnerModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && partnerModal && !partnerModal.hidden) {
    closePartnerModal();
  }
});

document.querySelectorAll('[data-open-whatsapp]').forEach((link) => {
  link.setAttribute('href', SITE_CONFIG.whatsappUrl);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noreferrer');
});

partnerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setPartnerFeedback('');
  setPartnerLoading(true);

  const formData = new FormData(partnerForm);
  const payload = {
    estabelecimento_nome: String(formData.get('estabelecimento_nome') || '').trim(),
    responsavel_nome: String(formData.get('responsavel_nome') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    telefone: String(formData.get('telefone') || '').trim(),
    tipo_id: Number(formData.get('tipo_id')),
  };

  try {
    const response = await fetch(`${SITE_CONFIG.adminApiBaseUrl}/auth/parceiros/cadastro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.mensagem || 'Não foi possível criar seu acesso agora.');
    }

    showPartnerSuccess(data?.login_url || `${SITE_CONFIG.adminPanelUrl}/login`);
    partnerForm.reset();
  } catch (error) {
    setPartnerFeedback(error.message || 'Não foi possível concluir seu cadastro.', 'error');
  } finally {
    setPartnerLoading(false);
  }
});
