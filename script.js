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
            texte: commande
        })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById("reponse").textContent = "Réponse: " + data.reponse;
    });
}