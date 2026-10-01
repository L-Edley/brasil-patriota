/**
 * BRASIL PATRIOTA - CORE ENGINE
 * Loja para apoiadores Bolsonaro - Camisas Copa 2026 + Autógrafo
 */

let allProducts = [];
let cart = [];
try { cart = JSON.parse(localStorage.getItem('brasilpatriota_cart')) || JSON.parse(localStorage.getItem('mitopatriota_cart')) || []; } catch(e) { cart = []; }

const FALLBACK_PRODUCTS = [
  {"id":1,"nome":"Camisa Amarela Bolsonaro 22 Copa 2026 - Deus Pátria Família","categoria":"selecao-2026","material":"Dry-Fit Premium Seleção","codigo":"PAT-001","cor":"Amarelo Ouro","tamanhos_disponiveis":["P","M","G","GG","XG"],"preco":149.9,"destaque":true,"imagem_url":"img/produtos/camisa-amarela-bolsonaro-22.jpeg","descricao":"Amarelinha da Copa 2026 com BOLSONARO 22 e Deus Pátria Família nas costas, igual da foto."},
  {"id":2,"nome":"Camisa Verde Militar Brasil Acima de Tudo - Deus Acima de Todos","categoria":"mito-bolsonaro","material":"100% Algodão Fio 30.1 Penteado","codigo":"PAT-002","cor":"Verde Militar","tamanhos_disponiveis":["P","M","G","GG"],"preco":89.9,"destaque":true,"imagem_url":"img/produtos/camisa-verde-brasil-acima.jpeg","descricao":"Verde militar com bandeira do Brasil e Brasil Acima de Tudo nas costas, igual da foto."},
  {"id":3,"nome":"Camisa Anti Petista Brasil Club - Branca","categoria":"mito-bolsonaro","material":"100% Algodão Premium","codigo":"PAT-003-BR","cor":"Branco","tamanhos_disponiveis":["P","M","G","GG"],"preco":79.9,"imagem_url":"img/produtos/camisa-anti-petista.jpeg","descricao":"Camisa branca Anti Petista Brasil Club. Foto mostra os dois modelos: este anúncio é o BRANCO."},
  {"id":4,"nome":"Camisa Anti Petista Brasil Club - Preta","categoria":"mito-bolsonaro","material":"100% Algodão Premium","codigo":"PAT-003-PT","cor":"Preto","tamanhos_disponiveis":["P","M","G","GG"],"preco":79.9,"imagem_url":"img/produtos/camisa-anti-petista.jpeg","descricao":"Camisa preta Anti Petista Brasil Club. Foto mostra os dois modelos: este anúncio é o PRETO."},
  {"id":5,"nome":"Camisa Jesus com Bandeira do Brasil Gênesis 12 - Feminina","categoria":"mito-bolsonaro","material":"Algodão Premium Oversized","codigo":"PAT-005","cor":"Branco","tamanhos_disponiveis":["P","M","G"],"preco":89.9,"imagem_url":"img/produtos/camisa-jesus-brasil-feminina.jpeg","descricao":"Feminina oversized com Jesus e a bandeira do Brasil, igual da foto."},
  {"id":6,"nome":"Camisa Bege Brasileiro Mapa do Brasil - Masculina Oversized","categoria":"mito-bolsonaro","material":"Algodão Premium Oversized","codigo":"PAT-006","cor":"Bege Areia","tamanhos_disponiveis":["P","M","G","GG"],"preco":89.9,"imagem_url":"img/produtos/camisa-brasileiro-mapa.jpeg","descricao":"Masculina oversized BRASILEIRO com mapa do Brasil, igual da foto."},
  {"id":7,"nome":"Camisa Amarela Personalizada com Seu Nome + Número","categoria":"selecao-2026","material":"Dry-Fit + Personalização Grátis","codigo":"PAT-004","cor":"Amarelo Canarinho","tamanhos_disponiveis":["P","M","G","GG","XG"],"preco":159.9,"destaque":true,"imagem_url":"img/produtos/camisa-amarela-bolsonaro-22.jpeg","galeria":["img/produtos/personalizada/amarela-22.jpeg","img/produtos/personalizada/verde-brasil.jpeg","img/produtos/personalizada/anti-petista.jpeg","img/produtos/personalizada/jesus-brasil.jpeg","img/produtos/personalizada/brasileiro-mapa.jpeg"],"descricao":"Amarelinha 2026 com SEU NOME e número nas costas. Personalização grátis."},
  {"id":8,"nome":"Kit 3 Camisas Patriota: Amarela 22 + Verde Brasil + Anti Petista","categoria":"kits-patriota","material":"Kit com 3 peças Premium","codigo":"PAT-KIT01","cor":"Amarelo/Verde/À escolha","tamanhos_disponiveis":["P","M","G","GG"],"preco":229.9,"imagem_url":"img/produtos/camisa-amarela-bolsonaro-22.jpeg","descricao":"Kit 3 camisas: amarela 22 + verde Brasil + Anti Petista (branca ou preta)."},
  {"id":9,"nome":"Kit Casal Patriota: Jesus Brasil + Brasileiro Mapa","categoria":"kits-patriota","material":"Kit com 2 peças Oversized","codigo":"PAT-KIT02","cor":"Branco/Bege","tamanhos_disponiveis":["P","M","G","GG"],"preco":159.9,"imagem_url":"img/produtos/camisa-jesus-brasil-feminina.jpeg","descricao":"Kit casal: feminina Jesus + masculina Brasileiro mapa."}
];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Render imediato com fallback para funcionar no file:// (duplo clique)
    allProducts = FALLBACK_PRODUCTS;
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    updateCartBadge();
    if(document.getElementById('featured-products')) renderProducts(allProducts.slice(0, 3), 'featured-products');
    if(document.getElementById('catalog-grid')) renderProducts(allProducts, 'catalog-grid');
    if(document.getElementById('cart-items-list')) renderCart();
    if (document.getElementById("products-by-category")) {
        renderProductsByCategory(allProducts, "products-by-category");
    }
    if(document.getElementById('product-detail')) renderProductPage();

    // Tenta atualizar com produtos.json (quando rodar via servidor)
    try {
        const paths = ['produtos.json', './produtos.json'];
        for (const p of paths) {
            try {
                const r = await fetch(p);
                if (r.ok) {
                    const data = await r.json();
                    if (Array.isArray(data) && data.length > 0) {
                        allProducts = data;
                        if(document.getElementById('catalog-grid')) applyCatalog();
                        if (document.getElementById("products-by-category")) renderProductsByCategory(allProducts, "products-by-category");
                        if(document.getElementById('product-detail')) renderProductPage();
                        renderRail();
                    }
                    break;
                }
            } catch(e) {}
        }
    } catch (error) {
        console.log("Usando produtos embutidos:", error);
    }

        // Catálogo: filtro + busca + ordenação
        initCatalog(catParam);
        
        // Botão Finalizar compra: exige itens + frete calculado
        const btnFim = document.getElementById('btn-finalizar');
        if(btnFim) btnFim.addEventListener('click', (e)=>{
            if(!cart.length){ e.preventDefault(); alert('Seu carrinho está vazio.'); return; }
            if(!freteOkView || !getCepSalvo()){ e.preventDefault(); alert('Clique em Calcular para ver o frete com seu CEP antes de finalizar.'); const i=document.getElementById('cep-input'); if(i) i.focus(); }
        });

        setupFreteCalc();
        setupProdutoFrete();
        initHeroSlider();
        renderRail();
        injectStoreUI();
}

function getCepSalvo(){
  try{
    const v=(localStorage.getItem('brasilpatriota_cep')||'').replace(/\D/g,'');
    return v.length===8?v:null;
  }catch(e){return null}
}
// O frete só aparece no carrinho depois do clique em Calcular (por visita à página)
let freteOkView = false;
function proximoSabadoStr(){
  const d=new Date();const diff=(6-d.getDay()+7)%7||7;d.setDate(d.getDate()+diff);
  return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
}
function setupFreteCalc(){
  const input=document.getElementById('cep-input');
  const btn=document.getElementById('btn-cep');
  if(!input||!btn) return;
  input.addEventListener('input',()=>{let v=input.value.replace(/\D/g,'').slice(0,8);if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5);input.value=v});
  btn.addEventListener('click',()=>{
    const v=input.value.replace(/\D/g,'');
    if(v.length!==8){alert('Digite um CEP válido com 8 números.');input.focus();return}
    try{localStorage.setItem('brasilpatriota_cep',v);sessionStorage.setItem('brasilpatriota_cep_ok','1')}catch(e){}
    freteOkView = true;
    renderCart();
  });
}
function setupProdutoFrete(){
  const input=document.getElementById('prod-cep-input');
  const btn=document.getElementById('prod-cep-btn');
  if(!input||!btn) return;
  input.addEventListener('input',()=>{let v=input.value.replace(/\D/g,'').slice(0,8);if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5);input.value=v});
  btn.addEventListener('click',()=>{
    const v=input.value.replace(/\D/g,'');
    const res=document.getElementById('prod-frete-result');
    if(v.length!==8){alert('Digite um CEP válido com 8 números.');input.focus();return}
    try{localStorage.setItem('brasilpatriota_cep',v)}catch(e){}
    if(res) res.innerHTML=`<span class="ml-badge"><span class="ml-full">FULL</span><span class="ml-logo">mercado envios</span></span> disponível para <strong>${input.value}</strong> • <strong style="color:#009B3A">Chega até sábado (${proximoSabadoStr()})</strong><br><small>Cálculo final do valor no carrinho (grátis acima de R$ 199).</small>`;
  });
}

// Renderiza os cards de produtos
function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (products.length === 0) {
        container.innerHTML = "<p>Nenhum produto encontrado nesta categoria.</p>";
        return;
    }
    container.innerHTML = products.map(p => `
        <div class="product-card ${p.destaque ? 'destaque' : ''}">
            ${p.destaque ? '<span class="badge-oferta">MAIS VENDIDA</span>' : ''}
            <a href="produto.html?id=${p.id}"><img src="${p.imagem_url}" class="product-img" alt="${p.nome}" loading="lazy"></a>
            <div class="product-info">
                <div class="product-meta">${p.codigo} | ${p.cor}</div>
                <h3><a href="produto.html?id=${p.id}" style="color:inherit">${p.nome}</a></h3>
                <p class="product-desc">${p.descricao ? p.descricao.substring(0,120) + '...' : ''}</p>
                <p class="product-meta" style="margin-bottom:5px">${p.material}</p>
                <span class="price">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
                
                <div class="size-selector">
                    <select id="size-${p.id}">
                        <option value="">Selecione o Tamanho</option>
                        ${p.tamanhos_disponiveis.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>
                
                <button class="btn-add" onclick="addToCart(${p.id})">Adicionar ao Carrinho</button>
                <a href="produto.html?id=${p.id}" style="display:block;text-align:center;margin-top:10px;font-weight:700;font-size:13px">Ver detalhes →</a>
            </div>
        </div>
    `).join('');
}

// Adicionar ao Carrinho
function addToCart(productId) {
    const sizeSelect = document.getElementById(`size-${productId}`);
    const selectedSize = sizeSelect.value;

    if (!selectedSize) {
        alert("Por favor, selecione um tamanho antes de adicionar.");
        return;
    }

    const product = allProducts.find(p => p.id === productId);
    
    // Verifica se já existe o mesmo produto com o mesmo tamanho
    const existingIndex = cart.findIndex(item => item.id === productId && item.tamanho === selectedSize);

    if (existingIndex > -1) {
        cart[existingIndex].quantidade += 1;
    } else {
        cart.push({
            ...product,
            tamanho: selectedSize,
            quantidade: 1,
            custom: ""
        });
    }

    saveCart();
    const pers = product.categoria === 'selecao-2026' ? ' Informe o nome para as costas no carrinho.' : '';
    alert(`${product.nome} (${selectedSize}) adicionado!${pers}`);
}

function setCustom(index, value){
    if(!cart[index]) return;
    cart[index].custom = String(value||'').slice(0,14);
    try{
        localStorage.setItem('brasilpatriota_cart', JSON.stringify(cart));
        localStorage.setItem('mitopatriota_cart', JSON.stringify(cart));
    }catch(e){}
}
function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Salvar no LocalStorage
function saveCart() {
    try {
    localStorage.setItem('brasilpatriota_cart', JSON.stringify(cart));
    // mantém compatibilidade com carrinho antigo
    localStorage.setItem('mitopatriota_cart', JSON.stringify(cart));
    localStorage.setItem('versiculos_cart', JSON.stringify(cart));
    } catch(e) {}
    updateCartBadge();
    if(typeof renderDrawer === 'function') renderDrawer();
}

// Atualiza o contador visual
function updateCartBadge() {
    const badges = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((acc, item) => acc + item.quantidade, 0);
    badges.forEach(b => b.innerText = totalItems);
}

// Renderiza a lista do carrinho
function renderCart() {
    const container = document.getElementById('cart-items-list');
    const totalDisplay = document.getElementById('cart-total-value');
    if(!container || !totalDisplay) return;
    
    if (cart.length === 0) {
        container.innerHTML = "<p>Seu carrinho está vazio. <a href='produtos.html' style='font-weight:700'>Ver camisas 2026</a></p>";
        totalDisplay.innerText = "R$ 0,00";
        const rb = document.getElementById('frete-result'); if(rb) rb.innerHTML = "";
        const nt = document.getElementById('cart-frete-note'); if(nt) nt.innerText = "";
        const st = document.getElementById('cart-subtotal-value'); if(st) st.innerText = "R$ 0,00";
        const fv = document.getElementById('cart-frete-value'); if(fv) fv.innerText = "—";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        const itemTotal = item.preco * item.quantidade;
        total += itemTotal;
        const personalizavel = item.categoria === 'selecao-2026';
        return `
            <div class="cart-item">
                <img src="${item.imagem_url}" class="cart-item-img" alt="${item.nome}">
                <div style="flex-grow:1">
                    <h4>${item.nome}</h4>
                    <small>Tamanho: ${item.tamanho} | R$ ${item.preco.toFixed(2).replace('.', ',')}</small>
                    ${personalizavel ? `<input class="custom-input" data-idx="${index}" value="${escHtml(item.custom)}" oninput="setCustom(${index},this.value)" placeholder="Nome para as costas (opcional)" maxlength="14">` : ``}
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.quantidade}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                        <button onclick="removeItem(${index})" style="margin-left:20px; color:red; border:none; background:none; cursor:pointer">Remover</button>
                    </div>
                </div>
                <strong>R$ ${itemTotal.toFixed(2).replace('.', ',')}</strong>
            </div>
        `;
    }).join('');

    const frete = total >= 199 ? 0 : 19.9;
    const cep = (freteOkView && getCepSalvo()) || null;
    const sab = proximoSabadoStr();
    const resBox = document.getElementById('frete-result');
    const noteEl = document.getElementById('cart-frete-note');
    const subEl = document.getElementById('cart-subtotal-value');
    const freteEl = document.getElementById('cart-frete-value');
    if(subEl) subEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if(cep){
      if(resBox) resBox.innerHTML=`<div class="frete-done"><div class="frete-ico"><i class="fa-solid fa-truck-fast"></i></div><div><strong>Entrega com rastreio — Mercado Envios</strong><small>CEP ${cep.slice(0,5)}-${cep.slice(5)} • <span class="frete-dia">Chega até sábado (${sab})</span>${frete===0?' • <strong>Frete grátis</strong>':''}</small></div><span class="frete-val">${frete===0?'Grátis':'R$ '+frete.toFixed(2).replace('.',',')}</span></div>`;
      if(noteEl) noteEl.innerText = `Inclui entrega para o CEP ${cep.slice(0,5)}-${cep.slice(5)}.`;
      if(freteEl) freteEl.innerText = frete===0 ? 'Grátis' : `R$ ${frete.toFixed(2).replace('.', ',')}`;
      totalDisplay.innerText = `R$ ${(total+frete).toFixed(2).replace('.', ',')}`;
    } else {
      if(resBox) resBox.innerHTML=`<span style="color:#666;font-size:12px">Digite seu CEP acima para ver o valor e o prazo de entrega.</span>`;
      if(noteEl) noteEl.innerText = `Total sem frete. Calcule o frete com seu CEP.`;
      if(freteEl) freteEl.innerText = 'A calcular';
      totalDisplay.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

function changeQty(index, delta) {
    cart[index].quantidade += delta;
    if (cart[index].quantidade <= 0) cart.splice(index, 1);
    saveCart();
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}


    const anoEl = document.getElementById("ano-atual");
    if (anoEl) {
        anoEl.textContent = new Date().getFullYear();
    }


function renderProductsByCategory(products, containerId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    const categoryNames = {
        "selecao-2026": "Seleção Copa 2026",
        "mito-bolsonaro": "Linha Bolsonaro",
        "kits-patriota": "Kits patriota"
    };

    const categories = {};

    products.forEach(product => {
        if (!categories[product.categoria]) {
            categories[product.categoria] = [];
        }

        categories[product.categoria].push(product);
    });

    container.innerHTML = Object.keys(categories).map(categoryKey => {
        const categoryProducts = categories[categoryKey].slice(0, 4);

        return `
            <div class="category-block">
                <h3 class="category-title">
                    ${categoryNames[categoryKey] || categoryKey}
                </h3>

                <div class="product-grid">
                    ${categoryProducts.map(product => `
                        <div class="product-card ${product.destaque ? 'destaque' : ''}">
                            ${product.destaque ? '<span class="badge-oferta">MAIS VENDIDA</span>' : ''}
                            <a href="produto.html?id=${product.id}"><img 
                                src="${product.imagem_url}" 
                                class="product-img" 
                                alt="${product.nome}"
                                loading="lazy"
                            ></a>

                            <div class="product-info">
                                <p class="product-category">
                                    ${categoryNames[product.categoria] || product.categoria}
                                </p>

                                <h4 class="product-name"><a href="produto.html?id=${product.id}" style="color:inherit">${product.nome}</a></h4>

                                <p class="product-meta">
                                    ${product.codigo} | ${product.cor}
                                </p>

                                <p class="product-meta">
                                    ${product.material}
                                </p>

                                <div class="product-sizes">
                                    <label for="size-${product.id}">
                                        Tamanho:
                                    </label>

                                    <select id="size-${product.id}">
                                        <option value="">Selecione</option>
                                        ${product.tamanhos_disponiveis.map(size => `
                                            <option value="${size}">${size}</option>
                                        `).join("")}
                                    </select>
                                </div>

                                <p class="product-price">
                                    R$ ${product.preco.toFixed(2).replace(".", ",")}
                                </p>

                                <button 
                                    class="btn-buy" 
                                    onclick="addToCart(${product.id})"
                                >
                                    Adicionar ao Carrinho
                                </button>
                                <a href="produto.html?id=${product.id}" style="display:block;text-align:center;margin-top:10px;font-weight:700;font-size:13px">Ver detalhes →</a>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }).join("");
}

// ===== PÁGINA DO PRODUTO (produto.html?id=) =====
let pdpSize = "", pdpQty = 1;
function renderProductPage(){
    const box = document.getElementById('product-detail');
    if(!box) return;
    const id = parseInt(new URLSearchParams(window.location.search).get('id') || '0', 10);
    const p = allProducts.find(x => x.id === id) || allProducts[0];
    if(!p){ box.innerHTML = `<div class="pdp-error"><h2>Produto não encontrado</h2><p><a href="produtos.html">Voltar para a loja</a></p></div>`; return; }
    document.title = p.nome + " | Brasil Patriota";
    pdpSize = ""; pdpQty = 1;
    const oldPrice = p.preco * 1.25;
    const sameCat = allProducts.filter(x => x.categoria === p.categoria && x.id !== p.id).slice(0,4);
    const otherColors = allProducts.filter(x => x.id !== p.id && x.cor !== p.cor).slice(0,4);
    const rel = (sameCat.length ? sameCat : allProducts.filter(x=>x.id!==p.id)).slice(0,4);
    const fotos = [p.imagem_url, ...((p.galeria||[]).filter(g=>g && g!==p.imagem_url))].slice(0,5);
    const thumbs = fotos.length > 1 ? fotos : [p.imagem_url, ...rel.slice(0,3).map(r=>r.imagem_url)];
    box.innerHTML = `
        <p class="breadcrumb"><a href="index.html">Início</a> / <a href="produtos.html">Loja</a> / ${p.nome}</p>
        <div class="pdp-grid">
            <div class="pdp-gallery">
                <img id="pdp-main" src="${p.imagem_url}" alt="${p.nome}">
                <div class="pdp-thumbs">
                    ${thumbs.map((src,k)=>`<img src="${src}" class="${k===0?'on':''}" onclick="pdpThumb(this)" alt="Foto ${k+1} - ${p.nome}">`).join('')}
                </div>
            </div>
            <div class="pdp-info">
                ${p.destaque?'<span class="badge-oferta" style="position:static;transform:none;display:inline-block">MAIS VENDIDA</span>':''}
                <p class="pdp-meta">${p.codigo} • ${p.material}</p>
                <h1>${p.nome}</h1>
                <p class="pdp-old">De R$ ${oldPrice.toFixed(2).replace('.',',')}</p>
                <p class="pdp-price">R$ ${p.preco.toFixed(2).replace('.',',')}</p>
                <p class="pdp-parc">em até 3x de R$ ${(p.preco/3).toFixed(2).replace('.',',')} sem juros no cartão</p>
                <div class="pdp-label"><span>Cor: ${p.cor}</span></div>
                <span class="color-pill">${p.cor} • peça única</span>
                <div class="other-colors">
                    ${otherColors.map(c=>`<a href="produto.html?id=${c.id}"><img src="${c.imagem_url}" alt="${c.nome}">${c.cor}</a>`).join('')}
                </div>
                <div class="pdp-label"><span>Tamanho *</span><a href="index.html#medidas">Guia de medidas</a></div>
                <div class="size-btns">${p.tamanhos_disponiveis.map(s=>`<button class="size-btn" onclick="pdpSizeSel(this,'${s}')">${s}</button>`).join('')}</div>
                <div class="pdp-label"><span>Quantidade</span></div>
                <div class="qty"><button onclick="pdpQtyCh(-1)">−</button><strong id="pdp-qty">1</strong><button onclick="pdpQtyCh(1)">+</button></div>
                <div class="pdp-actions">
                    <button class="btn-add" onclick="pdpAdd(${p.id},false)">Adicionar ao Carrinho</button>
                    <button class="btn-add btn-buy-now" onclick="pdpAdd(${p.id},true)">Comprar agora</button>
                </div>
                ${p.categoria==='selecao-2026' ? `<div class="pdp-ship" style="margin-top:12px"><div style="display:flex;gap:12px;align-items:flex-start"><div style="width:40px;height:40px;flex-shrink:0;border-radius:50%;background:#E8F5E9;color:#009B3A;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-pen-nib"></i></div><p style="margin:0;font-size:13px"><strong>Quer seu nome nas costas?</strong><br>Após adicionar, digite o nome no campo do produto dentro do carrinho. É grátis.</p></div></div>` : ``}
                <div class="pdp-trust">
                    <span><i class="fa-solid fa-rotate-left"></i> Troca de tamanho em até 7 dias</span>
                    <span><i class="fa-solid fa-qrcode"></i> Pix e cartão em até 3x</span>
                    <span><i class="fa-solid fa-pen-nib"></i> Nome nas costas digitado no carrinho</span>
                </div>
                <div class="pdp-ship">
                    <div style="display:flex;gap:12px;align-items:flex-start">
                        <div style="width:40px;height:40px;flex-shrink:0;border-radius:50%;background:#E8F5E9;color:#009B3A;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-truck-fast"></i></div>
                        <p style="margin:0;font-size:13px"><strong>Entrega com rastreio — Mercado Envios.</strong><br>Frete calculado no carrinho: adicione ao carrinho, informe seu CEP e clique em <strong>Calcular</strong>.</p>
                    </div>
                    <a href="carrinho.html" style="font-weight:700;font-size:13px;display:inline-block;margin-top:10px">Ir para o carrinho →</a>
                </div>
                <div class="pdp-acc">
                    <details open><summary>Descrição</summary><p>${p.descricao||''}</p><p><strong>Material:</strong> ${p.material}<br><strong>Código:</strong> ${p.codigo}</p></details>
                    <details><summary>Personalização com seu nome</summary><p>Nas amarelas da Seleção, digite o nome para as costas no campo do produto dentro do carrinho. A personalização é grátis.</p></details>
                    <details><summary>Envio e trocas</summary><p>Envio FULL via Mercado Envios com rastreio. O frete é calculado no carrinho após o CEP. Troca de tamanho em até 7 dias.</p></details>
                </div>
            </div>
        </div>`;
    const rg = document.getElementById('related-grid');
    const relBox = document.getElementById('pdp-related');
    if(rg && relBox && rel.length){
        relBox.style.display = 'block';
        rg.innerHTML = rel.map(r=>`
            <div class="product-card">
                <a href="produto.html?id=${r.id}"><img src="${r.imagem_url}" class="product-img" alt="${r.nome}" loading="lazy"></a>
                <div class="product-info">
                    <div class="product-meta">${r.codigo} | ${r.cor}</div>
                    <h3><a href="produto.html?id=${r.id}" style="color:inherit">${r.nome}</a></h3>
                    <span class="price">R$ ${r.preco.toFixed(2).replace('.',',')}</span>
                    <a href="produto.html?id=${r.id}" class="btn-add" style="display:block;text-align:center;text-decoration:none;margin-top:12px">Ver produto</a>
                </div>
            </div>`).join('');
    }
}
function pdpThumb(el){ document.querySelectorAll('.pdp-thumbs img').forEach(i=>i.classList.remove('on')); el.classList.add('on'); document.getElementById('pdp-main').src = el.src; }
function pdpSizeSel(el,s){ pdpSize=s; document.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('on')); el.classList.add('on'); }
function pdpQtyCh(d){ pdpQty=Math.max(1,Math.min(10,pdpQty+d)); document.getElementById('pdp-qty').innerText=pdpQty; }
function pdpAdd(id,buyNow){
    if(!pdpSize){ alert('Escolha um tamanho antes de continuar.'); return; }
    const product = allProducts.find(p=>p.id===id); if(!product) return;
    const idx = cart.findIndex(i=>i.id===id && i.tamanho===pdpSize);
    if(idx>-1) cart[idx].quantidade += pdpQty; else cart.push({...product, tamanho:pdpSize, quantidade:pdpQty, custom:""});
    saveCart();
    window.location.href = buyNow ? 'carrinho.html' : 'carrinho.html';
}

// ===== CATÁLOGO (filtro + busca + ordenação) =====
const catalogState = { filter: 'all', search: '', sort: 'rel' };
function initCatalog(catParam){
    if(!document.getElementById('catalog-grid')) return;
    if(catParam){
        catalogState.filter = catParam;
        document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active', b.dataset.filter===catParam));
    }
    updateFilterCounts();
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            catalogState.filter = btn.dataset.filter;
            applyCatalog();
        });
    });
    const search = document.getElementById('catalog-search');
    if(search) search.addEventListener('input', ()=>{ catalogState.search = search.value.toLowerCase().trim(); applyCatalog(); });
    const sort = document.getElementById('catalog-sort');
    if(sort) sort.addEventListener('change', ()=>{ catalogState.sort = sort.value; applyCatalog(); });
    applyCatalog();
}
function updateFilterCounts(){
    const counts = { all: allProducts.length };
    allProducts.forEach(p=>{ counts[p.categoria]=(counts[p.categoria]||0)+1; });
    Object.keys(counts).forEach(k=>{
        const el = document.getElementById('count-'+k);
        if(el) el.innerText = `(${counts[k]})`;
    });
}
function applyCatalog(){
    if(!document.getElementById('catalog-grid')) return;
    updateFilterCounts();
    let list = [...allProducts];
    if(catalogState.filter !== 'all') list = list.filter(p=>p.categoria===catalogState.filter);
    if(catalogState.search){
        const q = catalogState.search;
        list = list.filter(p=>(p.nome+' '+p.codigo+' '+p.cor+' '+(p.descricao||'')).toLowerCase().includes(q));
    }
    if(catalogState.sort==='asc') list.sort((a,b)=>a.preco-b.preco);
    else if(catalogState.sort==='desc') list.sort((a,b)=>b.preco-a.preco);
    else if(catalogState.sort==='az') list.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
    else list.sort((a,b)=>(b.destaque?1:0)-(a.destaque?1:0));
    renderProducts(list, 'catalog-grid');
    const cc = document.getElementById('catalog-count');
    if(cc) cc.innerText = list.length === 1 ? '1 produto encontrado' : `${list.length} produtos encontrados`;
}

// ===== PADRÕES DO PROJETO DE REFERÊNCIA (hero slider, trilho, drawer, newsletter) =====let heroTimer = null;
function initHeroSlider(){
    const slider = document.getElementById('hero-slider');
    if(!slider) return;
    const slides = slider.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('#hero-dots button');
    if(!slides.length) return;
    let cur = 0;
    function go(i){
        cur = (i + slides.length) % slides.length;
        slides.forEach((s,k)=>s.classList.toggle('on', k===cur));
        dots.forEach((d,k)=>d.classList.toggle('on', k===cur));
        const s = slides[cur];
        const nm = document.getElementById('hero-slide-name');
        const pr = document.getElementById('hero-slide-price');
        const od = document.getElementById('hero-slide-old');
        if(nm) nm.innerText = s.dataset.name || '';
        if(pr) pr.innerText = s.dataset.price || '';
        if(od) od.innerText = s.dataset.old || '';
    }
    dots.forEach((d,k)=>d.addEventListener('click',(e)=>{e.stopPropagation();go(k);restart();}));
    slider.addEventListener('click',()=>{ const s=slides[cur]; if(s&&s.dataset.id) window.location.href='produto.html?id='+s.dataset.id; });
    function restart(){ if(heroTimer) clearInterval(heroTimer); heroTimer=setInterval(()=>go(cur+1), 5000); }
    restart();
}

function renderRail(){
    const rail = document.getElementById('featured-rail');
    if(!rail || !allProducts.length) return;
    const items = [...allProducts].sort((a,b)=>(b.destaque?1:0)-(a.destaque?1:0)).slice(0,8);
    rail.innerHTML = items.map(p=>`
        <div class="rail-card ${p.destaque?'destaque':''}">
            ${p.destaque?'<span class="badge-oferta">MAIS VENDIDA</span>':''}
            <a href="produto.html?id=${p.id}"><img src="${p.imagem_url}" alt="${p.nome}" loading="lazy"></a>
            <div class="rail-info">
                <small>${p.codigo} • ${p.cor}</small>
                <h4><a href="produto.html?id=${p.id}">${p.nome}</a></h4>
                <strong>R$ ${p.preco.toFixed(2).replace('.',',')}</strong>
                <a href="produto.html?id=${p.id}" class="rail-btn">Ver produto</a>
            </div>
        </div>`).join('');
    const prev = document.getElementById('rail-prev');
    const next = document.getElementById('rail-next');
    if(prev) prev.onclick = ()=>rail.scrollBy({left:-300,behavior:'smooth'});
    if(next) next.onclick = ()=>rail.scrollBy({left:300,behavior:'smooth'});
}

function injectStoreUI(){
    if(document.getElementById('cart-drawer')) return;
    document.body.insertAdjacentHTML('beforeend', `
        <div id="cart-overlay"></div>
        <aside id="cart-drawer" aria-label="Mini carrinho">
            <div class="drawer-head"><h3>Sacola (<span id="drawer-count">0</span>)</h3><button id="drawer-close" aria-label="Fechar">✕</button></div>
            <div id="drawer-items" class="drawer-items"></div>
            <div class="drawer-foot">
                <div class="drawer-total"><span>Subtotal</span><strong id="drawer-subtotal">R$ 0,00</strong></div>
                <a href="carrinho.html" class="btn-add" style="text-align:center;text-decoration:none;display:block">Ver carrinho</a>
                <a href="checkout.html" class="btn-add fashion-btn-dark" style="text-align:center;text-decoration:none;display:block;margin-top:8px">Finalizar compra</a>
            </div>
        </aside>
        <button id="scroll-top" aria-label="Voltar ao topo"><i class="fa-solid fa-arrow-up"></i></button>
        <div id="nl-overlay">
            <div class="nl-box">
                <button id="nl-close" aria-label="Fechar">✕</button>
                <span class="fashion-eyebrow">OFERTA DE BOAS-VINDAS</span>
                <h3>Ganhe 10% OFF na 1ª compra</h3>
                <p>Deixe seu nome e e-mail para receber o cupom <strong>BEMVINDO10</strong>.</p>
                <form id="nl-form">
                    <input id="nl-nome" required placeholder="Seu nome">
                    <input id="nl-mail" type="email" required placeholder="Seu e-mail">
                    <button type="submit" class="btn-add">Quero meu cupom</button>
                </form>
                <p id="nl-ok" style="display:none;color:#009B3A;font-weight:700">Cupom liberado: use <strong>BEMVINDO10</strong> na próxima compra! 🇧🇷</p>
            </div>
        </div>`);
    renderDrawer();
    document.getElementById('drawer-close').onclick = closeDrawer;
    document.getElementById('cart-overlay').onclick = closeDrawer;
    document.addEventListener('click',(e)=>{
        const a = e.target.closest && e.target.closest('.cart-icon-wrapper');
        if(a){ e.preventDefault(); openDrawer(); }
    });
    document.addEventListener('keydown',(e)=>{ if(e.key==='Escape'){ closeDrawer(); hideNL(); } });
    const st = document.getElementById('scroll-top');
    window.addEventListener('scroll',()=>{ st.classList.toggle('show', window.scrollY>600); });
    st.onclick = ()=>window.scrollTo({top:0,behavior:'smooth'});
    // Newsletter: 1x por navegador, após 12s (fora do checkout)
    try{
        if(!location.pathname.includes('checkout') && !localStorage.getItem('brasilpatriota_nl')){
            setTimeout(()=>{
                if(!localStorage.getItem('brasilpatriota_nl')) document.getElementById('nl-overlay').classList.add('show');
            }, 12000);
        }
    }catch(e){}
    document.getElementById('nl-close').onclick = hideNL;
    document.getElementById('nl-overlay').addEventListener('click',(e)=>{ if(e.target.id==='nl-overlay') hideNL(); });
    document.getElementById('nl-form').addEventListener('submit',(e)=>{
        e.preventDefault();
        const n = document.getElementById('nl-nome').value, f = document.getElementById('nl-mail').value;
        try{ localStorage.setItem('brasilpatriota_nl', JSON.stringify({n,f,date:new Date().toISOString()})); }catch(err){}
        if(window.BPDB) BPDB.saveLead({ nome:n, email:f, cupom:'BEMVINDO10' });
        document.getElementById('nl-form').style.display='none';
        document.getElementById('nl-ok').style.display='block';
        setTimeout(hideNL, 4000);
    });
}
function openDrawer(){ renderDrawer(); document.getElementById('cart-drawer').classList.add('open'); document.getElementById('cart-overlay').classList.add('show'); document.body.style.overflow='hidden'; }
function closeDrawer(){ const d=document.getElementById('cart-drawer'); if(!d) return; d.classList.remove('open'); document.getElementById('cart-overlay').classList.remove('show'); document.body.style.overflow=''; }
function hideNL(){ const o=document.getElementById('nl-overlay'); if(o) o.classList.remove('show'); }
function renderDrawer(){
    const box = document.getElementById('drawer-items');
    if(!box) return;
    const BRL = v=>'R$ '+v.toFixed(2).replace('.',',');
    const n = cart.reduce((a,i)=>a+i.quantidade,0);
    document.getElementById('drawer-count').innerText = n;
    if(!cart.length){ box.innerHTML = "<p class='drawer-empty'>Sacola vazia.<br><a href='produtos.html'>Ver camisas →</a></p>"; document.getElementById('drawer-subtotal').innerText='R$ 0,00'; return; }
    let sub = 0;
    box.innerHTML = cart.map((item,index)=>{
        const t = item.preco*item.quantidade; sub += t;
        return `<div class="drawer-item">
            <img src="${item.imagem_url}" alt="${item.nome}">
            <div><strong>${item.nome}</strong><small>Tam ${item.tamanho} • Qtd ${item.quantidade} • ${BRL(item.preco)}</small>
            <div class="qty-controls"><button class="qty-btn" onclick="changeQty(${index},-1);renderDrawer()">-</button><span>${item.quantidade}</span><button class="qty-btn" onclick="changeQty(${index},1);renderDrawer()">+</button></div></div>
            <strong>${BRL(t)}</strong>
        </div>`;
    }).join('');
    document.getElementById('drawer-subtotal').innerText = BRL(sub);
}
