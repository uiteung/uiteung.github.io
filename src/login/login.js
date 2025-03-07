import loadComponent, {deleteCookie, getCookie} from "../helpers/loadComponent.js";
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
  let pbmp_token = getCookie("pbmp-token");
  let pbmp_login = getCookie("pbmp-login");
  if (pbmp_token && pbmp_login || pbmp_token || pbmp_login) {
    deleteCookie("pbmp-token");
    deleteCookie("pbmp-login");
  }
  let googleCode = getGoogleCode();

  if (googleCode) {
    // console.log("Google Code Detected from URL:", googleCode);

    // Simpan kode di `localStorage` agar tetap tersedia setelah reload
    localStorage.setItem("googleAuthCode", googleCode);

    // Hapus parameter `code` dari URL untuk mencegah pengiriman ulang
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);

    submitDataGoogle(googleCode);
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
