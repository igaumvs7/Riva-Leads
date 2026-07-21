// riva-config.js — Configurações por usuário (tema + idioma)
// Incluir como PRIMEIRO script no <head> de todos os painéis

(function () {

  function getUsuario() {
    try {
      return JSON.parse(localStorage.getItem('riva_sessao') || '{}').usuario || '';
    } catch (e) { return ''; }
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

  function aplicarIdioma(idioma) {
    document.documentElement.setAttribute('lang', idioma === 'en' ? 'en' : 'pt-BR');
    localStorage.setItem('riva_lang', idioma || 'pt');
    window._rivaIdioma = idioma;
  }

  function aplicar() {
    // Tenta com usuário real; se não tiver sessão ainda, tenta 'default'
    var usuario = getUsuario();
    var cfg = getCfg(usuario);

    // Se não achou config para o usuário, tenta o último usuário logado
    if (!cfg.tema && !cfg.idioma) {
      try {
        // Varrer localStorage em busca de qualquer riva_config_*
        for (var i = 0; i < localStorage.length; i++) {
          var key = localStorage.key(i);
          if (key && key.startsWith('riva_config_')) {
            var tentativa = JSON.parse(localStorage.getItem(key) || '{}');
            if (tentativa.tema || tentativa.idioma) { cfg = tentativa; break; }
          }
        }
      } catch(e) {}
    }

    if (cfg.tema) aplicarTema(cfg.tema);
    if (cfg.idioma) aplicarIdioma(cfg.idioma);
  }

  // Aplicar imediatamente
  aplicar();

  // Reaplicar após DOM pronto (sessão pode já estar disponível)
  function onReady() { aplicar(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
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
    },
    reaplicar: function() { aplicar(); }
  };

})();
