export function googlelogin() {
  const googleLoginButton = document.getElementById("glbutton");

  if (!googleLoginButton) {
    console.error("[Google Login] Tombol #glbutton tidak ditemukan.");
    return;
  }

  googleLoginButton.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.setItem("googleLogin", "true");

    console.log("[Google Login] Meminta URL OAuth Google...");

    fetch("https://lulusan.ulbi.ac.id/sso/url/google")
      .then(async (response) => {
        const data = await response.json();

        console.log("[Google Login URL] HTTP status:", response.status);
        console.log("[Google Login URL] Full response:", data);
        console.table(data);

        if (!response.ok) {
          throw new Error(
            data?.message || "Gagal mendapatkan URL login Google",
          );
        }

        return data;
      })
      .then((data) => {
        if (data.data) {
          console.log("[Google Login] Redirect URL:", data.data);
          window.location.href = data.data;
        } else {
          console.error(
            "[Google Login] URL Google tidak ada pada data.data:",
            data,
          );
        }
      })
      .catch((error) => {
        console.error("[Google Login URL] Error:", error);
      });
  });
}

export function getGoogleCode() {
  const urlParams = new URLSearchParams(window.location.search);
  const googleCode = urlParams.get("code");

  console.log("[Google Callback] Code ditemukan:", googleCode);

  return googleCode;
}

export function submitDataGoogle(googleCode) {
  const endpoint =
    `https://lulusan.ulbi.ac.id/sso/google?code=${encodeURIComponent(
      googleCode,
    )}`;

  console.group("[Google SSO] Proses login");
  console.log("[Google SSO] Endpoint:", endpoint);
  console.log("[Google SSO] Authorization code:", googleCode);
  console.groupEnd();

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
      } catch (error) {
        console.error(
          "[Google SSO] Response bukan JSON yang valid:",
          error,
        );

        throw new Error("Response Google SSO bukan JSON yang valid");
      }

      console.group("[Google SSO] Response API");
      console.log("HTTP status:", response.status);
      console.log("HTTP OK:", response.ok);
      console.log("Full result:", result);
      console.log("result.token:", result?.token);
      console.log("result.email:", result?.email);
      console.log("result.nama:", result?.nama);
      console.log("result.role:", result?.role);

      if (Array.isArray(result?.role)) {
        console.table(result.role);
      }

      console.groupEnd();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Google SSO gagal dengan HTTP status ${response.status}`,
        );
      }

      return result;
    })
    .then(async (result) => {
      /*
       * Simpan token login
       */
      const getToken = result?.token;

      if (getToken) {
        setCookieLogin("login", getToken, 4);

        console.log("[Cookie] Cookie login berhasil disimpan.");
      } else {
        console.warn("[Google SSO] Token tidak ditemukan:", result);
      }

      /*
       * Ambil email
       */
      const email =
        typeof result?.email === "string"
          ? result.email.trim().toLowerCase()
          : "";

      console.log("[Google SSO] Email setelah normalisasi:", email);

      /*
       * Ambil role dari response Google
       */
      const getRoles = Array.isArray(result?.role)
        ? result.role
        : [];

      console.group("[Role] Pengolahan role");
      console.log("Role mentah dari API:", getRoles);

      if (getRoles.length > 0) {
        console.table(getRoles);
      }

      const role = getRoles
        .filter((item) => item !== null && item !== undefined)
        .map((item) => item.id_role)
        .filter(Boolean);

      console.log("ID role sebelum penambahan:", role);

      /*
       * Tambahkan dosen khusus untuk akun berikut
       */
      if (
        email === "darfial@ulbi.ac.id" &&
        !role.includes("dosen")
      ) {
        role.push("dosen");

        console.log(
          "[Role] Role dosen ditambahkan untuk:",
          email,
        );
      }

      const uniqueRoles = [...new Set(role)];

      console.log("Role akhir:", uniqueRoles);
      console.groupEnd();

      /*
       * Simpan role ke cookie
       */
      if (uniqueRoles.length > 0) {
        setRoleCookie("user_role", uniqueRoles, 18);

        console.log(
          "[Cookie] user_role berhasil disimpan:",
          uniqueRoles,
        );
      } else {
        console.warn(
          "[Cookie] user_role tidak disimpan karena role kosong.",
        );
      }

      /*
       * Ambil detail pengguna dari PBMP
       */
      const userPbmp = await fetchPbmpUser(email, result.token);

      if (userPbmp) {
        setPbmpCookie("usraes", userPbmp, 18);

        console.log(
          "[Cookie] usraes berhasil disimpan:",
          userPbmp,
        );
      }

      /*
       * Tampilkan hasil akhir
       */
      console.group("[Google Login] Hasil akhir");
      console.log("Nama:", result?.nama);
      console.log("Email:", email);
      console.log("Role awal:", getRoles);
      console.log("Role akhir:", uniqueRoles);
      console.log("User PBMP:", userPbmp);
      console.groupEnd();

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
      console.error("[Google Login] Proses login gagal:", error);

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
      console.warn(
        "[PBMP API] Tidak dipanggil karena email kosong.",
      );

      return null;
    }

    const endpoint =
      `https://pbmp-be.ulbi.ac.id/pengguna?email=${encodeURIComponent(
        email,
      )}`;

    console.log("[PBMP API] Endpoint:", endpoint);

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          login: token,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      console.group("[PBMP API] Response");
      console.log("HTTP status:", response.status);
      console.log("HTTP OK:", response.ok);
      console.log("Full response:", data);
      console.log(
        "data.data.attributes:",
        data?.data?.attributes,
      );

      if (data?.data?.attributes) {
        console.table(data.data.attributes);
      }

      console.groupEnd();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `PBMP API gagal dengan HTTP status ${response.status}`,
        );
      }

      if (!data?.data?.attributes) {
        console.warn(
          "[PBMP API] data.data.attributes tidak ditemukan:",
          data,
        );

        return null;
      }

      return data.data.attributes;
    } catch (error) {
      console.error("[PBMP API] Error:", error);
      return null;
    }
  }

  function setCookieLogin(name, value, hours) {
    const date = new Date();
    date.setTime(
      date.getTime() + hours * 60 * 60 * 1000,
    );

    const expires = `expires=${date.toUTCString()}`;

    document.cookie =
      `${name}=${JSON.stringify(value)};` +
      `${expires};path=/`;
  }

  function setRoleCookie(name, value, hours) {
    const key = "setting-role";

    const encryptedValue = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      key,
    ).toString();

    const date = new Date();
    date.setTime(
      date.getTime() + hours * 60 * 60 * 1000,
    );

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
    date.setTime(
      date.getTime() + hours * 60 * 60 * 1000,
    );

    const expires = `expires=${date.toUTCString()}`;

    document.cookie =
      `${name}=${encryptedValue};${expires};path=/`;
  }
}