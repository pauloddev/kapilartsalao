(() => {
  const WA = '5583998822099';
  const f = document.getElementById('bookingForm');
  const $ = (s) => f.querySelector(s);
  const dia = $('#dia');
  const tel = $('#contato');

  // Data mínima = hoje (horário local)
  const pad = (n) => String(n).padStart(2, '0');
  const today = new Date();
  dia.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // Serviço vindo da URL (?servico=...)
  const q = new URLSearchParams(location.search).get('servico');
  if (q) {
    const opt = [...$('#servico').options].find(o => o.text.toLowerCase() === q.toLowerCase());
    if (opt) opt.selected = true;
  }

  // Máscara de telefone
  tel.addEventListener('input', () => {
    let d = tel.value.replace(/\D/g, '').slice(0, 11);
    if (d.length > 6) tel.value = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    else if (d.length > 2) tel.value = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    else tel.value = d;
  });

  const setErr = (el, bad) => el.closest('.field').classList.toggle('has-error', bad);
  const isSunday = (v) => v && new Date(v + 'T12:00:00').getDay() === 0;
  dia.addEventListener('change', () => setErr(dia, !dia.value || isSunday(dia.value)));

  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = $('#nome').value.trim();
    const contato = tel.value.trim();
    const servico = $('#servico').value;
    const tipoEl = f.querySelector('input[name="tipo"]:checked');
    const cor = $('#cor').value;
    const d = dia.value;
    let ok = true;
    const chk = (el, bad) => { setErr(el, bad); if (bad) ok = false; };
    chk($('#nome'), nome.length < 2);
    chk(tel, contato.replace(/\D/g, '').length < 10);
    chk($('#servico'), !servico);
    chk(f.querySelector('input[name="tipo"]'), !tipoEl);
    chk($('#cor'), !cor);
    chk(dia, !d || isSunday(d));
    if (!ok) { const first = f.querySelector('.has-error'); first && first.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }

    const [y, m, dd] = d.split('-');
    const semana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'][new Date(d + 'T12:00:00').getDay()];
    const linhas = [
      'Olá, Kapilart! Gostaria de agendar um horário.',
      '',
      `*Nome:* ${nome}`,
      `*Contato:* ${contato}`,
      `*Serviço:* ${servico}`,
      `*Tipo de cabelo:* ${tipoEl.value}`,
      `*Cor atual:* ${cor}`,
    ];
    const comp = $('#comprimento').value; if (comp) linhas.push(`*Comprimento:* ${comp}`);
    linhas.push(`*Dia:* ${dd}/${m}/${y} (${semana})`);
    const per = $('#periodo').value; linhas.push(`*Horário:* ${per || 'Qualquer horário'}`);
    const obs = $('#obs').value.trim(); if (obs) linhas.push(`*Observações:* ${obs}`);

    const url = `https://wa.me/${WA}?text=${encodeURIComponent(linhas.join('\n'))}`;
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  });

  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
