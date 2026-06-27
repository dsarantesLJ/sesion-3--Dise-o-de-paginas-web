const userData = JSON.parse(localStorage.getItem("user") || "null");
if (userData) {
  document.getElementById("userLabel").textContent =
    userData.nombre || userData.usuario || "";
}

// ===== LOGOUT =====
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

// ===== NAVEGACIÓN ENTRE SECCIONES =====
const navLinks = document.querySelectorAll(".nav-link");
const sections = {
  dashboard: document.getElementById("dashboard-section"),
  products: document.getElementById("products-section"),
};
const sectionTitle = document.getElementById("sectionTitle");
const titles = { dashboard: "Dashboard", products: "Productos" };

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.section;

    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    Object.keys(sections).forEach((key) => {
      sections[key].classList.toggle("d-none", key !== target);
    });

    sectionTitle.textContent = titles[target];

    if (target === "products") loadProducts();
    if (target === "dashboard") loadDashboardStats();
  });
});

// ===== ESTADO =====
let productsCache = [];

// ===== DASHBOARD: ESTADÍSTICAS =====
async function loadDashboardStats() {
  try {
    const products = await API.getProducts();
    productsCache = products;

    const total = products.length;
    const totalValue = products.reduce(
      (sum, p) => sum + (Number(p.precio) || 0) * (Number(p.stock) || 0),
      0
    );
    const lowStock = products.filter((p) => Number(p.stock) < 5).length;

    document.getElementById("totalProducts").textContent = total;
    document.getElementById("totalValue").textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById("lowStock").textContent = lowStock;
  } catch (err) {
    console.error(err);
  }
}

// ===== PRODUCTOS: LISTAR =====
async function loadProducts() {
  const tbody = document.getElementById("productsTableBody");
  const emptyState = document.getElementById("emptyState");

  tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

  try {
    const products = await API.getProducts();
    productsCache = products;
    console.log(productsCache);

    if (!products.length) {
      tbody.innerHTML = "";
      emptyState.classList.remove("d-none");
      return;
    }

    emptyState.classList.add("d-none");

    tbody.innerHTML = products
      .map(
        (p) => `
        <tr>
          <td>${escapeHtml(p.nombre)}</td>
          <td>${escapeHtml(p.categoria)}</td>
          <td>$${Number(p.precio).toFixed(2)}</td>
          <td>${p.stock}</td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" onclick="openEditModal('${p.id}')">Editar</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteProductHandler('${p.id}')">Eliminar</button>
            </div>
          </td>
        </tr>`
      )
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Error al cargar productos: ${err.message}</td></tr>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ===== MODAL =====
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const productForm = document.getElementById("productForm");
const modalError = document.getElementById("modalError");

document.getElementById("addProductBtn").addEventListener("click", () => {
  openCreateModal();
});

document.getElementById("cancelBtn").addEventListener("click", closeModal);

function openCreateModal() {
  modalTitle.textContent = "Nuevo producto";
  productForm.reset();
  document.getElementById("productId").value = "";
  modalError.classList.add("d-none");
  modalOverlay.classList.remove("d-none");
  modalOverlay.classList.add("d-flex");
}

function openEditModal(id) {
  const product = productsCache.find((p) => String(p.id) === String(id));
  if (!product) return;

  modalTitle.textContent = "Editar producto";
  document.getElementById("productId").value = product.id;
  document.getElementById("nombre").value = product.nombre;
  document.getElementById("categoria").value = product.categoria;
  document.getElementById("precio").value = product.precio;
  document.getElementById("stock").value = product.stock;
  modalError.classList.add("d-none");
  modalOverlay.classList.remove("d-none");
  modalOverlay.classList.add("d-flex");
}

function closeModal() {
  modalOverlay.classList.remove("d-flex");
  modalOverlay.classList.add("d-none");
}

// ===== CREAR / ACTUALIZAR =====
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("productId").value;
  const payload = {
    nombre: document.getElementById("nombre").value.trim(),
    categoria: document.getElementById("categoria").value.trim(),
    precio: parseFloat(document.getElementById("precio").value),
    stock: parseInt(document.getElementById("stock").value, 10),
  };

  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Guardando...";

  try {
    if (id) {
      await API.updateProduct(id, payload);
    } else {
      await API.createProduct(payload);
    }
    closeModal();
    loadProducts();
  } catch (err) {
    modalError.textContent = err.message;
    modalError.classList.remove("d-none");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Guardar";
  }
});

// ===== ELIMINAR =====
async function deleteProductHandler(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

  try {
    await API.deleteProduct(id);
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
}






// ===== INICIO =====
loadDashboardStats();