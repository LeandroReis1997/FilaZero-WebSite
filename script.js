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
      '1 profissional (mesmo limite do Solo)',
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

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

/** Mesma máscara do Novo Estabelecimento / painel admin. */
const maskTelefone = (value) => {
  const digits = onlyDigits(value);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14);
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

const maskCpfCnpj = (value) => {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

const partnerModal = document.querySelector('[data-partner-modal]');
const partnerForm = document.querySelector('[data-partner-form]');
const partnerFeedback = document.querySelector('[data-partner-feedback]');
const partnerSubmitButton = document.querySelector('[data-partner-submit]');
const partnerTipoValue = document.querySelector('[data-partner-tipo-value]');
const partnerTipoCombo = document.querySelector('[data-partner-tipo-combo]');
const partnerTipoTrigger = document.querySelector('[data-partner-tipo-trigger]');
const partnerTipoLabel = document.querySelector('[data-partner-tipo-label]');
const partnerTipoDropdown = document.querySelector('[data-partner-tipo-dropdown]');
const partnerSuccess = document.querySelector('[data-partner-success]');
const partnerActions = document.querySelector('[data-partner-actions]');
const partnerLoginLink = document.querySelector('[data-partner-login-link]');
const partnerTelefoneInput = document.querySelector('[data-partner-telefone]');
const partnerDocumentoInput = document.querySelector('[data-partner-documento]');
const partnerFormFields = partnerForm
  ? Array.from(partnerForm.querySelectorAll('input:not([type="hidden"]), [data-partner-tipo-combo]')).filter(
      (el) => !el.closest('[data-partner-success]')
    )
  : [];

let partnerTiposCarregados = false;
let partnerTipoOptions = [];

partnerTelefoneInput?.addEventListener('input', (event) => {
  const input = event.target;
  const masked = maskTelefone(input.value);
  input.value = masked;
});

const applyDocumentoMask = (input) => {
  if (!input) return;
  input.value = maskCpfCnpj(input.value);
};

partnerDocumentoInput?.addEventListener('input', (event) => {
  applyDocumentoMask(event.target);
});

// Fallback: se o input for recriado ou o cache atrasar o bind, mascara via delegação.
partnerForm?.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.matches('[data-partner-documento], [name="documento_faturamento"]')) {
    applyDocumentoMask(target);
  }
});

const setPartnerTipoValue = (value, label) => {
  if (partnerTipoValue) partnerTipoValue.value = value || '';
  if (!partnerTipoLabel) return;

  if (value) {
    partnerTipoLabel.textContent = label || value;
    partnerTipoLabel.classList.remove('placeholder');
  } else {
    partnerTipoLabel.textContent = 'Selecione';
    partnerTipoLabel.classList.add('placeholder');
  }

  partnerTipoDropdown?.querySelectorAll('.custom-select__option').forEach((option) => {
    option.classList.toggle('selected', option.dataset.value === String(value));
  });
};

const closePartnerTipoDropdown = () => {
  if (!partnerTipoDropdown || !partnerTipoTrigger) return;
  partnerTipoDropdown.hidden = true;
  partnerTipoTrigger.classList.remove('open');
  partnerTipoTrigger.setAttribute('aria-expanded', 'false');
};

const openPartnerTipoDropdown = () => {
  if (!partnerTipoDropdown || !partnerTipoTrigger || partnerTipoTrigger.disabled) return;
  partnerTipoDropdown.hidden = false;
  partnerTipoTrigger.classList.add('open');
  partnerTipoTrigger.setAttribute('aria-expanded', 'true');
};

const renderPartnerTipoOptions = (tipos) => {
  if (!partnerTipoDropdown) return;
  partnerTipoOptions = tipos;
  partnerTipoDropdown.innerHTML = '';

  tipos.forEach((tipo) => {
    const option = document.createElement('div');
    option.className = 'custom-select__option';
    option.dataset.value = String(tipo.id);
    option.setAttribute('role', 'option');
    option.textContent = tipo.nome;
    option.addEventListener('mousedown', (event) => {
      // Evita que o clique “vaze” e reabra o combo.
      event.preventDefault();
      event.stopPropagation();
    });
    option.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setPartnerTipoValue(String(tipo.id), tipo.nome);
      closePartnerTipoDropdown();
    });
    partnerTipoDropdown.appendChild(option);
  });
};

partnerTipoTrigger?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (partnerTipoDropdown?.hidden) openPartnerTipoDropdown();
  else closePartnerTipoDropdown();
});

document.addEventListener('mousedown', (event) => {
  if (!partnerTipoCombo?.contains(event.target)) {
    closePartnerTipoDropdown();
  }
});

partnerTipoDropdown?.addEventListener('mousedown', (event) => {
  event.stopPropagation();
});

const setPartnerFeedback = (message, type = '') => {
  if (!partnerFeedback) return;
  partnerFeedback.textContent = message || '';
  partnerFeedback.dataset.state = type;
};

const setPartnerLoading = (loading) => {
  if (!partnerSubmitButton) return;
  partnerSubmitButton.disabled = loading;
  partnerSubmitButton.textContent = loading ? 'Criando acesso...' : 'Criar acesso agora';
  if (partnerTipoTrigger) partnerTipoTrigger.disabled = loading;
};

const partnerFieldWrap = (el) => el?.closest('label, .partner-form__field') || null;

const resetPartnerFormView = () => {
  if (partnerSuccess) partnerSuccess.hidden = true;
  if (partnerActions) partnerActions.hidden = false;
  partnerFormFields.forEach((field) => {
    if (field.matches('[data-partner-tipo-combo]')) {
      if (partnerTipoTrigger) partnerTipoTrigger.disabled = false;
      return;
    }
    field.disabled = false;
    const wrap = partnerFieldWrap(field);
    if (wrap) wrap.hidden = false;
  });
  const tipoWrap = partnerFieldWrap(partnerTipoCombo);
  if (tipoWrap) tipoWrap.hidden = false;
  const info = partnerForm?.querySelector('.partner-form__info');
  if (info) info.hidden = false;
  setPartnerFeedback('');
  setPartnerTipoValue('', '');
  closePartnerTipoDropdown();
};

const showPartnerSuccess = (loginUrl) => {
  partnerFormFields.forEach((field) => {
    const wrap = partnerFieldWrap(field);
    if (wrap) wrap.hidden = true;
  });
  const tipoWrap = partnerFieldWrap(partnerTipoCombo);
  if (tipoWrap) tipoWrap.hidden = true;
  const info = partnerForm?.querySelector('.partner-form__info');
  if (info) info.hidden = true;
  if (partnerActions) partnerActions.hidden = true;
  if (partnerSuccess) partnerSuccess.hidden = false;
  if (partnerLoginLink) {
    partnerLoginLink.href = loginUrl || `${SITE_CONFIG.adminPanelUrl}/login`;
  }
  setPartnerFeedback('');
  closePartnerTipoDropdown();
};

const loadPartnerTipos = async () => {
  if (!partnerTipoCombo || partnerTiposCarregados) return;

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

    renderPartnerTipoOptions(tipos);
    partnerTiposCarregados = true;
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

const clearPartnerForm = () => {
  partnerForm?.reset();
  setPartnerTipoValue('', '');
  setPartnerFeedback('');
  setPartnerLoading(false);
  resetPartnerFormView();
  closePartnerTipoDropdown();
};

const openPartnerModal = () => {
  if (!partnerModal) return;
  partnerModal.hidden = false;
  document.body.classList.add('modal-open');
  clearPartnerForm();
  loadPartnerTipos();
};

const closePartnerModal = () => {
  if (!partnerModal) return;
  partnerModal.hidden = true;
  document.body.classList.remove('modal-open');
  clearPartnerForm();
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

  const formData = new FormData(partnerForm);
  const tipoId = Number(formData.get('tipo_id') || partnerTipoValue?.value || 0);
  const payload = {
    estabelecimento_nome: String(formData.get('estabelecimento_nome') || '').trim(),
    responsavel_nome: String(formData.get('responsavel_nome') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    telefone: onlyDigits(formData.get('telefone') || ''),
    documento_faturamento: onlyDigits(formData.get('documento_faturamento') || ''),
    tipo_id: tipoId,
  };

  if (payload.telefone.length < 10) {
    setPartnerFeedback('Informe um telefone válido com DDD.', 'error');
    partnerTelefoneInput?.focus();
    return;
  }

  if (payload.documento_faturamento.length !== 11 && payload.documento_faturamento.length !== 14) {
    setPartnerFeedback('Informe um CPF ou CNPJ de cobrança válido.', 'error');
    partnerDocumentoInput?.focus();
    return;
  }

  if (!payload.tipo_id) {
    setPartnerFeedback('Selecione o tipo do estabelecimento.', 'error');
    openPartnerTipoDropdown();
    return;
  }

  setPartnerLoading(true);

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
    setPartnerTipoValue('', '');
  } catch (error) {
    setPartnerFeedback(error.message || 'Não foi possível concluir seu cadastro.', 'error');
  } finally {
    setPartnerLoading(false);
  }
});
