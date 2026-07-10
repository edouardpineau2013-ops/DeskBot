function envoyerCommande() {
    const commande = document.getElementById("commande").value;

    fetch("http://127.0.0.1:5000/commande", {
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
        document.getElementById("reponse").textContent = data.reponse;
    });
}