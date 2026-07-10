function envoyerCommande() {
    const commande = document.getElementById("commande").value;

    fetch("https://implications-binary-services-loved.trycloudflare.com/commande", {
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