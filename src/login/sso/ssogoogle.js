export function googlelogin() {
  const googleLoginButton = document.getElementById("glbutton");

  if (!googleLoginButton) {
    return;
  }

  googleLoginButton.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.setItem("googleLogin", "true");

    fetch("https://lulusan.ulbi.ac.id/sso/url/google")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Gagal mendapatkan URL login Google",
          );
        }

        return data;
      })
      .then((data) => {
        if (data.data) {
          window.location.href = data.data;
        }
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Gagal terhubung ke layanan Google. Silakan coba kembali.",
        });
      });
  });
}

export function getGoogleCode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("code");
}

export function submitDataGoogle(googleCode) {
  const endpoint =
    `https://lulusan.ulbi.ac.id/sso/google?code=${encodeURIComponent(
      googleCode,
    )}`;

  fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (response) => {
      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error("Response Google SSO bukan JSON yang valid");
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Google SSO gagal dengan HTTP status ${response.status}`,
        );
      }

      return result;
    })
    .then(async (result) => {
      const getToken = result?.token;

      if (getToken) {
        setCookieLogin("login", getToken, 4);
      }

      const email =
        typeof result?.email === "string"
          ? result.email.trim().toLowerCase()
          : "";

      const getRoles = Array.isArray(result?.role)
        ? result.role
        : [];

      const role = getRoles
        .filter((item) => item !== null && item !== undefined)
        .map((item) => item.id_role)
        .filter(Boolean);

      if (
        email === "darfial@ulbi.ac.id" &&
        !role.includes("dosen")
      ) {
        role.push("dosen");
      }

      const uniqueRoles = [...new Set(role)];

      if (uniqueRoles.length > 0) {
        setRoleCookie("user_role", uniqueRoles, 18);
      }

      const userPbmp = await fetchPbmpUser(email, result.token);

      if (userPbmp) {
        setPbmpCookie("usraes", userPbmp, 18);
      }

      return {
        result,
        email,
        roles: uniqueRoles,
        userPbmp,
      };
    })
    .then(({ result }) => {
      const nama = result?.nama || "Pengguna";

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Selamat Datang ${nama}!`,
        confirmButtonText: "Proceed",
      }).then(() => {
        window.location.href =
          "https://euis.ulbi.ac.id/choose-role/";
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error?.message ||
          "Login Google gagal. Silakan coba kembali.",
      });
    });

  async function fetchPbmpUser(email, token) {
    if (!email) {
      return null;
    }

    const endpoint =
      `https://pbmp-be.ulbi.ac.id/pengguna?email=${encodeURIComponent(
        email,
      )}`;

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          login: token,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `PBMP API gagal dengan HTTP status ${response.status}`,
        );
      }

      return data?.data?.attributes || null;
    } catch {
      return null;
    }
  }

  function setCookieLogin(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);

    const expires = `expires=${date.toUTCString()}`;

    document.cookie =
      `${name}=${JSON.stringify(value)};${expires};path=/`;
  }

  function setRoleCookie(name, value, hours) {
    const key = "setting-role";

    const encryptedValue = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      key,
    ).toString();

    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);

    const expires = `expires=${date.toUTCString()}`;

    document.cookie =
      `${name}=${encryptedValue};${expires};path=/`;
  }

  function setPbmpCookie(name, value, hours) {
    const key = "#uLBi2025#";

    const encryptedValue = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      key,
    ).toString();

    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);

    const expires = `expires=${date.toUTCString()}`;

    document.cookie =
      `${name}=${encryptedValue};${expires};path=/`;
  }
}