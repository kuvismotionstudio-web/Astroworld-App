const i18next = require('i18next');
const path = require('path');
const fs = require('fs');

const localesDir = path.join(__dirname, 'locales');

const loadTranslations = () => {
    const resources = {};
    try {
        const langFiles = fs.readdirSync(localesDir);
        langFiles.forEach(file => {
            if (file.endsWith('.json')) {
                const lang = path.basename(file, '.json');
                const translations = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
                resources[lang] = { translation: translations };
            }
        });
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
    return resources;
};

i18next.init({
    lng: 'pl', // Domyślny język
    fallbackLng: 'en',
    resources: loadTranslations(),
});

module.exports = i18next;