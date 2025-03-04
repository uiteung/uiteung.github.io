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

  function getGoogleCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("code");
  }

  // **Cek otomatis setelah halaman reload**
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Checking for Google Code after reload...");

    let googleCode = getGoogleCode();

    if (googleCode) {
      console.log("Google Code Detected from URL:", googleCode);

      // Simpan kode di `localStorage` agar tetap tersedia setelah reload
      localStorage.setItem("googleAuthCode", googleCode);

      // Hapus parameter `code` dari URL untuk mencegah pengiriman ulang
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      submitData(googleCode);
    } else {
      console.log("Google Code Not Found in URL, Checking Local Storage...");

      // Jika `code` tidak ditemukan di URL, ambil dari `localStorage`
      const savedCode = localStorage.getItem("googleAuthCode");

      if (savedCode) {
        console.log("Using saved Google Code:", savedCode);
        submitData(savedCode);

        // Hapus `code` dari `localStorage` setelah digunakan
        localStorage.removeItem("googleAuthCode");
      }
    }
  });

  function submitData(googleCode) {
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
        console.log("Login Result:", result);
        const getToken = result.token;
        if (getToken) {
          setCookie("login", getToken, 18); // Simpan token dalam cookie selama 18 jam
        }

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "Selamat Datang!",
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
  }
}
