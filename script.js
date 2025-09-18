const translations = {
    pt: {
        title: "Site em Construção",
        message: "Estamos trabalhando duro para trazer um novo site incrível para você. Volte em breve!"
    },
    en: {
        title: "Website Under Construction",
        message: "We are working hard to bring you an amazing new website. Please check back soon!"
    },
    it: {
        title: "Sito in Costruzione",
        message: "Stiamo lavorando sodo per offrirti un nuovo sito web straordinario. Torna presto!"
    }
};

function setLanguage(lang) {
    document.getElementById("main-title").innerText = translations[lang].title;
    document.getElementById("main-message").innerText = translations[lang].message;
    document.documentElement.lang = lang;
}

// Set default language on load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('pt');
});
