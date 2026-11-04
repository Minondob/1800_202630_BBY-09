const priceRange = document.getElementById("priceRange");
if (priceRange) {
  priceRange.addEventListener("input", () => {
    document.getElementById("priceValue").textContent = priceRange.value;
  });
}

const applyFiltersBtn = document.getElementById("applyFiltersBtn");
if (applyFiltersBtn) {
  applyFiltersBtn.addEventListener("click", () => {
    const subject = document.getElementById("subjectInput").value;
    const ageGroup = document.getElementById("ageGroupSelect").value;
    const maxPrice = document.getElementById("priceRange").value;
    const distance = document.getElementById("distanceSelect").value;

    const params = new URLSearchParams({ subject, ageGroup, maxPrice, distance });
    window.location.href = `/search.html?${params.toString()}`;
  });
}