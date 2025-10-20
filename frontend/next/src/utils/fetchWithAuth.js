export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");
  console.log('🔍 fetchWithAuth - URL:', url);
  console.log('🔍 fetchWithAuth - Token:', token ? 'Presente' : 'Ausente');

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  console.log('🔍 fetchWithAuth - Headers:', headers);
  const res = await fetch(url, { ...options, headers });
  console.log('🔍 fetchWithAuth - Status:', res.status);

  if (res.status === 401) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  // Verificar se a resposta é JSON
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    console.error('Resposta não é JSON:', res.status, res.statusText);
    console.error('URL:', url);
    console.error('Headers:', res.headers);
    throw new Error(`Erro ${res.status}: ${res.statusText}`);
  }

  // Verificar se a resposta é um erro
  if (!res.ok) {
    const errorData = await res.json();
    console.error('Erro da API:', errorData);
    throw new Error(errorData.message || `Erro ${res.status}: ${res.statusText}`);
  }

  return res.json();
}
