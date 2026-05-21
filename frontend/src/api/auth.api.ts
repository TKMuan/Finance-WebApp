const BACKEND_API = import.meta.env.VITE_BACKEND_API || "http://localhost:5000";

export const checkActiveSessionApi = async () => {
  const response = await fetch(`${BACKEND_API}/auth/cookie/active`, { 
    method: "POST", 
    credentials: "include" 
  });
  if (!response.ok) throw new Error("Session check failed");
  return response.json();
};

export const registerApi = async (email: string, password: string, fname: string, lname: string) => {
  const response = await fetch(`${BACKEND_API}/auth/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fname, lname })
  });
  if (!response.ok) throw new Error("Registration failed");
  return await response.json();
}

export const loginApi = async (email: string, password: string) => {

  const response = await fetch(`${BACKEND_API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) throw new Error("Login failed");
  return await response.json();
};

export const logoutApi = async () => {
  const response = await fetch(`${BACKEND_API}/auth/logout`, { 
    method: "POST", 
    credentials: "include" 
  });
  if (!response.ok) throw new Error("Logout failed");
  return await response.json();
};