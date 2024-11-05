// Importar Firebase y las funciones necesarias
import './firebase.js';
import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

let nombreUsuario = document.getElementById("displayName");
let publicacionesDiv = document.getElementById("publicaciones"); // Contenedor de publicaciones
let botonPublicar = document.getElementById("publicar"); // Botón para publicar
let nuevaPublicacion = document.getElementById("nueva_publicacion"); // Área de texto para nueva publicación
let fotoPublicacion = document.getElementById("foto_publicacion"); // Input de archivo para subir imagen
let idUsuario = null;

// Variables para el modal de edición
let modalEditar = new bootstrap.Modal(document.getElementById('editarModal')); // Modal de edición
let nuevoTexto = document.getElementById("nuevoTexto"); // Área de texto para editar la publicación
let idActualEdicion = null; // Almacenar el ID de la publicación que se está editando   

// Variables de modal para editar perfil
let nuevoNombre = document.getElementById("nuevoNombre");
let nuevaFoto = document.getElementById("nuevaFoto");
let guardarPerfilBtn = document.getElementById("guardarPerfil");

// Escuchar los cambios de autenticación
onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        // Mostrar el nombre del usuario
        nombreUsuario.innerHTML = usuario.displayName || "Usuario";
        idUsuario = usuario.uid; // Almacenar el ID del usuario

        // Recuperar la foto de perfil
        const fotoPerfil = document.getElementById("fotoPerfil");
        fotoPerfil.src = usuario.photoURL || "user.jpg"; // Foto por defecto
    } else {
        window.location.href = "login.html";
    }
});

// Publicar nueva publicación con foto
botonPublicar.addEventListener("click", async () => {
    if (nuevaPublicacion.value.trim() !== "" || fotoPublicacion.files.length > 0) { // Verificar que al menos uno no esté vacío
        try {
            let urlFoto = null; // Inicialmente sin foto
            if (fotoPublicacion.files.length > 0) {
                const archivoFoto = fotoPublicacion.files[0];
                const fotoRef = ref(storage, 'fotos_publicaciones/' + archivoFoto.name); // Crear referencia en Firebase Storage
                // Subir la foto de la publicación a Firebase Storage
                await uploadBytes(fotoRef, archivoFoto);
                urlFoto = await getDownloadURL(fotoRef); // Obtener la URL de la foto subida
            }

            // Guardar la publicación con o sin imagen en Firestore
            await addDoc(collection(db, "publicaciones"), {
                texto: nuevaPublicacion.value, // Texto de la publicación
                userId: idUsuario, // ID del usuario que publica
                userName: auth.currentUser.displayName, // Nombre del usuario que publica
                photoURL: auth.currentUser.photoURL, // Foto de perfil del usuario que publica
                imagenPublicacion: urlFoto, // URL de la imagen de la publicación (si existe)
                timestamp: new Date() // Fecha y hora de la publicación
            });
            nuevaPublicacion.value = "";  // Limpiar el área de texto
            fotoPublicacion.value = "";  // Limpiar el input de imagen

            // llamar a la funcion
            cargarPublicaciones();
        } catch (error) {
            console.log("Error al publicar: ", error); // Manejar errores al publicar
        }
    } else {
        console.log("El campo de publicación está vacío."); // Mensaje si el campo está vacío
    }
});

// Cargar todas las publicaciones, incluyendo imágenes
async function cargarPublicaciones() {
    publicacionesDiv.innerHTML = ""; // Limpiar publicaciones previas
    const consulta = await getDocs(collection(db, "publicaciones")); // Obtener todas las publicaciones

    consulta.forEach((doc) => {
        const publicacion = doc.data(); // Datos de la publicación        
        const publicacionDiv = document.createElement("div"); // Crear un nuevo div para la publicación
        publicacionDiv.classList.add("publicacion"); // Agregar clase a la publicación

        // Convertir Timestamp a una fecha legible
        const fechaPublicacion = publicacion.timestamp.toDate();
        const horaPublicacion = fechaPublicacion.toLocaleTimeString();
        const fechaFormateada = fechaPublicacion.toLocaleDateString();

        // Asignar la foto de perfil con if...else
        let fotoPerfil = publicacion.photoURL || "user.jpg";

        // Contenido de la publicación, incluyendo imagen si existe
        let contenido = `
            <img src=${fotoPerfil} width="40" heigth="40">
            <p><strong>${publicacion.userName}:</strong> ${publicacion.texto}</p>
            <p>${fechaFormateada} ${horaPublicacion}</p>
        `;
        // Agregar imagen de la publicación si existe
        if (publicacion.imagenPublicacion) {
            contenido += `<img src="${publicacion.imagenPublicacion}" width="200" height="200">`;
        }

        // Mostrar botones solo si es el autor de la publicación
        if (publicacion.userId === idUsuario) {
            contenido += `
                <button onclick="abrirModal('${doc.id}', '${publicacion.texto}')">Editar</button>
                <button onclick="eliminarPublicacion('${doc.id}')">Eliminar</button>
            `;
        }
        publicacionDiv.innerHTML = contenido; // Asignar contenido al div
        publicacionesDiv.appendChild(publicacionDiv); // Agregar la publicación al contenedor
    });
}
cargarPublicaciones();

// Función para abrir el modal de edición
window.abrirModal = function (id, texto) {
    console.log("modal");
    idActualEdicion = id; // Almacenar el ID de la publicación que se va a editar
    nuevoTexto.value = texto; // Colocar el texto actual en el área de texto del modal
    modalEditar.show(); // Mostrar el modal
};

// Guardar cambios en la publicación editada
document.getElementById("guardarCambios").addEventListener("click", async () => {
    if (nuevoTexto.value.trim() !== "") { // Verificar que el campo no esté vacío
        try {
            await updateDoc(doc(db, "publicaciones", idActualEdicion), {
                texto: nuevoTexto.value // Actualizar el texto de la publicación
            });
            modalEditar.hide(); // Ocultar el modal
            cargarPublicaciones(); // Recargar publicaciones
        } catch (error) {
            console.log("Error al editar publicación: ", error); // Manejar errores al editar
        }
    }
});

// Función para eliminar publicación
window.eliminarPublicacion = async function (id) {
    try {
        await deleteDoc(doc(db, "publicaciones", id)); // Eliminar la publicación
        cargarPublicaciones(); // Recargar publicaciones
    } catch (error) {
        console.log("Error al eliminar publicación: ", error); // Manejar errores al eliminar
    }
};

// Actualizar perfil (nombre y foto)
guardarPerfilBtn.addEventListener("click", async () => {
    let user = auth.currentUser; // Usuario autenticado
    let updates = {};
    // Si el nombre ha sido actualizado
    if (nuevoNombre.value.trim() !== "") {
        updates.displayName = nuevoNombre.value;
    }
    // Si se seleccionó una nueva foto
    if (nuevaFoto.files.length > 0) {
        const archivoFoto = nuevaFoto.files[0];
        const fotoRef = ref(storage, 'foto_perfiles/' + user.uid); // Referencia al storage en Firebase
        // Subir la nueva foto de perfil a Firebase Storage
        await uploadBytes(fotoRef, archivoFoto);
        const urlFoto = await getDownloadURL(fotoRef); // Obtener la URL de la foto subida
        updates.photoURL = urlFoto;
    }
    // Aplicar las actualizaciones al perfil del usuario
    await updateProfile(user, updates);
    // Actualizar la interfaz con los nuevos datos
    if (updates.displayName) {
        displayName.textContent = updates.displayName;
    }
    if (updates.photoURL) {
        document.getElementById("fotoPerfil").src = updates.photoURL;
    }
    // Limpiar los campos del formulario
    nuevoNombre.value = "";
    nuevaFoto.value = "";
    // Cerrar el modal
    let actualizarModal = bootstrap.Modal.getInstance(document.getElementById('actualizarModal'));
    actualizarModal.hide();
});

