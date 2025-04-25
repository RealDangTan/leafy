// components.js
function loadComponent(selector, file) {
    fetch(file)
      .then(res => res.text())
      .then(html => {
        document.querySelector(selector).innerHTML = html;
      })
      .catch(err => console.error(`Error loading ${file}:`, err));
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    loadComponent("#navigation", "../components/navigation.html");
    loadComponent("#footer", "../components/footer.html");
    loadComponent("#preloader", "../components/preloader.html");
  });
  