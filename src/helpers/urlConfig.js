//lib call
import { folderPath } from "https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js";

export const croot = folderPath() + "src/";

export const folder = {
  login: croot + "login/",
  helpers: croot + "helpers/",
};

export const url = {
  sso: folder.login + "sso/",
  qr: folder.login + "qr/",
};
