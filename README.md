# TP 8 : Téléversement de fichiers avec Multer et Express.js 🚀

Ce projet est une application web complète démontrant comment gérer le téléversement (upload) de fichiers en utilisant **Node.js**, **Express.js** et le middleware **Multer**.

## 📑 Fonctionnalités implémentées

L'application propose trois types de formulaires de téléversement :
1. **Upload simple :** Envoi d'une seule image.
2. **Upload multiple :** Envoi de plusieurs images simultanément (limité à 5 fichiers).
3. **Upload avec métadonnées :** Envoi mixte combinant des champs de texte (Titre, Description) et plusieurs champs de fichiers (Image principale et Galerie).

### 🛡️ Sécurité et limitations
- **Filtrage par type MIME et extension :** Seules les images (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.jfif`) sont acceptées.
- **Limitation de taille :** Chaque fichier est limité à un maximum de **5 Mo**.
- **Gestion des erreurs :** Nettoyage automatique (`fs.unlink`) des fichiers temporaires stockés sur le serveur en cas d'erreur de validation.
- **Messages personnalisés :** Retours clairs à l'utilisateur (ex: "Fichier trop volumineux", "Trop de fichiers", "Extension non autorisée").

---

## 🛠️ Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/) (version 14 ou supérieure recommandée)
- npm (gestionnaire de paquets Node)

---

## 🚀 Installation et exécution

1. **Cloner ou télécharger le projet** puis ouvrir un terminal dans le dossier racine (`express-upload-demo`).

2. **Installer les dépendances :**
   ```bash
   npm install

   ```
   3. **Démarrer le serveur :**
      ```
      npm start
      ```

     4.**Accéder à l'application** :
Ouvrez votre navigateur web et allez à l'adresse :
```
 http://localhost:3000

```
## 📂 Structure du projet

```
express-upload-demo/
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── uploads/
├── views/
│   ├── index.html
│   └── success.html
├── server.js
└── package.json


```
 ##  Démo du Projet






https://github.com/user-attachments/assets/4a28a520-d2d7-4fa3-b740-bd8cea9cb898





## 👤 Auteur

* **École Normale Supérieure de Marrakech**
  
* **Réalisé par :** SALMA LAKHAL
  
* **Filière  :** CLE_INFO_S5

  
* **Encadré par :** Pr. Mohamed LACHGAR

* **Cours :** `Développement web full-stack avec JavaScript`

   
