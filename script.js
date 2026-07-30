let TOKEN = localStorage.getItem("deskbot_token") || sessionStorage.getItem("deskbot_token");

function afficherLogin() {
    document.getElementById("popup-login").style.display = "flex";
}

function seConnecter() {
    const motDePasse = document.getElementById("mot-de-passe").value;
    const seSouvenir = document.getElementById("checkbox-se-souvenir").checked;

    fetch("https://api.gogekko.fr/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mot_de_passe: motDePasse })
    })
    .then(r => r.json())
    .then(data => {
        if (data.succes) {
            TOKEN = data.token;
            if (seSouvenir) {
                localStorage.setItem("deskbot_token", TOKEN);
            } else {
                sessionStorage.setItem("deskbot_token", TOKEN);
            }
            document.getElementById("popup-login").style.display = "none";
            chargerChronometre();
        } else {
            document.getElementById("erreur-login").textContent = "Mot de passe incorrect.";
        }
    });
}

if (!TOKEN) {
    afficherLogin();
}

function envoyerCommande() {
    const commande = document.getElementById("commande").value;

    fetch("https://api.gogekko.fr/commande", {        
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },
        body: JSON.stringify({
            texte: commande
        })
    })
    .then(r => r.json())
    .then(data => {

        document.getElementById("reponse").textContent =
            "Réponse: " + data.reponse;

        chargerChronometre();   // <-- ICI
    });
}

function envoyerCommandePrédéfinie(commande) {
    fetch("https://api.gogekko.fr/commande", {        
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },
        body: JSON.stringify({
            texte: (commande)
        })
    })
    .then(r => r.json())
    .then(data => {

        document.getElementById("reponse").textContent =
            "Réponse: " + data.reponse;

        chargerChronometre();

    });
}

function ouvrirMusique(){
    document.getElementById("popup-musique").style.display="flex";
}

function fermerMusique(){
    document.getElementById("popup-musique").style.display="none";
}

function definirVolume(){
    const volume = document.getElementById("input-volume").value

    envoyerCommandePrédéfinie("mets le volume à " + volume)
}

function ouvrirMeteo(){
    document.getElementById("popup-meteo").style.display="flex";
}

function fermerMeteo(){
    document.getElementById("popup-meteo").style.display="none";
}

function envoyerMeteo() {
    const ville = document.getElementById("ville").value;
    const date = document.getElementById("date").value;

    fetch("https://api.gogekko.fr/commande", {        
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },
        body: JSON.stringify({
            texte: "quelle est la météo à " + ville + " " + date
        })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById("reponse").textContent = "Réponse: " + data.reponse;
    });
}

let departChrono = null;
let chronoActif = false;
let pauseTotale = 0;
let tempsPause = null;
let enMarche = false;
let enPause = false;
let secondes = 0;

function chargerChronometre() {

    fetch("https://api.gogekko.fr/chronometre", {
        headers: { "Authorization": "Bearer " + TOKEN }
    })
        .then(response => response.json())
        .then(data => {

            departChrono = data.depart;
            pauseTotale = data.pause_totale;
            tempsPause = data.temps_pause;
            enMarche = data.en_marche;
            enPause = data.en_pause;
            secondes = data.secondes;

            const bouton = document.getElementById("PausePlay");

            if (enPause) {
                bouton.src = "img/play.svg";
            } else {
                bouton.src = "img/pause.svg";
            }

        });
}

chargerChronometre();


setInterval(() => {

    if (enMarche && !enPause) {
        secondes++;
    }

    let minutes = Math.floor(secondes / 60);
    let secondesRestantes = secondes % 60;

    document.getElementById("chrono").textContent =
        `Chronomètre : ${minutes} min ${secondesRestantes} sec`;

}, 1000);

function PausePlayChrono() {

    let commande;

    if (enPause) {
        commande = "reprends le chronomètre";
    } else {
        commande = "pause le chronomètre";
    }

    fetch("https://api.gogekko.fr/commande", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },
        body: JSON.stringify({
            texte: commande
        })
    })
    .then(r => r.json())
    .then(data => {

        document.getElementById("reponse").textContent =
            "Réponse : " + data.reponse;

        chargerChronometre();

    });
}

function StopChrono() {
    envoyerCommandePrédéfinie("stop le chronomètre")
}

function RepeatChrono() {
    envoyerCommandePrédéfinie("remets le chronomètre à zéro");
}

function GoChrono() {
    envoyerCommandePrédéfinie("démarre le chronomètre")
}

document.getElementById("commande").addEventListener("keydown", (event) => {
    if (event.key === "Enter") envoyerCommande();
});

function ouvrirMinuteur() {
    document.getElementById("popup-set-minuteur").style.display = "flex";
}

function fermerMinuteur() {
    document.getElementById("popup-set-minuteur").style.display = "none";
}

function SetMinuteur() {
    ouvrirMinuteur();
}

function ajusterMinuteur(unite, delta) {
    const champ = document.getElementById(unite === "minutes" ? "minuteur-minutes" : "minuteur-secondes");
    let valeur = parseInt(champ.value, 10) || 0;
    valeur += delta;

    if (valeur < 0) valeur = 0;
    if (unite === "secondes" && valeur > 59) valeur = 59;

    champ.value = valeur;
}

function demarrerMinuteurDepuisPopup() {
    const minutes = parseInt(document.getElementById("minuteur-minutes").value, 10) || 0;
    const secondes = parseInt(document.getElementById("minuteur-secondes").value, 10) || 0;

    envoyerCommandePrédéfinie(`démarre un minuteur de ${minutes} minutes et ${secondes} secondes`);
    fermerMinuteur();
    setTimeout(chargerMinuteur, 300);  // laisse le temps au serveur de traiter la commande
}

let enMarcheMinuteur = false;
let enPauseMinuteur = false;
let secondesMinuteur = 0;
let notificationEnvoyee = false;
let minuteurActifPrecedent = false;

function afficherMinuteur() {
    let minutes = Math.floor(secondesMinuteur / 60);
    let secondesRestantes = secondesMinuteur % 60;
    document.getElementById("minuteur-texte").textContent =
        `Minuteur : ${minutes} min ${secondesRestantes} sec`;
}

function chargerMinuteur() {
    fetch("https://api.gogekko.fr/minuteur", {
        headers: { "Authorization": "Bearer " + TOKEN }
    })
        .then(response => response.json())
        .then(data => {

            const nouveauDemarrage = data.actif && !minuteurActifPrecedent;
            minuteurActifPrecedent = data.actif;

            enMarcheMinuteur = data.actif;
            enPauseMinuteur = data.en_pause;
            secondesMinuteur = data.secondes;

            if (nouveauDemarrage) {
                notificationEnvoyee = false;
            }

            const bouton = document.getElementById("PausePlayMinuteur");
            bouton.src = enPauseMinuteur ? "img/play.svg" : "img/pause.svg";

            afficherMinuteur();
        });
}

chargerMinuteur();

if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

setInterval(() => {

    if (enMarcheMinuteur && !enPauseMinuteur) {
        if (secondesMinuteur > 0) {
            secondesMinuteur--;
        } else if (!notificationEnvoyee) {
            notificationEnvoyee = true;
            enMarcheMinuteur = false;

            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("🔔 Minuteur terminé");
            } else {
                document.getElementById("reponse").textContent = "🔔 Minuteur terminé";
            }
        }
    }

    afficherMinuteur();

}, 1000);

// Petite synchronisation périodique avec le serveur, utile si le minuteur
// est démarré ou arrêté à la voix pendant que le site reste ouvert
setInterval(chargerMinuteur, 5000);

function PausePlayMinuteur() {

    let commande = enPauseMinuteur ? "reprends le minuteur" : "pause le minuteur";

    fetch("https://api.gogekko.fr/commande", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },
        body: JSON.stringify({ texte: commande })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById("reponse").textContent = "Réponse : " + data.reponse;
        chargerMinuteur();
    });
}

function RepeatMinuteur() {
    envoyerCommandePrédéfinie("arrête le minuteur");
    chargerMinuteur();
}

window.onclick = function(event) {
    const popups = ["popup-musique", "popup-meteo", "popup-set-minuteur"];

    for (const id of popups) {
        const popup = document.getElementById(id);
        if (event.target === popup) {
            popup.style.display = "none";
        }
    }
};