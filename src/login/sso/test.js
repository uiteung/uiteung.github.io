export function googlelogin() {
  const googleLoginButton = document.getElementById("glbutton");

  googleLoginButton
    .addEventListener("click", function (event) {
      event.preventDefault(); // Mencegah form submit default

      const email = "indra@ulbi.ac.id";
      let user_pbmp;
      fetch(`https://pbmp-be.ulbi.ac.id/pengguna?email=${email}`, {
        method: "GET",
        headers: {
          login:
            "v4.public.eyJleHAiOiIyMDI1LTAzLTA1VDEwOjA3OjEyKzA3OjAwIiwiaWF0IjoiMjAyNS0wMy0wNFQxNjowNzoxMiswNzowMCIsImlkIjoiNjI4MTIyMjIxODE0IiwibmJmIjoiMjAyNS0wMy0wNFQxNjowNzoxMiswNzowMCJ9ruNY_ocR9-rEzjTnmuND_cap75DPk-DPiwlqIquPgvoHJwj_0xrY8d_TtofnlRebhmTReYA6aaIP5jKoZB0cCQ",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json()) // Ubah respons menjadi JSON
        .then((data) => {
          //   console.log(data.data.attributes);
          user_pbmp = data.data.attributes;
          console.log(user_pbmp)
        })
        .catch((error) =>
          console.error("Error fetching Google SSO URL:", error)
        );

      console.log(user_pbmp);

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Selamat Datang!`,
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
