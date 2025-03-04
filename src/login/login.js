import loadComponent from "../helpers/loadComponent.js";
import { url } from "../helpers/urlConfig.js";
import { validation } from "./sso/validation.js";
import { whatsauth } from "./qr/whatsauth.js";
import { googlelogin } from "./sso/ssogoogle.js";

export async function main() {
  const promises = [
    loadComponent(".euis .sso", url.sso + "sso.html"),
    // loadComponent(".euis .qr", url.qr + "qr.html"),
  ];

  Promise.all(promises)
    .then(() => {
      googlelogin();
      validation();
    })
    .catch((error) => {
      console.error("Error loading components:", error);
    });
}
