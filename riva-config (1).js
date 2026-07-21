// riva-config.js — Configurações por usuário (tema + idioma)
// Incluir em todos os painéis com: <script src="riva-config.js"></script>
// Deve ser o PRIMEIRO script do <head>

(function() {
  function getCfg() {
    try {
      var sessao = JSON.parse(localStorage.getItem('riva_sessao') || '{}');
      var u = sessao.usuario || 'default';
      return JSON.parse(localStorage.getItem('riva_config_' + u) || '{}');
    } catch(e) { return {}; }
  }

  function setCfg(cfg) {
    try {
      var sessao = JSON.parse(localStorage.getItem('riva_sessao') || '{}');
      var u = sessao.usuario || 'default';
      localStorage.setItem('riva_config_' + u, JSON.stringify(cfg));
    } catch(e) {}
  }

  function aplicarTema(tema) {
    var escuro = tema === 'escuro' || tema === 'dark';
    document.documentElement.setAttribute('data-theme', escuro ? 'dark' : 'light');
    document.documentElement.setAttribute('data-tema', escuro ? 'escuro' : 'claro');
    // Compatibilidade com sistemas que usam localStorage direto
    localStorage.setItem('riva_theme', escuro ? 'dark' : 'light');
  }

  function aplicarIdioma(idioma) {
    document.documentElement.setAttribute('lang', idioma === 'en' ? 'en' : 'pt-BR');
    localStorage.setItem('riva_lang', idioma);
    window._rivaIdioma = idioma;
  }

  // Aplicar imediatamente ao carregar (antes do DOM estar pronto)
  var cfg = getCfg();
  if (cfg.tema) aplicarTema(cfg.tema);
  if (cfg.idioma) aplicarIdioma(cfg.idioma);

  // Expor funções globais
  window.RivaConfig = {
    get: getCfg,
    set: setCfg,
    aplicarTema: aplicarTema,
    aplicarIdioma: aplicarIdioma,
    salvar: function(tema, idioma) {
      var cfg = getCfg();
      if (tema) cfg.tema = tema;
      if (idioma) cfg.idioma = idioma;
      setCfg(cfg);
      if (tema) aplicarTema(tema);
      if (idioma) aplicarIdioma(idioma);
    }
  };
})();
