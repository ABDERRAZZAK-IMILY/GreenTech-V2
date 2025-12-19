#ifndef CONFIG_H
#define CONFIG_H

// Configuration de l'ecran OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// NOTE: Les pins I2C (SDA/SCL) et l'adresse I2C sont detectees
// automatiquement par oledDetector au premier demarrage, puis
// sauvegardees dans l'EEPROM pour les demarrages suivants.

// ==================== CONFIGURATION WIFI ====================
// Modifiez ces valeurs selon votre reseau
#define WIFI_SSID "Youcode"
#define WIFI_PASSWORD "Youcode@2024"

// ==================== CONFIGURATION WEBSOCKET ====================
// Adresse IP du serveur Spring Boot
#define WS_SERVER "wss://greentech-api-p5dm.onrender.com"
#define WS_PORT 443
#define WS_PATH "/ws-native"

// ==================== CONFIGURATION HX711 (Capteur de poids) ====================
#define HX711_DOUT_PIN 16           // GPIO pour donnees HX711 (RX2)
#define HX711_SCK_PIN 17            // GPIO pour horloge HX711 (TX2)

// Calibration du capteur de poids
// Calibre pour portable 177g
#define SCALE_CALIBRATION_FACTOR -140.0  // Ajuste: -158 * 157 / 177
#define SCALE_OFFSET 311872               // Valeur a vide

// Unite de mesure
#define WEIGHT_UNIT "g"             // "kg" ou "g"
#define WEIGHT_DECIMALS 0           // Nombre de decimales

// Seuil de stabilite (variation max pour considerer la mesure stable)
#define STABILITY_THRESHOLD 50.0    // en grammes
#define STABILITY_SAMPLES 5         // Nombre d'echantillons pour verifier stabilite

// Nombre de lectures pour moyenne
#define WEIGHT_SAMPLES 3

// Intervalle de mise a jour affichage (ms)
#define UPDATE_INTERVAL 250

#endif
