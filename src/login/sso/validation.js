export function validation() {
  const form = document.getElementById("sso-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const hidePassword = document.getElementById("hide-password");
  let hasSubmitted = false; // Flag untuk mengecek apakah tombol submit sudah ditekan

  hidePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      hidePassword.textContent = "visibility_off";
    } else {
      passwordInput.type = "password";
      hidePassword.textContent = "visibility";
    }
  });

  // Validasi manual saat tombol submit ditekan
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (sessionStorage.getItem("googleLogin") === "true") {
      console.log("Google login detected, skipping form validation...");
      return; // Melewati validasi form jika Google Login digunakan
    }
    hasSubmitted = true; // Set flag bahwa tombol submit sudah ditekan
    let isValid = true;

    // Validasi Email
    if (!emailInput.value.trim()) {
      showError(emailInput, "Email/NIDN is required.");
      isValid = false;
    } else {
      hideError(emailInput);
    }

    // Validasi Password
    if (!passwordInput.value.trim()) {
      showError(passwordInput, "Password is required.");
      isValid = false;
    } else {
      hideError(passwordInput);
    }

    // Submit form jika validasi lolos
    if (isValid) {
      const formData = {
        nidn: emailInput.value.trim(),
        password: passwordInput.value.trim(),
      };
      submitData(formData);
    }
  });

  // Fungsi fetch untuk POST data
  function submitData(data) {
    // Membuat Promise untuk fetch
    new Promise((resolve, reject) => {
      fetch("https://lulusan.ulbi.ac.id/lulusan/transkrip/sevima/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    })
      .then((result) => {
        // console.log(result.data);

        // Menetapkan cookie dengan token login
        const getToken = result.token;
        if (getToken) {
          setCookie("login", getToken, 18); // Token berlaku 18 jam
        }

        const getRoles = result.data.attributes.role;
        const setRole = getRoles.filter((item) => item !== null);

        const role = setRole.map((data) => data.id_role);
        // console.log(role);

        if (setRole.length > 0) {
          if (setRole !== undefined) {
            setEncCookie("user_role", role, 18); // Token berlaku 18 jam
          }
        }

        const user_pbmp = result.data.attributes;
        const setPbmpUser = getRoles.filter((item) => item !== null);

        if (setPbmpUser.length > 0) {
          if (setPbmpUser !== undefined) {
            setPbmpCookie("usraes", user_pbmp, 18); // Token berlaku 18 jam
          }
        }

        const name = result.data.attributes.nama;

        // Menampilkan pesan sukses menggunakan SweetAlert
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: `Selamat Datang, ${capitalizeWords(name)}!`,
          confirmButtonText: "Proceed",
        }).then(() => {
          // Redirect atau tindakan lain setelah login
          window.location.href = "https://euis.ulbi.ac.id/choose-role/";
        });
      })
      .catch((error) => {
        // Menampilkan pesan error menggunakan SweetAlert
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Mohon dicek kembali email dan password Anda. Silahkan dicoba lagi",
        });
        console.error("Error:", error);
      });
  }

  // Fungsi untuk menetapkan cookie
  function setCookie(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000); // Konversi jam ke milidetik
    const expires = "expires=" + date.toUTCString();
    document.cookie =
      name + "=" + JSON.stringify(value) + ";" + expires + ";path=/";
  }

  // Fungsi untuk menetapkan cookie dengan enkripsi
  function setEncCookie(name, value, hours) {
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

  function capitalizeWords(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Tambahkan validasi dinamis jika tombol submit sudah ditekan
  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener("input", () => {
      if (hasSubmitted) validateField(input);
    });
    input.addEventListener("change", () => {
      if (hasSubmitted) validateField(input);
    });
  });

  // Fungsi validasi individual untuk input
  function validateField(input) {
    if (input.id === "email") {
      if (!input.value.trim()) {
        showError(input, "Email is required.");
      } else {
        hideError(input);
      }
    }

    if (input.id === "password") {
      if (!input.value.trim()) {
        showError(input, "Password is required.");
      } else {
        hideError(input);
      }
    }
  }

  // Menampilkan pesan error
  function showError(input, message) {
    const feedback = input.nextElementSibling; // Mendapatkan elemen invalid-feedback
    feedback.textContent = message;
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
  }

  // Menyembunyikan pesan error
  function hideError(input) {
    const feedback = input.nextElementSibling; // Mendapatkan elemen invalid-feedback
    feedback.textContent = ""; // Hapus pesan error
    input.classList.remove("is-invalid");
    input.classList.add("is-valid"); // Tambahkan kelas is-valid
  }

  // Validasi format email
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex untuk email valid
    return regex.test(email);
  }
}
