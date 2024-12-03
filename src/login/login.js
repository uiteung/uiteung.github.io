import loadComponent from "../helpers/loadComponent.js";
import { url } from "../helpers/urlConfig.js";
import { validation } from "./sso/validation.js";
import { whatsauth } from "./qr/whatsauth.js";

export async function main() {
  const promises = [
    loadComponent(".euis .sso", url.sso + "sso.html"),
    loadComponent(".euis .qr", url.qr + "qr.html"),
  ];

  Promise.all(promises)
    .then(() => {
      validation();
      whatsauth();
    })
    .catch((error) => {
      console.error("Error loading components:", error);
    });
}
