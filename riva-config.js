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

// Proteção compartilhada de rascunhos para formulários com salvamento explícito.
// Cada tela escolhe os campos que devem ser protegidos; senhas nunca são salvas.
(function () {
  function usuarioAtual() {
    try { return JSON.parse(localStorage.getItem('riva_sessao') || '{}').usuario || 'anonimo'; }
    catch (e) { return 'anonimo'; }
  }

  function storageKey(chave) {
    var pagina = String(location.pathname || 'pagina').replace(/[^a-z0-9_-]+/gi, '_');
    var usuario = String(usuarioAtual()).replace(/[^a-z0-9_-]+/gi, '_');
    return 'riva_draft_v1_' + pagina + '_' + usuario + '_' + chave;
  }

  function campoSeguro(el) {
    if (!el || !el.id || el.disabled) return false;
    var tipo = String(el.type || '').toLowerCase();
    return ['password', 'file', 'hidden', 'submit', 'button'].indexOf(tipo) === -1;
  }

  function capture(chave, ids) {
    var valores = {};
    (ids || []).forEach(function (id) {
      var el = document.getElementById(id);
      if (!campoSeguro(el)) return;
      valores[id] = (el.type === 'checkbox' || el.type === 'radio') ? !!el.checked : el.value;
    });
    try {
      localStorage.setItem(storageKey(chave), JSON.stringify({ ts:Date.now(), valores:valores }));
    } catch (e) {}
    return valores;
  }

  function restore(chave, ids, limiteHoras) {
    try {
      var salvo = JSON.parse(localStorage.getItem(storageKey(chave)) || 'null');
      var limite = (limiteHoras == null ? 24 : limiteHoras) * 3600000;
      if (!salvo || !salvo.valores || Date.now() - Number(salvo.ts || 0) > limite) {
        localStorage.removeItem(storageKey(chave));
        return false;
      }
      var restaurou = false;
      (ids || []).forEach(function (id) {
        var el = document.getElementById(id);
        if (!campoSeguro(el) || !Object.prototype.hasOwnProperty.call(salvo.valores, id)) return;
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = !!salvo.valores[id];
        else el.value = salvo.valores[id];
        restaurou = true;
      });
      return restaurou;
    } catch (e) {
      return false;
    }
  }

  function bind(chave, ids) {
    (ids || []).forEach(function (id) {
      var el = document.getElementById(id);
      if (!campoSeguro(el) || el.dataset.rivaDraftBound === chave) return;
      var salvar = function () { capture(chave, ids); };
      el.addEventListener('input', salvar);
      el.addEventListener('change', salvar);
      el.dataset.rivaDraftBound = chave;
    });
  }

  function clear(chave) {
    try { localStorage.removeItem(storageKey(chave)); } catch (e) {}
  }

  window.RivaDraft = { bind:bind, capture:capture, restore:restore, clear:clear };
})();
