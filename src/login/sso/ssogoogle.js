export function googlelogin() {
  const googleLoginButton = document.getElementById("glbutton");

  googleLoginButton.addEventListener("click", function (event) {
    event.preventDefault(); // Mencegah tombol submit default

    // Simpan informasi bahwa pengguna menggunakan Google Login
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

  // Tunggu sampai halaman benar-benar dimuat sebelum membaca Google Code
  window.onload = function () {
    console.log("Checking for Google Code...");
    let googleCode = getGoogleCode();

    if (googleCode) {
      console.log("Google Code Detected:", googleCode);
      localStorage.setItem("googleAuthCode", googleCode);
      localStorage.removeItem("googleLogin"); // Hapus flag Google login
      submitData(googleCode);
    } else {
      console.log("Google Code Not Found, Retrying...");
      setTimeout(() => {
        googleCode = getGoogleCode();
        if (googleCode) {
          console.log("Google Code Found After Delay:", googleCode);
          localStorage.setItem("googleAuthCode", googleCode);
          localStorage.removeItem("googleLogin");
          submitData(googleCode);
        } else {
          console.error("Failed to retrieve Google Code");
        }
      }, 1500); // Delay tambahan 1.5 detik untuk memastikan URL diperbarui
    }
  };

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
