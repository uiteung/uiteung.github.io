export function googlelogin() {
  const googleLoginButton = document.getElementById("glbutton");

  googleLoginButton.addEventListener("click", function (event) {
    event.preventDefault(); // Mencegah form submit default

    // Tandai bahwa pengguna sedang login dengan Google
    localStorage.setItem("googleLogin", "true");

    fetch("https://lulusan.ulbi.ac.id/sso/url/google")
      .then((response) => response.json()) // Ubah respons menjadi JSON
      .then((data) => {
        console.log("Google Login URL:", data);
        if (data.data) {
          window.location.href = data.data; // Redirect ke Google OAuth
        } else {
          console.error("Google Login URL not found");
        }
      })
      .catch((error) => console.error("Error fetching Google SSO URL:", error));
  });
}
export function getGoogleCode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("code");
}

export function submitDataGoogle(googleCode) {
  console.log("Submitting Google Code:", googleCode);

  fetch(`https://lulusan.ulbi.ac.id/sso/google?code=${googleCode}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((result) => {
      const getToken = result.token;
      if (getToken) {
        setCookieLogin("login", getToken, 4); // Simpan token dalam cookie selama 18 jam
      }

      const getRoles = result.role;
      const setRole = getRoles.filter((item) => item !== null);

      const role = setRole.map((data) => data.id_role);
      console.log(role);

      if (setRole.length > 0) {
        if (setRole !== undefined) {
          setRoleCookie("user_role", role, 18); // Token berlaku 18 jam
        }
      }

      const email = result.email;
      let user_pbmp = "";
      fetch(`https://pbmp-be.ulbi.ac.id/pengguna?email=${email}`, {
        method: "GET",
        headers: {
          login: result.token,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json()) // Ubah respons menjadi JSON
        .then((data) => {
          user_pbmp = data.data.attributes;
        })
        .catch((error) =>
          console.error("Error fetching Google SSO URL:", error)
        );

      const setPbmpUser = getRoles.filter((item) => item !== null);
      if (setPbmpUser.length > 0) {
        if (setPbmpUser !== undefined) {
          setPbmpCookie("usraes", user_pbmp, 18); // Token berlaku 18 jam
        }
      }

      const nama = result.nama;

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Selamat Datang ${nama}!`,
        confirmButtonText: "Proceed",
      }).then(() => {
        window.location.href = "https://euis.ulbi.ac.id/choose-role/";
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Mohon dicek kembali email dan password Anda. Silahkan dicoba lagi",
      });
      console.error("Error:", error);
    });

  function setCookieLogin(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000); // Konversi jam ke milidetik
    const expires = "expires=" + date.toUTCString();
    document.cookie =
      name + "=" + JSON.stringify(value) + ";" + expires + ";path=/";
  }

  function setRoleCookie(name, value, hours) {
    const key = "setting-role"; // Ganti dengan kunci enkripsi Anda
    const encryptedValue = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      key
    ).toString(); // Ubah nilai menjadi string JSON sebelum dienkripsi
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encryptedValue};${expires};path=/`;
  }

  function setPbmpCookie(name, value, hours) {
    const key = "#uLBi2025#";
    const encryptedValue = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      key
    ).toString();
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encryptedValue};${expires};path=/`;
  }

  function GetAttributesUser(email, token) {
    let attributes;
    fetch(`https://pbmp-be.ulbi.ac.id/pengguna?email${email}`)
      .then((response) => response.json()) // Ubah respons menjadi JSON
      .then((data) => {
        attributes = data.data.attributes;
      })
      .catch((error) => console.error("Error fetching Google SSO URL:", error));
    return attributes;
  }
}
