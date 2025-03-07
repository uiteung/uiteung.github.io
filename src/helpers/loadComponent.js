export default async function loadComponent(selector, url) {
  if (!url || !url.trim()) {
    console.error("Invalid URL:", url);
    return;
  }
  if (!selector || !document.querySelector(selector)) {
    console.error("Invalid selector:", selector);
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        `Failed to load file: ${response.status} - ${response.statusText}`
      );

    const html = await response.text();
    document.querySelector(selector).innerHTML = html;
  } catch (error) {
    console.error("Error loading component:", error);
  }
}


export function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function deleteCookie(cname) {
  document.cookie = cname + "= ; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}