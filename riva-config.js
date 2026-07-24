// riva-config.js — Configurações por usuário (tema)
// Incluir como PRIMEIRO script no <head> de todos os painéis

(function () {

  function getUsuario() {
    try { return JSON.parse(localStorage.getItem('riva_sessao') || '{}').usuario || ''; }
    catch (e) { return ''; }
  }

  function getCfg(usuario) {
    var u = usuario || getUsuario() || 'default';
    try { return JSON.parse(localStorage.getItem('riva_config_' + u) || '{}'); }
    catch (e) { return {}; }
  }

  function setCfg(cfg, usuario) {
    var u = usuario || getUsuario() || 'default';
    try { localStorage.setItem('riva_config_' + u, JSON.stringify(cfg)); }
    catch (e) {}
  }

  function aplicarTema(tema) {
    var escuro = (tema === 'escuro' || tema === 'dark');
    document.documentElement.setAttribute('data-theme', escuro ? 'dark' : 'light');
    localStorage.setItem('riva_theme', escuro ? 'dark' : 'light');
  }

  function aplicar() {
    var usuario = getUsuario();
    var cfg = getCfg(usuario);

    // Fallback: procurar qualquer config salva
    if (!cfg.tema) {
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var key = localStorage.key(i);
          if (key && key.indexOf('riva_config_') === 0) {
            var t = JSON.parse(localStorage.getItem(key) || '{}');
            if (t.tema) { cfg = t; break; }
          }
        }
      } catch(e) {}
    }

    if (cfg.tema) aplicarTema(cfg.tema);
    // Idioma: NUNCA aplicar — sistema fixo em português
  }

  aplicar();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicar);
  } else {
    aplicar();
  }

  window.RivaConfig = {
    get: getCfg,
    set: setCfg,
    aplicarTema: aplicarTema,
    salvar: function (tema) {
      var cfg = getCfg();
      if (tema) { cfg.tema = tema; aplicarTema(tema); }
      setCfg(cfg);
    },
    reaplicar: function() { aplicar(); }
  };

})();
