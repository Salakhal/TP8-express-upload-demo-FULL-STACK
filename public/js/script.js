document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Empêche le rechargement de la page
    
    const fileInput = document.getElementById('ajaxFichier');
    const file = fileInput.files[0];
    const messageDiv = document.getElementById('message');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('upload-progress');
    const progressText = document.getElementById('progress-text');

    if (!file) return;

    // --- Validation Côté Client ---
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        messageDiv.style.color = 'red';
        messageDiv.innerText = "Erreur : Seules les images sont autorisées.";
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // Limite de 5 Mo
        messageDiv.style.color = 'red';
        messageDiv.innerText = "Erreur : Le fichier dépasse la taille maximale autorisée de 5 Mo.";
        return;
    }

    // --- Upload avec XMLHttpRequest (Barre de progression) ---
    const formData = new FormData();
    formData.append('fichier', file);
    
    progressContainer.style.display = 'block';
    messageDiv.innerText = '';
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);
    
    // Suivi de la progression
    xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            progressBar.value = percentComplete;
            progressText.innerText = percentComplete + '%';
        }
    };

    // Réponse du serveur
    xhr.onload = function() {
        if (xhr.status === 200) {
            messageDiv.style.color = 'green';
            messageDiv.innerHTML = "Téléversement réussi !";
        } else {
            messageDiv.style.color = 'red';
            messageDiv.innerHTML = "Erreur lors du téléversement.";
        }
    };
    
    xhr.send(formData);
});
