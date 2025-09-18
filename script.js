const translations = {
    pt: {
        title: "Site em Construção",
        message: "Estamos trabalhando duro para trazer um novo site incrível para você. Volte em breve!",
        underConstructionNote: "Agradecemos a sua paciência."
    },
    en: {
        title: "Website Under Construction",
        message: "We are working hard to bring you an amazing new website. Please check back soon!",
        underConstructionNote: "Thank you for your patience."
    },
    it: {
        title: "Sito in Costruzione",
        message: "Stiamo lavorando sodo per offrirti un nuovo sito web straordinario. Torna presto!",
        underConstructionNote: "Grazie per la tua pazienza."
    }
};

function setLanguage(lang) {
    document.getElementById("main-title").innerText = translations[lang].title;
    document.getElementById("main-message").innerText = translations[lang].message;
    document.getElementById("under-construction-note").innerText = translations[lang].underConstructionNote;
    document.documentElement.lang = lang;
}

// Set default language on load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('pt');
});
