```javascript
// Função que simula uma chamada ao backend
function realizarAcao(tipo) {
  // Se você tivesse um backend em Java + Spring Boot, poderia usar:
  /*
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario: 'teste', senha: '123' })
  })
    .then(r => {
      if (r.ok) {
        abrirPopup('success');
      } else {
        abrirPopup('error');
      }
    })
    .catch(() => abrirPopup('error'));
  */

  // Como ainda não temos backend, simulamos:
  abrirPopup(tipo);
}

// Abre o popup de acordo com o tipo
function abrirPopup(tipo) {
  document.getElementById('overlay').style.display = 'block';

  if (tipo === 'success') {
    document.getElementById('popupSuccess').style.display = 'block';
  } else {
    document.getElementById('popupError').style.display = 'block';
  }
}

// Fecha os popups
function fecharPopup() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('popupSuccess').style.display = 'none';
  document.getElementById('popupError').style.display = 'none';
}
```
