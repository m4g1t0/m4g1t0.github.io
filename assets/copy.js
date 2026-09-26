// Mejora de copia para la web CEO & Herrero.
// Los botones usan data-copy-target con el id de un elemento cuyo texto literal
// (incluidos saltos de línea) se copia. Sin JavaScript todo el contenido y las
// descargas siguen disponibles; este script solo añade la copia con un clic.

(function () {
  "use strict";

  function setText(node, value) {
    node.textContent = value;
  }

  function announce(button, message, isError) {
    var status = button.getAttribute("aria-describedby");
    var node = document.getElementById(status);
    if (!node) {
      node = document.createElement("span");
      node.id = "copy-status-" + button.dataset.copyTarget;
      node.className = "copy-status";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      button.parentNode.insertBefore(node, button.nextSibling);
      button.setAttribute("aria-describedby", node.id);
    }
    setText(node, message);
    if (isError) {
      node.classList.add("copy-status-error");
    } else {
      node.classList.remove("copy-status-error");
    }
  }

  function fallbackHint(button) {
    announce(
      button,
      "No se pudo copiar automáticamente. Selecciona el texto manualmente o usa el enlace de descarga.",
      true
    );
  }

  function copyText(button, text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(
        function () {
          announce(button, "Copiado.");
        },
        function () {
          fallbackHint(button);
        }
      );
    }
    return Promise.reject(new Error("clipboard no disponible")).catch(function () {
      fallbackHint(button);
    });
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest ? event.target.closest("[data-copy-target]") : null;
    if (!button) {
      return;
    }
    var source = document.getElementById(button.getAttribute("data-copy-target"));
    if (!source) {
      fallbackHint(button);
      return;
    }
    copyText(button, source.textContent);
  });
})();
