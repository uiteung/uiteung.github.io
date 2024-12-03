import {
  qrController,
  deleteCookie,
} from "https://cdn.jsdelivr.net/gh/whatsauth/js@0.2.1/whatsauth.js";
import { wauthparam } from "https://cdn.jsdelivr.net/gh/whatsauth/js@0.2.1/config.js";

export function whatsauth() {
  // wauthparam.auth_ws = 'd3NzOi8vYXV0aC51bGJpLmFjLmlkL3dzL3doYXRzYXV0aC9xcg==';
  wauthparam.auth_ws = "d3NzOi8vZ3cudWxiaS5hYy5pZC93cy93aGF0c2F1dGgvcHVibGlj";
  wauthparam.keyword =
    "aHR0cHM6Ly93YS5tZS82MjgxMTIwMDAyNzk/dGV4dD13aDR0NWF1dGgw";

  wauthparam.tokencookiehourslifetime = 18;
  wauthparam.jsonres;

  wauthparam.redirect = "https://euis.ulbi.ac.id/home/";

  deleteCookie(wauthparam.tokencookiename);
  qrController(wauthparam);
}
