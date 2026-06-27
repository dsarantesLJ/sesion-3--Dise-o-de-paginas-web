const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value;

  errorMsg.classList.add("d-none");
  loginBtn.disabled = true;
  loginBtn.textContent = "Ingresando...";

  try {
    const data = await API.login(usuario, password);
    console.log(data)
    const loginOk = data && String(data.success) === "200" && data.username;
    if (loginOk) {
      localStorage.setItem("user", JSON.stringify({ usuario: data.username }));
      window.location.href = "dashboard.html";
      return;
    }

    errorMsg.textContent = data.message || "Credenciales Incorrectas";
    errorMsg.classList.remove("d-none");



  } catch (err) {
    errorMsg.textContent = err.message || "No se pudo iniciar sesión";
    errorMsg.classList.remove("d-none");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Ingresar";
  }
});