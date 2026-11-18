// Filter page: collect the chosen options and send them to search.html in the URL.
const priceRange = document.getElementById("priceRange");
const distRange = document.getElementById("distRange");
const priceValue = document.getElementById("priceValue");
const distValue = document.getElementById("distValue");

// Show the slider numbers live.
priceRange.addEventListener("input", () => (priceValue.textContent = priceRange.value));
distRange.addEventListener("input", () => (distValue.textContent = distRange.value));

// Values of every ticked checkbox with this name.
function checked(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value);
}

document.getElementById("applyBtn").addEventListener("click", () => {
  const params = new URLSearchParams();
  const subjects = checked("subject");
  const ages = checked("age");

  // Only add a filter if the person changed it from "anything goes".
  if (subjects.length) params.set("subject", subjects.join(","));
  if (ages.length) params.set("age", ages.join(","));
  if (Number(priceRange.value) < Number(priceRange.max)) params.set("max", priceRange.value);
  if (Number(distRange.value) < Number(distRange.max)) params.set("dist", distRange.value);

  const qs = params.toString();
  location.href = qs ? `search.html?${qs}` : "search.html";
});

document.getElementById("clearBtn").addEventListener("click", () => {
  document.querySelectorAll("input[type=checkbox]").forEach((box) => (box.checked = false));
  priceRange.value = priceRange.max;
  distRange.value = distRange.max;
  priceValue.textContent = priceRange.max;
  distValue.textContent = distRange.max;
});