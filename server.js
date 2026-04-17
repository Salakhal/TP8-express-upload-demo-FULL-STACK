// Importation des modules nécessaires
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Assurez-vous que le dossier uploads existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuration du stockage sur disque avec Multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

// Configuration du filtrage des fichiers
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.jfif', '.png', '.gif', '.webp'];    
    
    if (allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error(`L'extension ${extension} n'est pas autorisée. Utilisez jpg, jpeg, png, gif ou webp.`), false);
    }
  } else {
    cb(new Error(`Le type de fichier ${file.mimetype} n'est pas autorisé. Utilisez uniquement des images.`), false);
  }
};

// Fonction pour nettoyer les fichiers en cas d'erreur (Sécurisée)
function cleanupFiles(files) {
  if (files && typeof files === 'object' && !Array.isArray(files)) {
    Object.keys(files).forEach(key => {
      files[key].forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlink(file.path, (err) => {
            if (err) console.error(`Erreur suppression ${file.path}:`, err);
          });
        }
      });
    });
  } else if (Array.isArray(files)) {
    files.forEach(file => {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlink(file.path, (err) => {
          if (err) console.error(`Erreur suppression ${file.path}:`, err);
        });
      }
    });
  } else if (files && files.path) {
    if (fs.existsSync(files.path)) {
      fs.unlink(files.path, (err) => {
        if (err) console.error(`Erreur suppression ${files.path}:`, err);
      });
    }
  }
}

// Initialisation de Multer avec stockage, filtrage et limites
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo en octets
   
  }
});

// Configuration pour les champs mixtes
const uploadMixed = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'galerie', maxCount: 2 }
]);

// Configuration des middlewares
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route pour gérer le téléversement d'un fichier unique
app.post('/upload', upload.single('fichier'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Aucun fichier n\'a été téléversé.');
  }
  
  res.send(`
    <h1>Fichier téléversé avec succès!</h1>
    <p>Nom original: ${req.file.originalname}</p>
    <p>Taille: ${req.file.size} octets</p>
    <p>Type: ${req.file.mimetype}</p>
    <p><img src="/uploads/${req.file.filename}" alt="Image téléversée" style="max-width: 500px;"></p>
    <p><a href="/">Retour à l'accueil</a></p>
  `);
}, (err, req, res, next) => {
  if (req.file) cleanupFiles(req.file);
  
  let message = err.message;
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = `Le fichier est trop volumineux. La taille maximale autorisée est de 5 Mo.`;
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = `Trop de fichiers téléversés ou nom de champ incorrect.`;
  }
  
  res.status(400).send(`
    <h1>Erreur lors du téléversement</h1>
    <p>${message}</p>
    <p><a href="/">Retour à l'accueil</a></p>
  `);
});

// Route pour gérer le téléversement de plusieurs fichiers (Limite passée à 5 fichiers)
app.post('/upload-multiple', upload.array('fichiers', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('Aucun fichier n\'a été téléversé.');
  }
  
  const fileList = req.files.map(file => {
    return `
      <li>
        ${file.originalname} (${file.size} octets)<br>
        <img src="/uploads/${file.filename}" alt="${file.originalname}" style="max-width: 300px; margin: 10px 0;">
      </li>
    `;
  }).join('');
  
  res.send(`
    <h1>Fichiers téléversés avec succès!</h1>
    <p>Nombre de fichiers: ${req.files.length}</p>
    <ul style="list-style-type: none; padding: 0;">${fileList}</ul>
    <p><a href="/">Retour à l'accueil</a></p>
  `);
}, (err, req, res, next) => {
  if (req.files) cleanupFiles(req.files);
  
  let message = err.message;
  
  // Prise en charge des deux codes d'erreur possibles pour "Too many files"
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = `Un des fichiers est trop volumineux. La taille maximale autorisée est de 5 Mo.`;
  } else if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = `Vous avez sélectionné trop de fichiers. Maximum 5 fichiers autorisés.`;
  }
  
  res.status(400).send(`
    <h1>Erreur lors du téléversement multiple</h1>
    <p>${message}</p>
    <p><a href="/">Retour à l'accueil</a></p>
  `);
});

// Route pour gérer le téléversement avec champs mixtes
app.post('/upload-with-data', uploadMixed, (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).send('L\'image principale est requise.');
  }
  
  const titre = req.body.titre || 'Sans titre';
  const description = req.body.description || 'Aucune description';
  const mainImage = req.files.image[0];
  const galerieImages = req.files.galerie || [];
  
  let galerieHtml = '';
  if (galerieImages.length > 0) {
    const imagesList = galerieImages.map(img => {
      return `
        <div class="gallery-item">
          <img src="/uploads/${img.filename}" alt="${img.originalname}" style="max-width: 300px;">
          <p>${img.originalname} (${img.size} octets)</p>
        </div>
      `;
    }).join('');
    galerieHtml = `
      <h3>Images supplémentaires:</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 20px;">${imagesList}</div>
    `;
  }
  
  res.send(`
    <h1>${titre}</h1>
    <p>${description}</p>
    <h3>Image principale:</h3>
    <p><img src="/uploads/${mainImage.filename}" alt="${titre}" style="max-width: 500px;"></p>
    ${galerieHtml}
    <p><a href="/">Retour à l'accueil</a></p>
  `);
}, (err, req, res, next) => {
  if (req.files) cleanupFiles(req.files);
  
  let message = err.message;
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = `Un des fichiers est trop volumineux. La taille maximale autorisée est de 5 Mo.`;
  } else if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = `Vous avez sélectionné trop de fichiers pour un des champs.`;
  }
  
  res.status(400).send(`
    <h1>Erreur lors du téléversement</h1>
    <p>${message}</p>
    <p><a href="/">Retour à l'accueil</a></p>
  `);
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});