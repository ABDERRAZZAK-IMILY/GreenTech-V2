import Constants from 'expo-constants';

export const getBackendUrl = () => {
    // En développement, utiliser l'IP du serveur Expo (même machine que le backend)
    const expoHostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;

    if (expoHostUri) {
        // Extraire l'IP du hostUri (format: "192.168.1.30:8081")
        const ip = expoHostUri.split(':')[0];
        return `http://${ip}:8080`;
    }

    // Fallback sur localhost
    return 'http://localhost:8080';
};