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
    hasSubmitted = true; // Set flag bahwa tombol submit sudah ditekan
    let isValid = true;

    // Validasi Email
    if (!emailInput.value.trim()) {
      showError(emailInput, "Email is required.");
      isValid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      showError(emailInput, "Please enter a valid email address.");
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
        email: emailInput.value.trim(),
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
        const setRole = getRoles
          .filter((item) => item.Detail !== null)
          .filter((data) => data.Detail?.id_role !== "mhs");

        if (setRole.length > 0) {
          const role = setRole[0].Detail.id_role;

          if (role !== undefined) {
            setCookie("user_role", role, 18); // Token berlaku 18 jam
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
          // window.location.href = "https://euis.ulbi.ac.id/home/";
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

  // Fungsi untuk menetapkan cookie dengan enkripsi
  function setCookie(name, value, hours) {
    const key = "kecuali-mhs"; // Ganti dengan kunci enkripsi Anda
    const encryptedValue = CryptoJS.AES.encrypt(value, key).toString();
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
      } else if (!validateEmail(input.value.trim())) {
        showError(input, "Please enter a valid email address.");
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
