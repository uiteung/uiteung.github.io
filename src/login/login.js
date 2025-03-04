import loadComponent from "../helpers/loadComponent.js";
import { url } from "../helpers/urlConfig.js";
import { validation } from "./sso/validation.js";
import { whatsauth } from "./qr/whatsauth.js";
import {
  getGoogleCode,
  googlelogin,
  submitDataGoogle,
} from "./sso/ssogoogle.js";

export async function main() {
  const promises = [
    loadComponent(".euis .sso", url.sso + "sso.html"),
    // loadComponent(".euis .qr", url.qr + "qr.html"),
  ];

  console.log("Checking for Google Code after reload...");

  let googleCode = getGoogleCode();
  console.log(googleCode);

  if (googleCode) {
    console.log("Google Code Detected from URL:", googleCode);

    // Simpan kode di `localStorage` agar tetap tersedia setelah reload
    localStorage.setItem("googleAuthCode", googleCode);

    // Hapus parameter `code` dari URL untuk mencegah pengiriman ulang
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);

    submitDataGoogle(googleCode);
  } else {
    console.log("Google Code Not Found in URL, Checking Local Storage...");

    // Jika `code` tidak ditemukan di URL, ambil dari `localStorage`
    const savedCode = localStorage.getItem("googleAuthCode");

    if (savedCode) {
      console.log("Using saved Google Code:", savedCode);
      submitDataGoogle(savedCode);

      // Hapus `code` dari `localStorage` setelah digunakan
      localStorage.removeItem("googleAuthCode");
    }
  }

  Promise.all(promises)
    .then(() => {
      googlelogin();
      validation();
    })
    .catch((error) => {
      console.error("Error loading components:", error);
    });
}
