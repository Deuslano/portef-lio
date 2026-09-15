const demoState = {
  products: [
    { name: 'Combo Alfazema', code: '7983', price: 'R$ 26,16', stock: 1, icon: '🧴' },
    { name: 'Kit Sabonete Perfumado 4un X 75gr', code: '2336', price: 'R$ 59,89', stock: 1, icon: '▣' },
    { name: 'Hidratante Facial FPS 30', code: '17967', price: 'R$ 59,94', stock: 2, icon: '◇' }
  ],
  clients: ['João', 'Cliente demonstração']
};

const views = [...document.querySelectorAll('.view')];
const tabs = [...document.querySelectorAll('.nav-item')];
const toast = document.querySelector('.toast');
const productModal = document.querySelector('#product-modal');
const productForm = document.querySelector('#product-form');
let toastTimer;

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function showView(name) {
  views.forEach((view) => view.classList.toggle('hidden', view.dataset.view !== name));
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === name));
  const titles = { dashboard: 'Olá, Consultora!', products: 'Produtos', clients: 'Clientes', finance: 'Financeiro', consortium: 'Consórcios', draws: 'Sorteios' };
  document.querySelector('#page-title').textContent = titles[name];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderProducts(list = demoState.products) {
  const container = document.querySelector('#product-list');
  container.innerHTML = list.length ? list.map((product) => `
    <article class="product-card">
      <span class="product-icon">${product.icon}</span>
      <div class="product-main"><strong>${product.name}</strong><small>SKU ${product.code} · Venda ${product.price}</small></div>
      <span class="stock">${product.stock <= 2 ? 'Baixo estoque' : `${product.stock} un`}</span>
    </article>`).join('') : '<p>Nenhum produto encontrado.</p>';
}

function renderClients(list = demoState.clients) {
  const container = document.querySelector('#client-list');
  container.innerHTML = list.length ? list.map((client) => `<article class="client-card"><span class="client-avatar">${client[0]}</span><div><strong>${client}</strong><small>Cliente cadastrado</small></div></article>`).join('') : '<p>Nenhum cliente encontrado.</p>';
}

tabs.forEach((tab) => tab.addEventListener('click', () => showView(tab.dataset.tab)));

document.querySelector('#product-search').addEventListener('input', (event) => {
  const term = event.target.value.toLowerCase();
  renderProducts(demoState.products.filter((product) => `${product.name} ${product.code}`.toLowerCase().includes(term)));
});

document.querySelector('#client-search').addEventListener('input', (event) => {
  const term = event.target.value.toLowerCase();
  renderClients(demoState.clients.filter((client) => client.toLowerCase().includes(term)));
});

document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
  if (button.dataset.action === 'product') {
    productModal.classList.remove('hidden');
    productForm.querySelector('input').focus();
    return;
  }
  const actions = { sale: 'Nova venda aberta em modo demonstração.', purchase: 'Nova compra aberta em modo demonstração.', product: 'Formulário de novo produto simulado.', bonus: 'Bonificação pronta para configurar.', client: 'Cadastro de cliente simulado.', consortium: 'Consórcio criado apenas nesta demonstração.', draw: 'Sorteio criado apenas nesta demonstração.' };
  notify(actions[button.dataset.action]);
}));

document.querySelector('[data-close-modal]').addEventListener('click', () => productModal.classList.add('hidden'));
productModal.addEventListener('click', (event) => {
  if (event.target === productModal) productModal.classList.add('hidden');
});
productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(productForm);
  demoState.products.unshift({ name: formData.get('name'), code: formData.get('code'), price: `R$ ${formData.get('price')}`, stock: Number(formData.get('stock')), icon: '◇' });
  productForm.reset();
  productModal.classList.add('hidden');
  showView('products');
  renderProducts();
  notify('Produto adicionado somente nesta demonstração.');
});

document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  renderProducts(button.dataset.filter === 'low' ? demoState.products.filter((product) => product.stock <= 2) : demoState.products);
}));

renderProducts();
renderClients();
