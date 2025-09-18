const translations = {
    pt: {
        title: "Estamos em obras",
        newPhrase: "Estamos fazendo melhoria no site e logo vamos ter novidades",
        underConstructionNote: "Agradecemos a sua paciência."
    },
    en: {
        title: "Under Construction",
        newPhrase: "We are making improvements to the site and will soon have news",
        underConstructionNote: "Thank you for your patience."
    },
    it: {
        title: "In Costruzione",
        newPhrase: "Stiamo apportando miglioramenti al sito e presto avremo novità",
        underConstructionNote: "Grazie per la tua pazienza."
    }
};

function setLanguage(lang) {
    document.getElementById("main-title").innerText = translations[lang].title;
    document.getElementById("new-phrase").innerText = translations[lang].newPhrase;
    document.getElementById("under-construction-note").innerText = translations[lang].underConstructionNote;
    document.documentElement.lang = lang;
}

// Set default language on load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('pt');
});
