#ifndef CONFIG_H
#define CONFIG_H

// Configuration de l'écran OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// NOTE: Les pins I2C (SDA/SCL) et l'adresse I2C sont détectées
// automatiquement par oledDetector au premier démarrage, puis
// sauvegardées dans l'EEPROM pour les démarrages suivants.

// ==================== CONFIGURATION WIFI ====================
// Modifiez ces valeurs selon votre réseau
#define WIFI_SSID "Palais Bouregreg"
#define WIFI_PASSWORD "PALAIS2021"

// ==================== CONFIGURATION WEBSOCKET ====================
// Adresse IP du serveur Spring Boot
#define WS_SERVER "greentech-api-p5dm.onrender.com"
#define WS_PORT 443
#define WS_PATH "/iot/energy"

// ==================== CONFIGURATION SCT-013-000 ====================
#define SCT_PIN 34              // GPIO pour lecture analogique (ADC1)
#define VOLTAGE_REF 230.0       // Tension secteur en France (V)
#define SCT_RATIO 2000          // Ratio du transformateur (100A:50mA = 2000:1)
#define BURDEN_RESISTOR 100.0   // Resistance burden en ohms
#define ADC_BITS 12             // Resolution ADC ESP32
#define ADC_COUNTS 4096         // 2^12
#define VREF 3.3                // Tension de reference ADC

// Calibration
#define CALIBRATION_FACTOR 0.16  // Calibré pour SCT-013-000 avec R=100ohm
#define NOISE_THRESHOLD 0.05     // Seuil de bruit en amperes (en dessous = 0)

// Nombre d'echantillons pour le calcul RMS
#define SAMPLES 500

// Intervalle de mise a jour affichage (ms)
#define UPDATE_INTERVAL 250

#endif
