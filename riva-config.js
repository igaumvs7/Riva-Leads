// riva-config.js — Configurações por usuário (tema + idioma)
// Incluir como PRIMEIRO script em todos os painéis

(function () {
  function getUsuario() {
    try { return JSON.parse(localStorage.getItem('riva_sessao') || '{}').usuario || 'default'; }
    catch (e) { return 'default'; }
  }

  function getCfg() {
    try { return JSON.parse(localStorage.getItem('riva_config_' + getUsuario()) || '{}'); }
    catch (e) { return {}; }
  }

  function setCfg(cfg) {
    try { localStorage.setItem('riva_config_' + getUsuario(), JSON.stringify(cfg)); }
    catch (e) {}
  }

  function aplicarTema(tema) {
    var escuro = tema === 'escuro' || tema === 'dark';
    var val = escuro ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', val);
    localStorage.setItem('riva_theme', val);
  }

  function aplicarIdioma(idioma) {
    document.documentElement.setAttribute('lang', idioma === 'en' ? 'en' : 'pt-BR');
    localStorage.setItem('riva_lang', idioma || 'pt');
    window._rivaIdioma = idioma;
  }

  function aplicar() {
    var cfg = getCfg();
    if (cfg.tema) aplicarTema(cfg.tema);
    if (cfg.idioma) aplicarIdioma(cfg.idioma);
  }

  // Aplicar imediatamente (antes do DOM)
  aplicar();

  // Reaplicar após DOM pronto (garante que sessão já foi lida)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicar);
  } else {
    aplicar();
  }

  // API global
  window.RivaConfig = {
    get: getCfg,
    set: setCfg,
    aplicarTema: aplicarTema,
    aplicarIdioma: aplicarIdioma,
    salvar: function (tema, idioma) {
      var cfg = getCfg();
      if (tema) { cfg.tema = tema; aplicarTema(tema); }
      if (idioma) { cfg.idioma = idioma; aplicarIdioma(idioma); }
      setCfg(cfg);
    }
  };
})();
