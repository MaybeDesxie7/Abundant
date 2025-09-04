// Dynamic year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Request quote helper (if needed later for product-specific buttons)
function requestQuote(product) {
  window.location.href = `mailto:info@abundantfruits.com?subject=Request Quote: ${product}`;
}
