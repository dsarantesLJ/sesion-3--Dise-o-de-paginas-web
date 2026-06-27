// ============================================
// CONFIGURACIÓN DE LA API
// Cambia BASE_URL por la URL real de tu API
// ============================================
const API = {
  BASE_URL: "https://n8n.ideemllc.com/webhook", 

  ENDPOINTS: {
    LOGIN: "/login",
    PRODUCTS: "/products",
  },

  headers() {
    return { "Content-Type": "application/json" };
  },

  // ---------- LOGIN ----------
  async login(usuario, password) {
    const res = await fetch(`${this.BASE_URL}${this.ENDPOINTS.LOGIN}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ usuario, password }),
    });
    console.log(res.data);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Usuario o contraseña incorrectos");
    }

    return res.json(); // se espera { user }
  },

  // ---------- PRODUCTOS (CRUD) ----------
  async getProducts() {
    const res = await fetch(`${this.BASE_URL}${this.ENDPOINTS.PRODUCTS}`, {
      method: "GET",
      headers: this.headers(),
      // Evita que el navegador guarde la petición en memoria, forzándolo a traer siempre los datos más recientes de n8n
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al obtener productos");
    return res.json();
  },

  async createProduct(data) {
    const res = await fetch(`${this.BASE_URL}${this.ENDPOINTS.PRODUCTS}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({...data, action:"createProduct"}),
    });
    if (!res.ok) throw new Error("Error al crear el producto");
    return res.json();
  },

  async updateProduct(id, data) {
    const res = await fetch(`${this.BASE_URL}${this.ENDPOINTS.PRODUCTS}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({id: id,...data, action:"updateProduct"}),
    });
    if (!res.ok) throw new Error("Error al actualizar el producto");
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${this.BASE_URL}${this.ENDPOINTS.PRODUCTS}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({id: id,action:"deleteProduct"}),
    });
    if (!res.ok) throw new Error("Error al eliminar el producto");
    return true;
  },
};