//importar firebase
import './firebase.js';
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

let formulario_crear = document.getElementById("formulario_crear");

formulario_crear.addEventListener("submit", function (e) {
    e.preventDefault();

    let nombre = document.getElementById("nombre").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    // Validar que los campos no estén vacíos
    if (nombre === "" || email === "" || password === "") {
        Swal.fire({
            title: "Campos vacíos",
            text: "Por favor, completa todos los campos para crear una cuenta.",
            icon: "warning",
            confirmButtonText: "Aceptar"
        });
        return; // Detiene el proceso si los campos están vacíos
    }

    //===========CREAR CORREO Y PASSWORD=============
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            let user = userCredential.user;

            // Actualizar el nombre del usuario
            updateProfile(user, {
                displayName: nombre
            }).then(() => {
                console.log("Se actualizo el nombre a " + user.displayName);
                
                // Alerta de SweetAlert que se muestra después de la creación del usuario
                Swal.fire({
                    title: "¡Cuenta creada exitosamente!",
                    text: "¡Ahora puedes iniciar sesión!",
                    icon: "success",
                    confirmButtonText: "Aceptar"
                }).then(() => {
                    // Redirigir a la página de login
                    window.location.href = "login.html";
                });

            }).catch((error) => {
                console.log("Error al actualizar el nombre del usuario:", error);
            })
        })
        .catch((error) => {
            // En caso haya error, se muestra por la consola
            console.log(error.message);
        })
})
