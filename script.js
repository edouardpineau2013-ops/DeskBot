function envoyerCommande() {
    const commande = document.getElementById("commande").value;

    fetch("https://api.gogekko.fr/commande", {        
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            texte: commande
        })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById("reponse").textContent = "Réponse: " + data.reponse;
    });
}

function envoyerCommandePrédéfinie(commande) {
    fetch("https://api.gogekko.fr/commande", {        
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            texte: (commande)
        })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById("reponse").textContent = "Réponse: " + data.reponse;
    });
}

function ouvrirMusique(){
    document.getElementById("popup-musique").style.display="flex";
}

function fermerMusique(){
    document.getElementById("popup-musique").style.display="none";
}

window.onclick=function(event){

    const popup=document.getElementById("popup-musique");

    if(event.target===popup){
        fermerMusique();
    }

}

function ouvrirMeteo(){
    document.getElementById("popup-meteo").style.display="flex";
}

function fermerMeteo(){
    document.getElementById("popup-meteo").style.display="none";
}

window.onclick=function(event){

    const popup=document.getElementById("popup-meteo");

    if(event.target===popup){
        fermerMeteo();
    }

}

function envoyerMeteo() {
    const ville = document.getElementById("ville").value;

    fetch("https://api.gogekko.fr/commande", {        
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            texte: "quelle est la météo à " + ville
        })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById("reponse").textContent = "Réponse: " + data.reponse;
    });
}
