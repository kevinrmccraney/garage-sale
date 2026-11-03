// Change to false to close the garage sale without hiding the inventory.
const SALE_OPEN = false;

// these are placeholder pieces of inventory
const products = [
  {
    category: "FURNITURE",
    title: "Aalto Stool 60 — Linoleum Black",
    estimate: "$335",
    ask: "$220",
    images: ["images/stool.jpg"],
  },
  {
    category: "ELECTRONICS",
    title: "Custom Gaming PC",
    estimate: "$4,299",
    ask: "$2,500",
    images: ["images/pc.jpeg"],
    sold: true,
  },
];


const pickupDates = [
  ["SUN", "23"],
  ["MON", "24"],
  ["TUE", "25"],
  ["WED", "26"],
  ["THU", "27"],
  ["FRI", "28"],
  ["SAT", "29"],
  ["SUN", "30"],
];

const pickupWindows = ["anytime", "morning", "afternoon", "evening"];
const selectedTitles = new Set();
let activeDate = "23";
let activeWindow = "anytime";
let activeLightboxProductIndex = 0;
let activeLightboxImageIndex = 0;

const sale = document.querySelector(".sale");
const grid = document.querySelector("#sale-grid");
const saleStatus = document.querySelector("#sale-status");
const reserveBar = document.querySelector("#reserve-bar");
const reserveCount = document.querySelector("#reserve-count");
const reserveTotal = document.querySelector("#reserve-total");
const reserveContinue = document.querySelector("#reserve-continue");
const reserveLayer = document.querySelector("#reserve-layer");
const reserveItems = document.querySelector("#reserve-items");
const reserveForm = document.querySelector("#reserve-form");
const reserveStatus = document.querySelector("#reserve-status");
const scrollTopButton = document.querySelector("#scroll-to-top");
const lightbox = document.querySelector("#sale-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxPrev = document.querySelector("#lightbox-prev");
const lightboxNext = document.querySelector("#lightbox-next");

function moneyToNumber(value) {
  return Number(value.replace(/[^0-9.]/g, ""));
}

function formatMoney(value) {
  return `$${value.toLocaleString("en-US")}`;
}

function selectedProducts() {
  return products.filter((product) => selectedTitles.has(product.title));
}

function renderProducts() {
  saleStatus.textContent = SALE_OPEN ? "Garage sale open — reservations available" : "Garage sale closed — browsing only; reservations are unavailable";
  saleStatus.classList.toggle("is-closed", !SALE_OPEN);
  grid.replaceChildren(
    ...products.map((product, index) => {
      const card = document.createElement("li");
      const selected = selectedTitles.has(product.title);
      card.className = [
        "sale-card",
        product.sold ? "sale-card--sold" : "",
        selected ? "sale-card--picked" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const media = document.createElement("button");
      media.type = "button";
      media.className = "sale-card-media";
      media.setAttribute("aria-label", `Open image of ${product.title}`);
      media.addEventListener("click", () => openLightbox(index));
      const img = document.createElement("img");
      img.src = product.images[0];
      img.alt = product.title;
      img.loading = index < 8 ? "eager" : "lazy";
      media.append(img);

      const body = document.createElement("div");
      body.className = "sale-card-body";

      const category = document.createElement("p");
      category.className = "sale-card-category";
      category.textContent = product.category;

      const title = document.createElement("h2");
      title.className = "sale-card-title";
      title.textContent = product.title;

      const price = document.createElement("p");
      price.className = "sale-card-price";
      const row = document.createElement("span");
      row.className = "sale-price-row";
      const estimate = document.createElement("span");
      estimate.className = "sale-price-estimate";
      estimate.textContent = product.estimate;
      const ask = document.createElement("span");
      ask.className = "sale-price-ask";
      ask.textContent = product.ask;
      row.append(estimate, ask);
      if (product.sold) {
        const sold = document.createElement("span");
        sold.className = "sale-price-sold";
        sold.textContent = "SOLD";
        row.append(sold);
      }
      price.append(row);

      body.append(category, title, price);

      if (!product.sold && SALE_OPEN) {
        const contact = document.createElement("p");
        contact.className = "sale-card-contact";
        const button = document.createElement("button");
        button.type = "button";
        button.className = `sale-reserve-btn ${selected ? "is-on" : ""}`.trim();
        button.textContent = selected ? "reserved" : "reserve";
        button.addEventListener("click", () => toggleProduct(product.title));
        contact.append(button);
        body.append(contact);
      }

      card.append(media, body);
      return card;
    }),
  );
}

function toggleProduct(title) {
  if (!SALE_OPEN) return;
  reserveStatus.hidden = true;
  if (selectedTitles.has(title)) {
    selectedTitles.delete(title);
  } else {
    selectedTitles.add(title);
  }
  updateReserveUi();
  renderProducts();
}

function removeProduct(title) {
  selectedTitles.delete(title);
  reserveStatus.hidden = true;
  updateReserveUi();
  renderProducts();
}

function updateReserveUi() {
  const items = selectedProducts();
  const total = items.reduce((sum, product) => sum + moneyToNumber(product.ask), 0);

  reserveBar.hidden = !SALE_OPEN || items.length === 0;
  sale.classList.toggle("has-reserve-bar", SALE_OPEN && items.length > 0);
  reserveCount.textContent = `${items.length} ${
    items.length === 1 ? "item" : "items"
  } added`;
  reserveTotal.textContent = formatMoney(total);

  if (!SALE_OPEN || items.length === 0) {
    reserveLayer.hidden = true;
    return;
  }

  renderReserveItems(items, total);
}

function renderReserveItems(items, total) {
  const rows = items.map((item) => {
    const row = document.createElement("li");
    const title = document.createElement("span");
    title.className = "sale-reserve-item-title";
    title.textContent = item.title;
    const price = document.createElement("span");
    price.className = "sale-reserve-item-price";
    price.textContent = item.ask;
    const remove = document.createElement("button");
    remove.className = "sale-reserve-remove";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${item.title}`);
    remove.addEventListener("click", () => removeProduct(item.title));
    row.append(title, price, remove);
    return row;
  });

  const totalRow = document.createElement("li");
  totalRow.className = "sale-reserve-total";
  const totalLabel = document.createElement("span");
  totalLabel.className = "sale-reserve-item-title";
  totalLabel.textContent = "total";
  const totalPrice = document.createElement("span");
  totalPrice.className = "sale-reserve-item-price";
  totalPrice.textContent = formatMoney(total);
  totalRow.append(totalLabel, totalPrice, document.createElement("span"));

  reserveItems.replaceChildren(...rows, totalRow);
}

function renderChips() {
  const dateChips = document.querySelector("#date-chips");
  const windowChips = document.querySelector("#window-chips");

  dateChips.replaceChildren(
    ...pickupDates.map(([weekday, day]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `sale-chip sale-chip--date ${
        activeDate === day ? "is-on" : ""
      }`.trim();
      button.innerHTML = `<span class="sale-chip-weekday">${weekday}</span><span class="sale-chip-day">${day}</span>`;
      button.addEventListener("click", () => {
        activeDate = day;
        renderChips();
      });
      return button;
    }),
  );

  windowChips.replaceChildren(
    ...pickupWindows.map((windowName) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `sale-chip ${
        activeWindow === windowName ? "is-on" : ""
      }`.trim();
      button.textContent = windowName;
      button.addEventListener("click", () => {
        activeWindow = windowName;
        renderChips();
      });
      return button;
    }),
  );
}

function openReserveSheet() {
  if (!SALE_OPEN || selectedTitles.size === 0) return;
  reserveStatus.hidden = true;
  reserveLayer.hidden = false;
}

function closeReserveSheet() {
  reserveLayer.hidden = true;
}

function renderLightbox() {
  const product = products[activeLightboxProductIndex];
  if (!product || !product.images.length) return;
  const images = product.images;
  activeLightboxImageIndex =
    (activeLightboxImageIndex + images.length) % images.length;
  lightboxImage.src = images[activeLightboxImageIndex];
  lightboxImage.alt = `${product.title}, image ${activeLightboxImageIndex + 1} of ${images.length}`;
  lightboxTitle.textContent = `${product.title} — ${product.ask} — ${activeLightboxImageIndex + 1}/${images.length}`;
  const hasGallery = images.length > 1;
  lightboxPrev.hidden = !hasGallery;
  lightboxNext.hidden = !hasGallery;
}

function openLightbox(productIndex) {
  activeLightboxProductIndex = productIndex;
  activeLightboxImageIndex = 0;
  renderLightbox();
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightbox.querySelector(".sale-lightbox-close").focus();
}

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
}

function stepLightbox(direction) {
  const product = products[activeLightboxProductIndex];
  if (!product || product.images.length < 2) return;
  activeLightboxImageIndex =
    (activeLightboxImageIndex + direction + product.images.length) % product.images.length;
  renderLightbox();
}

function updateScrollTop() {
  scrollTopButton.classList.toggle("is-visible", window.scrollY > 420);
}

document
  .querySelectorAll("[data-close-lightbox]")
  .forEach((button) => button.addEventListener("click", closeLightbox));
lightboxPrev.addEventListener("click", () => stepLightbox(-1));
lightboxNext.addEventListener("click", () => stepLightbox(1));

reserveContinue.addEventListener("click", openReserveSheet);
document
  .querySelectorAll("[data-close-reserve]")
  .forEach((button) => button.addEventListener("click", closeReserveSheet));

reserveForm.addEventListener("submit", (event) => {
  event.preventDefault();
  reserveStatus.hidden = false;
});

window.addEventListener("scroll", updateScrollTop, { passive: true });
scrollTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.hidden) {
    if (event.key === "Escape") {
      closeLightbox();
      return;
    }
    if (event.key === "ArrowLeft") {
      stepLightbox(-1);
      return;
    }
    if (event.key === "ArrowRight") {
      stepLightbox(1);
      return;
    }
  }

  if (event.key !== "Escape") return;
  closeReserveSheet();
});

renderProducts();
renderChips();
updateReserveUi();
updateScrollTop();
