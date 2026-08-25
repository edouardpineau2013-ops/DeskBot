/* =========================================================
   DESKBOT - YOUTUBE
   site/youtube.js
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const YOUTUBE_API_BASE = "https://deskbot-q7ce.onrender.com/youtube";


let videosAccueil = [];
let videosRecherche = [];
let videosSimilaires = [];

let videoActuelle = null;

let filtreAccueil = "tous";

let playerYoutube = null;

let youtubeApiChargee = false;

let chargementAccueilEnCours = false;


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initialiserYouTube();

});


function initialiserYouTube() {

    initialiserNavigation();

    initialiserRecherche();

    initialiserFiltres();

    initialiserBoutons();

    initialiserPopup();

    chargerAbonnementsSidebar();

    chargerAccueil();

    chargerAPIYouTube();

}


/* =========================================================
   API YOUTUBE IFRAME
   ========================================================= */

function chargerAPIYouTube() {

    if (window.YT && window.YT.Player) {

        youtubeApiChargee = true;

        return;

    }

    const script = document.createElement("script");

    script.src = "https://www.youtube.com/iframe_api";

    script.async = true;

    document.head.appendChild(script);

}


window.onYouTubeIframeAPIReady = function () {

    youtubeApiChargee = true;

};


/* =========================================================
   NAVIGATION
   ========================================================= */

function initialiserNavigation() {

    const navAccueil =
        document.getElementById("nav-accueil");

    const navAbonnements =
        document.getElementById("nav-abonnements");

    const navRecherche =
        document.getElementById("nav-recherche");

    const headerAccueil =
        document.getElementById("bouton-accueil-header");

    const headerAbonnements =
        document.getElementById("bouton-abonnements-header");

    if (navAccueil) {

        navAccueil.addEventListener(
            "click",
            () => afficherPage("accueil")
        );

    }

    if (navAbonnements) {

        navAbonnements.addEventListener(
            "click",
            () => {

                afficherPage("abonnements");

                chargerAbonnements();

            }
        );

    }

    if (navRecherche) {

        navRecherche.addEventListener(
            "click",
            () => {

                afficherPage("recherche");

                const recherche =
                    document.getElementById(
                        "recherche-youtube"
                    );

                if (recherche) {
                    recherche.focus();
                }

            }
        );

    }

    if (headerAccueil) {

        headerAccueil.addEventListener(
            "click",
            () => afficherPage("accueil")
        );

    }

    if (headerAbonnements) {

        headerAbonnements.addEventListener(
            "click",
            () => {

                afficherPage("abonnements");

                chargerAbonnements();

            }
        );

    }

}


function afficherPage(page) {

    const pages = {

        accueil:
            document.getElementById("page-accueil"),

        recherche:
            document.getElementById("page-recherche"),

        abonnements:
            document.getElementById("page-abonnements"),

        video:
            document.getElementById("page-video")

    };


    Object.entries(pages).forEach(
        ([nom, element]) => {

            if (!element) {
                return;
            }

            const afficher =
                nom === page;

            element.hidden = !afficher;

            element.classList.toggle(
                "active",
                afficher
            );

        }
    );


    const boutons = {

        accueil:
            document.getElementById("nav-accueil"),

        abonnements:
            document.getElementById("nav-abonnements"),

        recherche:
            document.getElementById("nav-recherche")

    };


    Object.entries(boutons).forEach(
        ([nom, bouton]) => {

            if (!bouton) {
                return;
            }

            bouton.classList.toggle(
                "active",
                nom === page
            );

        }
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   RECHERCHE
   ========================================================= */

function initialiserRecherche() {

    const formulaire =
        document.getElementById(
            "formulaire-recherche-youtube"
        );

    if (!formulaire) {
        return;
    }

    formulaire.addEventListener(
        "submit",
        evenement => {

            evenement.preventDefault();

            const input =
                document.getElementById(
                    "recherche-youtube"
                );

            if (!input) {
                return;
            }

            const recherche =
                input.value.trim();

            if (!recherche) {
                return;
            }

            effectuerRecherche(recherche);

        }
    );

}


async function effectuerRecherche(recherche) {

    afficherPage("recherche");

    const chargement =
        document.getElementById(
            "recherche-chargement"
        );

    const grille =
        document.getElementById(
            "grille-recherche"
        );

    const vide =
        document.getElementById(
            "recherche-vide"
        );

    const texte =
        document.getElementById(
            "texte-recherche"
        );


    if (chargement) {
        chargement.hidden = false;
    }

    if (vide) {
        vide.hidden = true;
    }

    if (grille) {
        grille.innerHTML = "";
    }

    if (texte) {

        texte.textContent =
            `Résultats pour « ${recherche} »`;

    }


    try {

        const response =
            await fetch(
                `${YOUTUBE_API_BASE}/rechercher?q=${encodeURIComponent(recherche)}`
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Impossible d'effectuer la recherche."
            );

        }


        videosRecherche =
            data.videos || [];

        fermerPopup();

        afficherVideos(
            videosRecherche,
            grille
        );


        if (
            videosRecherche.length === 0 &&
            vide
        ) {

            vide.hidden = false;

        }

    }

    catch (erreur) {

        console.error(
            "Erreur recherche YouTube :",
            erreur
        );

        afficherErreur(
            erreur.message
        );

    }

    finally {

        if (chargement) {
            chargement.hidden = true;
        }

    }

}


/* =========================================================
   ACCUEIL
   ========================================================= */

async function chargerAccueil() {

    if (chargementAccueilEnCours) {
        console.warn(
            "⚠️ Chargement YouTube déjà en cours."
        );
        return;
    }

    chargementAccueilEnCours = true;

    const chargement =
        document.getElementById(
            "accueil-chargement"
        );

    const grille =
        document.getElementById(
            "grille-accueil"
        );

    const vide =
        document.getElementById(
            "accueil-vide"
        );

    if (chargement) {
        chargement.hidden = false;
    }

    if (vide) {
        vide.hidden = true;
    }

    if (grille) {
        grille.innerHTML = "";
    }

    try {

        const response =
            await fetch(
                `${YOUTUBE_API_BASE}/recommandations?nombre=24`
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error ||
                "Impossible de charger les recommandations."
            );
        }

        videosAccueil =
            data.videos || [];

        console.log(
            "📥 videosAccueil :",
            videosAccueil
        );

        console.log(
            "📥 Nombre avant filtre :",
            videosAccueil.length
        );

        /*
         * Les vidéos ont bien été récupérées.
         * On ferme immédiatement toute ancienne erreur.
         */
        fermerPopup();

        appliquerFiltreAccueil();

        /*
         * Vérification après affichage.
         * Si des cartes sont présentes, le chargement
         * est considéré comme réussi.
         */
        const nombreCartes =
            grille
                ? grille.querySelectorAll(
                    ".youtube-video-card"
                ).length
                : 0;

        console.log(
            "📺 Nombre de cartes affichées :",
            nombreCartes
        );

        if (
            nombreCartes > 0
        ) {

            if (vide) {
                vide.hidden = true;
            }

            if (chargement) {
                chargement.hidden = true;
            }

            return;
        }

        /*
         * La requête a fonctionné mais aucune vidéo
         * n'a réellement été affichée.
         */
        if (vide) {
            vide.hidden = false;
        }

    }
    catch (erreur) {

        console.error(
            "Erreur recommandations YouTube :",
            erreur
        );

        /*
         * IMPORTANT :
         * Si des vidéos sont déjà affichées, ce n'est
         * PAS une erreur pour l'utilisateur.
         */
        const nombreCartes =
            grille
                ? grille.querySelectorAll(
                    ".youtube-video-card"
                ).length
                : 0;

        if (
            nombreCartes > 0
        ) {

            console.warn(
                "⚠️ Une requête YouTube a échoué, mais des vidéos sont déjà affichées."
            );

            if (vide) {
                vide.hidden = true;
            }

            fermerPopup();

        }
        else {

            if (vide) {
                vide.hidden = false;
            }

            /*
             * Afficher l'erreur uniquement si aucune vidéo
             * n'est disponible.
             */
            afficherErreur(
                erreur.message
            );

        }

    }
    finally {

        chargementAccueilEnCours = false;

        if (chargement) {
            chargement.hidden = true;
        }

    }

}


/* =========================================================
   FILTRES
   ========================================================= */

function initialiserFiltres() {

    const filtres =
        document.querySelectorAll(
            ".youtube-filter"
        );


    filtres.forEach(
        filtre => {

            filtre.addEventListener(
                "click",
                () => {

                    filtres.forEach(
                        autre => {

                            autre.classList.remove(
                                "active"
                            );

                        }
                    );


                    filtre.classList.add(
                        "active"
                    );


                    filtreAccueil =
                        filtre.dataset.filtre ||
                        "tous";


                    appliquerFiltreAccueil();

                }
            );

        }
    );

}


function appliquerFiltreAccueil() {

    let videos = [...videosAccueil];

    if (
        filtreAccueil === "abonnement"
    ) {

        videos =
            videos.filter(
                video =>
                    video.source ===
                    "abonnement"
            );

    }

    /*
     * Le filtre "general" ne doit plus
     * supprimer les vidéos des abonnements.
     *
     * Les recommandations actuelles
     * proviennent du RSS des abonnements.
     */

    if (
        filtreAccueil === "general"
    ) {

        videos =
            [...videosAccueil];

    }

    const grille =
        document.getElementById(
            "grille-accueil"
        );

    if (!grille) {

        console.error(
            "❌ Grille accueil introuvable."
        );

        return;
    }

    afficherVideos(
        videos,
        grille
    );
}


/* =========================================================
   AFFICHAGE DES VIDÉOS
   ========================================================= */

function afficherVideos(videos, conteneur) {

    if (!conteneur) {
        console.error(
            "❌ Conteneur introuvable"
        );
        return;
    }

    conteneur.innerHTML = "";

    videos.forEach(
        video => {

            const carte =
                creerCarteVideo(video);

            if (carte) {
                conteneur.appendChild(carte);
            }

        }
    );
}


function creerCarteVideo(video) {

    if (!video || !video.id) {
        console.warn("Vidéo invalide :", video);
        return null;
    }

    const carte =
        document.createElement("article");

    carte.className =
        "youtube-video-card";

    // =====================================================
    // MINIATURE
    // =====================================================

    const thumbnailContainer =
        document.createElement("div");

    thumbnailContainer.className =
        "youtube-thumbnail-container";

    const image =
        document.createElement("img");

    image.className =
        "youtube-thumbnail";

    image.src =
        video.miniature ||
        `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

    image.alt =
        video.titre ||
        "Miniature vidéo";

    image.loading =
        "lazy";

    image.onerror = function () {

        console.warn(
            "Impossible de charger la miniature :",
            this.src
        );

        this.src =
            `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;

        this.onerror = null;
    };

    const play =
        document.createElement("div");

    play.className =
        "youtube-thumbnail-play";

    play.textContent =
        "▶";

    thumbnailContainer.appendChild(
        image
    );

    thumbnailContainer.appendChild(
        play
    );

    // =====================================================
    // BADGE ABONNEMENT
    // =====================================================

    if (
        video.source ===
        "abonnement"
    ) {

        const badge =
            document.createElement("span");

        badge.className =
            "youtube-video-badge";

        badge.textContent =
            "Abonnement";

        thumbnailContainer.appendChild(
            badge
        );
    }

    // =====================================================
    // INFORMATIONS
    // =====================================================

    const information =
        document.createElement("div");

    information.className =
        "youtube-video-card-information";

    // =====================================================
    // AVATAR
    // =====================================================

    const avatar =
        document.createElement("div");

    avatar.className =
        "youtube-video-card-channel-avatar";

    if (video.avatar) {

        const avatarImage =
            document.createElement("img");

        avatarImage.src =
            video.avatar;

        avatarImage.alt =
            "";

        avatarImage.onerror =
            function () {

                this.style.display =
                    "none";

            };

        avatar.appendChild(
            avatarImage
        );

    }
    else {

        avatar.textContent =
            "▶";

    }

    // =====================================================
    // TEXTE
    // =====================================================

    const text =
        document.createElement("div");

    text.className =
        "youtube-video-card-text";

    const titre =
        document.createElement("div");

    titre.className =
        "youtube-video-card-title";

    titre.textContent =
        video.titre ||
        "Vidéo sans titre";

    const chaine =
        document.createElement("div");

    chaine.className =
        "youtube-video-card-channel";

    chaine.textContent =
        video.chaine ||
        "Chaîne inconnue";

    const date =
        document.createElement("div");

    date.className =
        "youtube-video-card-date";

    if (video.date) {

        try {

            date.textContent =
                formaterDate(
                    video.date
                );

        }
        catch (erreur) {

            console.warn(
                "Erreur formatage date :",
                erreur
            );

            date.textContent =
                video.date;

        }

    }

    text.appendChild(
        titre
    );

    text.appendChild(
        chaine
    );

    text.appendChild(
        date
    );

    information.appendChild(
        avatar
    );

    information.appendChild(
        text
    );

    // =====================================================
    // CARTE
    // =====================================================

    carte.appendChild(
        thumbnailContainer
    );

    carte.appendChild(
        information
    );

    // =====================================================
    // OUVERTURE DE LA VIDÉO
    // =====================================================

    carte.addEventListener(
        "click",
        function () {

            ouvrirVideo(
                video.id
            );

        }
    );

    return carte;
}


/* =========================================================
   OUVRIR UNE VIDÉO
   ========================================================= */

async function ouvrirVideo(videoId) {

    if (!videoId) {
        return;
    }


    afficherPage("video");


    const titre =
        document.getElementById(
            "video-titre"
        );

    const chaine =
        document.getElementById(
            "video-chaine"
        );

    const description =
        document.getElementById(
            "video-description"
        );

    const vues =
        document.getElementById(
            "video-vues"
        );

    const avatar =
        document.getElementById(
            "video-channel-avatar"
        );


    if (titre) {
        titre.textContent =
            "Chargement...";
    }

    if (chaine) {
        chaine.textContent =
            "Chargement...";
    }

    if (description) {
        description.textContent =
            "Chargement...";
    }

    if (vues) {
        vues.textContent =
            "Chargement...";
    }

    if (avatar) {
        avatar.innerHTML = "▶";
    }


    try {

        const response =
            await fetch(
                `${YOUTUBE_API_BASE}/video/${encodeURIComponent(videoId)}`
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Vidéo introuvable."
            );

        }


        videoActuelle =
            data.video;


        afficherInformationsVideo(
            videoActuelle
        );


        chargerLecteur(
            videoActuelle.id
        );


        chargerVideosSimilaires(
            videoActuelle
        );

    }

    catch (erreur) {

        console.error(
            "Erreur vidéo YouTube :",
            erreur
        );

        afficherErreur(
            erreur.message
        );

    }

}


/* =========================================================
   INFORMATIONS VIDÉO
   ========================================================= */

function afficherInformationsVideo(video) {

    const titre =
        document.getElementById(
            "video-titre"
        );

    const chaine =
        document.getElementById(
            "video-chaine"
        );

    const description =
        document.getElementById(
            "video-description"
        );

    const vues =
        document.getElementById(
            "video-vues"
        );

    const bouton =
        document.getElementById(
            "bouton-abonnement-video"
        );


    if (titre) {

        titre.textContent =
            nettoyerTexte(video.titre);

    }


    if (chaine) {

        chaine.textContent =
            nettoyerTexte(video.chaine);

    }


    if (description) {

        description.textContent =
            video.description ||
            "Aucune description.";

    }


    if (vues) {

        const nombreVues =
            formaterNombre(
                video.vues
            );

        vues.textContent =
            nombreVues ?
                `${nombreVues} vues` :
                "Vidéo YouTube";

    }


    mettreAJourBoutonAbonnementVideo();

}


/* =========================================================
   LECTEUR YOUTUBE
   ========================================================= */

function chargerLecteur(videoId) {

    const conteneur =
        document.getElementById(
            "youtube-player"
        );


    if (!conteneur) {
        return;
    }


    conteneur.innerHTML = "";


    if (
        window.YT &&
        window.YT.Player
    ) {

        creerLecteurYoutube(
            videoId
        );

        return;

    }


    let essais = 0;


    const attente =
        setInterval(
            () => {

                essais++;


                if (
                    window.YT &&
                    window.YT.Player
                ) {

                    clearInterval(
                        attente
                    );

                    creerLecteurYoutube(
                        videoId
                    );

                    return;

                }


                if (essais >= 50) {

                    clearInterval(
                        attente
                    );

                    afficherLecteurSecours(
                        videoId
                    );

                }

            },
            100
        );

}


function creerLecteurYoutube(videoId) {

    const conteneur =
        document.getElementById(
            "youtube-player"
        );


    if (!conteneur) {
        return;
    }


    conteneur.innerHTML = "";


    const element =
        document.createElement("div");

    element.id =
        "youtube-iframe-player";


    conteneur.appendChild(
        element
    );


    playerYoutube =
        new YT.Player(
            element.id,
            {
                videoId: videoId,

                playerVars: {
                    autoplay: 1,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1
                },

                events: {

                    onReady: evenement => {

                        try {

                            evenement.target.playVideo();

                        }
                        catch (erreur) {

                            console.warn(
                                "Lecture automatique impossible :",
                                erreur
                            );

                        }

                    }

                }

            }
        );

}


function afficherLecteurSecours(videoId) {

    const conteneur =
        document.getElementById(
            "youtube-player"
        );


    if (!conteneur) {
        return;
    }


    conteneur.innerHTML = "";


    const iframe =
        document.createElement("iframe");


    iframe.src =
        `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;


    iframe.title =
        "Lecteur YouTube";


    iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";


    iframe.allowFullscreen =
        true;


    conteneur.appendChild(
        iframe
    );

}


/* =========================================================
   VIDÉOS SIMILAIRES
   ========================================================= */

async function chargerVideosSimilaires(video) {

    const grille =
        document.getElementById(
            "grille-videos-similaires"
        );


    if (!grille || !video) {
        return;
    }


    grille.innerHTML = "";


    const recherche =
        video.chaine ||
        video.titre;


    try {

        const response =
            await fetch(
                `${YOUTUBE_API_BASE}/rechercher?q=${encodeURIComponent(recherche)}`
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {
            return;
        }


        videosSimilaires =
            (data.videos || [])
                .filter(
                    element =>
                        element.id !==
                        video.id
                )
                .slice(0, 8);


        afficherVideos(
            videosSimilaires,
            grille
        );

    }

    catch (erreur) {

        console.error(
            "Erreur vidéos similaires :",
            erreur
        );

    }

}


/* =========================================================
   ABONNEMENTS
   ========================================================= */

async function chargerAbonnements() {

    const grille =
        document.getElementById(
            "grille-abonnements"
        );

    const vide =
        document.getElementById(
            "abonnements-vide"
        );


    if (grille) {
        grille.innerHTML = "";
    }


    try {

        const response =
            await fetch(
                `${YOUTUBE_API_BASE}/abonnements`
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Impossible de charger les abonnements."
            );

        }


        const abonnements =
            data.abonnements || [];
        
        fermerPopup();

        if (
            abonnements.length === 0
        ) {

            if (vide) {
                vide.hidden = false;
            }

            return;

        }


        if (vide) {
            vide.hidden = true;
        }


        abonnements.forEach(
            abonnement => {

                const carte =
                    creerCarteAbonnement(
                        abonnement
                    );

                if (carte && grille) {

                    grille.appendChild(
                        carte
                    );

                }

            }
        );

    }

    catch (erreur) {

        console.error(
            "Erreur abonnements :",
            erreur
        );

        afficherErreur(
            erreur.message
        );

    }

}


function creerCarteAbonnement(
    abonnement
) {

    const carte =
        document.createElement("div");

    carte.className =
        "youtube-subscription-card";


    const avatar =
        document.createElement("div");

    avatar.className =
        "youtube-channel-avatar";

    avatar.textContent =
        "▶";


    const informations =
        document.createElement("div");

    informations.className =
        "youtube-channel-card-info";


    const nom =
        document.createElement("div");

    nom.className =
        "youtube-channel-card-name";

    nom.textContent =
        abonnement.nom ||
        "Chaîne inconnue";


    informations.appendChild(
        nom
    );


    const bouton =
        document.createElement("button");

    bouton.type =
        "button";

    bouton.className =
        "youtube-subscribe-button subscribed";

    bouton.textContent =
        "Abonné";


    bouton.addEventListener(
        "click",
        evenement => {

            evenement.stopPropagation();

            desabonner(
                abonnement.channel_id
            );

        }
    );


    carte.appendChild(
        avatar
    );

    carte.appendChild(
        informations
    );

    carte.appendChild(
        bouton
    );


    return carte;

}


/* =========================================================
   RECHERCHE DE CHAÎNES
   ========================================================= */

function initialiserBoutons() {

    const bouton =
        document.getElementById(
            "bouton-recherche-chaine"
        );

    const input =
        document.getElementById(
            "recherche-chaine"
        );


    if (bouton) {

        bouton.addEventListener(
            "click",
            rechercherChaines
        );

    }


    if (input) {

        input.addEventListener(
            "keydown",
            evenement => {

                if (
                    evenement.key ===
                    "Enter"
                ) {

                    evenement.preventDefault();

                    rechercherChaines();

                }

            }
        );

    }


    const actualiser =
        document.getElementById(
            "bouton-actualiser"
        );

    if (actualiser) {

        actualiser.addEventListener(
            "click",
            chargerAccueil
        );

    }


    const reessayer =
        document.getElementById(
            "bouton-reessayer"
        );

    if (reessayer) {

        reessayer.addEventListener(
            "click",
            chargerAccueil
        );

    }


    const retour =
        document.getElementById(
            "bouton-retour-video"
        );

    if (retour) {

        retour.addEventListener(
            "click",
            () => afficherPage("accueil")
        );

    }


    const menu =
        document.getElementById(
            "bouton-menu"
        );

    if (menu) {

        menu.addEventListener(
            "click",
            toggleSidebar
        );

    }

}


async function rechercherChaines() {

    const input =
        document.getElementById(
            "recherche-chaine"
        );

    const conteneur =
        document.getElementById(
            "resultats-chaines"
        );


    if (!input || !conteneur) {
        return;
    }


    const recherche =
        input.value.trim();


    if (!recherche) {
        return;
    }


    conteneur.innerHTML = `
        <div class="youtube-loading">
            <div class="youtube-spinner"></div>
            <p>Recherche des chaînes...</p>
        </div>
    `;


    try {

        const response =
            await fetch(
                `${YOUTUBE_API_BASE}/chaines?q=${encodeURIComponent(recherche)}`
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Recherche impossible."
            );

        }


        conteneur.innerHTML = "";


        const chaines =
            data.chaines || [];


        chaines.forEach(
            chaine => {

                const carte =
                    creerCarteChaine(
                        chaine
                    );

                conteneur.appendChild(
                    carte
                );

            }
        );

    }

    catch (erreur) {

        console.error(
            "Erreur recherche chaînes :",
            erreur
        );

        conteneur.innerHTML = "";

        afficherErreur(
            erreur.message
        );

    }

}


function creerCarteChaine(chaine) {

    const carte =
        document.createElement("div");

    carte.className =
        "youtube-channel-card";


    const avatar =
        document.createElement("div");

    avatar.className =
        "youtube-channel-avatar";


    if (chaine.avatar) {

        const image =
            document.createElement("img");

        image.src =
            chaine.avatar;

        image.alt =
            "";

        avatar.appendChild(
            image
        );

    }
    else {

        avatar.textContent =
            "▶";

    }


    const informations =
        document.createElement("div");

    informations.className =
        "youtube-channel-card-info";


    const nom =
        document.createElement("div");

    nom.className =
        "youtube-channel-card-name";

    nom.textContent =
        nettoyerTexte(
            chaine.nom
        );


    const description =
        document.createElement("div");

    description.className =
        "youtube-channel-card-description";

    description.textContent =
        nettoyerTexte(
            chaine.description
        );


    informations.appendChild(
        nom
    );

    informations.appendChild(
        description
    );


    const bouton =
        document.createElement("button");

    bouton.type =
        "button";

    bouton.className =
        "youtube-subscribe-button";


    if (chaine.abonne) {

        bouton.classList.add(
            "subscribed"
        );

        bouton.textContent =
            "Abonné";

    }
    else {

        bouton.textContent =
            "S'abonner";

    }


    bouton.addEventListener(
        "click",
        () => {

            if (chaine.abonne) {

                desabonner(
                    chaine.channel_id
                );

            }
            else {

                abonner(
                    chaine.channel_id,
                    chaine.nom
                );

            }

        }
    );


    carte.appendChild(
        avatar
    );

    carte.appendChild(
        informations
    );

    carte.appendChild(
        bouton
    );


    return carte;

}


/* =========================================================
   S'ABONNER
   ========================================================= */

async function abonner(
    channelId,
    nom
) {

    try {

        const response =
            await fetch(
                `${YOUTUBE_API_BASE}/abonner`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        channel_id:
                            channelId,

                        nom:
                            nom
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Impossible de s'abonner."
            );

        }


        await chargerAbonnements();

        await chargerAbonnementsSidebar();

        await rechercherChainesApresModification();

    }

    catch (erreur) {

        console.error(
            "Erreur abonnement :",
            erreur
        );

        afficherErreur(
            erreur.message
        );

    }

}


/* =========================================================
   SE DÉSABONNER
   ========================================================= */

async function desabonner(
    channelId
) {

    try {

        const response =
            await fetch(
                `${YOUTUBE_API_BASE}/desabonner`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        channel_id:
                            channelId
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Impossible de se désabonner."
            );

        }


        await chargerAbonnements();

        await chargerAbonnementsSidebar();

        await rechercherChainesApresModification();

    }

    catch (erreur) {

        console.error(
            "Erreur désabonnement :",
            erreur
        );

        afficherErreur(
            erreur.message
        );

    }

}


/* =========================================================
   RAFRAÎCHIR RECHERCHE CHAÎNES
   ========================================================= */

async function rechercherChainesApresModification() {

    const input =
        document.getElementById(
            "recherche-chaine"
        );


    if (
        input &&
        input.value.trim()
    ) {

        await rechercherChaines();

    }

}


/* =========================================================
   SIDEBAR ABONNEMENTS
   ========================================================= */

async function chargerAbonnementsSidebar() {

    const conteneur =
        document.getElementById(
            "liste-abonnements-sidebar"
        );


    if (!conteneur) {
        return;
    }


    try {

        const response =
            await fetch(
                `${YOUTUBE_API_BASE}/abonnements`
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {
            return;
        }


        const abonnements =
            data.abonnements || [];


        conteneur.innerHTML = "";


        if (
            abonnements.length === 0
        ) {

            const message =
                document.createElement(
                    "div"
                );

            message.className =
                "abonnements-loading";

            message.textContent =
                "Aucun abonnement";

            conteneur.appendChild(
                message
            );

            return;

        }


        abonnements
            .slice(0, 8)
            .forEach(
                abonnement => {

                    const bouton =
                        document.createElement(
                            "button"
                        );

                    bouton.type =
                        "button";

                    bouton.className =
                        "sidebar-channel";


                    const avatar =
                        document.createElement(
                            "div"
                        );

                    avatar.className =
                        "sidebar-channel-avatar";

                    avatar.textContent =
                        "▶";


                    const nom =
                        document.createElement(
                            "span"
                        );

                    nom.className =
                        "sidebar-channel-name";

                    nom.textContent =
                        abonnement.nom ||
                        "Chaîne";


                    bouton.appendChild(
                        avatar
                    );

                    bouton.appendChild(
                        nom
                    );


                    bouton.addEventListener(
                        "click",
                        () => {

                            afficherPage(
                                "recherche"
                            );


                            const recherche =
                                document.getElementById(
                                    "recherche-youtube"
                                );


                            if (recherche) {

                                recherche.value =
                                    abonnement.nom ||
                                    "";

                                effectuerRecherche(
                                    abonnement.nom ||
                                    ""
                                );

                            }

                        }
                    );


                    conteneur.appendChild(
                        bouton
                    );

                }
            );

    }

    catch (erreur) {

        console.error(
            "Erreur sidebar YouTube :",
            erreur
        );

    }

}


/* =========================================================
   ABONNEMENT DEPUIS LA PAGE VIDÉO
   ========================================================= */

function mettreAJourBoutonAbonnementVideo() {

    const bouton =
        document.getElementById(
            "bouton-abonnement-video"
        );


    if (!bouton || !videoActuelle) {
        return;
    }


    verifierAbonnement(
        videoActuelle.channel_id
    )
        .then(
            estAbonne => {

                bouton.classList.toggle(
                    "subscribed",
                    estAbonne
                );


                bouton.textContent =
                    estAbonne ?
                        "Abonné" :
                        "S'abonner";


                bouton.onclick =
                    () => {

                        if (estAbonne) {

                            desabonner(
                                videoActuelle.channel_id
                            );

                        }
                        else {

                            abonner(
                                videoActuelle.channel_id,
                                videoActuelle.chaine
                            );

                        }

                    };

            }
        );

}


async function verifierAbonnement(
    channelId
) {

    if (!channelId) {
        return false;
    }


    try {

        const response =
            await fetch(
                `${YOUTUBE_API_BASE}/abonnements`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {
            return false;
        }


        return (
            data.abonnements || []
        ).some(
            abonnement =>
                abonnement.channel_id ===
                channelId
        );

    }

    catch {
        return false;
    }

}


/* =========================================================
   SIDEBAR MOBILE
   ========================================================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "youtube-sidebar"
        );


    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle(
        "open"
    );

}


/* =========================================================
   POPUP
   ========================================================= */

function initialiserPopup() {

    const popup =
        document.getElementById(
            "youtube-popup-erreur"
        );

    const fermer =
        document.getElementById(
            "youtube-popup-fermer"
        );

    const ok =
        document.getElementById(
            "youtube-popup-ok"
        );


    if (fermer) {

        fermer.addEventListener(
            "click",
            fermerPopup
        );

    }


    if (ok) {

        ok.addEventListener(
            "click",
            fermerPopup
        );

    }


    if (popup) {

        popup.addEventListener(
            "click",
            evenement => {

                if (
                    evenement.target ===
                    popup
                ) {

                    fermerPopup();

                }

            }
        );

    }

}


function afficherErreur(message) {

    const popup =
        document.getElementById(
            "youtube-popup-erreur"
        );

    const texte =
        document.getElementById(
            "youtube-popup-message"
        );


    if (!popup) {
        return;
    }


    if (texte) {

        texte.textContent =
            message ||
            "Une erreur est survenue.";

    }


    popup.hidden = false;

}


function fermerPopup() {

    const popup =
        document.getElementById(
            "youtube-popup-erreur"
        );


    if (popup) {
        popup.hidden = true;
    }

}


/* =========================================================
   UTILITAIRES
   ========================================================= */

function nettoyerTexte(texte) {

    if (!texte) {
        return "";
    }


    const element =
        document.createElement("textarea");

    element.innerHTML =
        String(texte);


    return element.value;

}


function formaterDate(date) {

    if (!date) {
        return "";
    }


    const objetDate =
        new Date(date);


    if (
        Number.isNaN(
            objetDate.getTime()
        )
    ) {

        return "";

    }


    return objetDate.toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


function formaterNombre(nombre) {

    if (
        nombre === undefined ||
        nombre === null ||
        nombre === ""
    ) {

        return "";

    }


    const valeur =
        Number(nombre);


    if (
        Number.isNaN(valeur)
    ) {

        return "";

    }


    if (valeur >= 1_000_000_000) {

        return (
            (valeur / 1_000_000_000)
                .toFixed(1)
                .replace(".0", "")
            + " Md"
        );

    }


    if (valeur >= 1_000_000) {

        return (
            (valeur / 1_000_000)
                .toFixed(1)
                .replace(".0", "")
            + " M"
        );

    }


    if (valeur >= 1_000) {

        return (
            (valeur / 1_000)
                .toFixed(1)
                .replace(".0", "")
            + " k"
        );

    }


    return valeur.toLocaleString(
        "fr-FR"
    );

}


/* =========================================================
   RETOUR NAVIGATEUR
   ========================================================= */

window.addEventListener(
    "popstate",
    () => {

        afficherPage("accueil");

    }
);