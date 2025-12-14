#include "oledDetector.h"
#include "config.h"
#include <Wire.h>
#include <EEPROM.h>

// Adresses EEPROM
#define EEPROM_MAGIC 0xAB
#define EEPROM_ADDR_MAGIC 0
#define EEPROM_ADDR_SDA 1
#define EEPROM_ADDR_SCL 2
#define EEPROM_ADDR_I2C 3

// Structure config OLED
struct OLEDConfig {
  uint8_t sda_pin;
  uint8_t scl_pin;
  uint8_t i2c_address;
};

// Pins I2C possibles sur ESP32 et ESP8266
// Ordre optimisé : pins les plus courantes en premier
#ifdef ESP32
  // ESP32 : toutes les pins GPIO utilisables pour I2C
  // Priorité : 21/22 (standards), 4/5, puis autres
  const int possiblePins[] = {21, 22, 4, 5, 13, 14, 15, 16, 17, 18, 19, 23, 25, 26, 27, 32, 33};
#else
  // ESP8266 : priorité aux pins standards (4/5) et IDEASPARK inversées (14/12)
  const int possiblePins[] = {14, 12, 4, 5, 0, 2, 13, 15};
#endif
const int numPins = sizeof(possiblePins) / sizeof(possiblePins[0]);
const uint8_t possibleAddresses[] = {0x3C, 0x3D};
const int numAddresses = 2;

// Charger config depuis EEPROM
bool loadOLEDConfig(OLEDConfig &config) {
  EEPROM.begin(512);
  if (EEPROM.read(EEPROM_ADDR_MAGIC) == EEPROM_MAGIC) {
    config.sda_pin = EEPROM.read(EEPROM_ADDR_SDA);
    config.scl_pin = EEPROM.read(EEPROM_ADDR_SCL);
    config.i2c_address = EEPROM.read(EEPROM_ADDR_I2C);

    Serial.println("[OLED] Config chargée depuis EEPROM");
    Serial.printf("  SDA=GPIO%d, SCL=GPIO%d, Adr=0x%02X\n",
                  config.sda_pin, config.scl_pin, config.i2c_address);
    return true;
  }
  return false;
}

// Sauvegarder config dans EEPROM
void saveOLEDConfig(const OLEDConfig &config) {
  EEPROM.write(EEPROM_ADDR_MAGIC, EEPROM_MAGIC);
  EEPROM.write(EEPROM_ADDR_SDA, config.sda_pin);
  EEPROM.write(EEPROM_ADDR_SCL, config.scl_pin);
  EEPROM.write(EEPROM_ADDR_I2C, config.i2c_address);
  EEPROM.commit();
  Serial.println("[OLED] Config sauvegardée dans EEPROM");
}

// Scanner toutes les combinaisons
bool scanForOLED(Adafruit_SSD1306 &display, OLEDConfig &config) {
  Serial.println("\n[OLED] Scan automatique en cours...");
  Serial.printf("[OLED] Test de %d pins possibles\n", numPins);

  int testCount = 0;
  for (int sda_i = 0; sda_i < numPins; sda_i++) {
    for (int scl_i = 0; scl_i < numPins; scl_i++) {
      if (sda_i == scl_i) continue;

      int sda = possiblePins[sda_i];
      int scl = possiblePins[scl_i];

      testCount++;
      if (testCount % 20 == 0) {
        Serial.printf("  ...testé %d combinaisons\n", testCount);
      }

      // Fermer l'ancien bus I2C (ESP32 seulement, ESP8266 n'a pas Wire.end())
      #ifdef ESP32
        Wire.end();
      #endif
      Wire.begin(sda, scl);
      delay(50);  // Délai plus long pour stabilisation

      for (int addr_i = 0; addr_i < numAddresses; addr_i++) {
        uint8_t addr = possibleAddresses[addr_i];

        Wire.beginTransmission(addr);
        uint8_t error = Wire.endTransmission();

        if (error == 0) {
          Serial.printf("[OLED] Réponse I2C détectée sur SDA=%d, SCL=%d, Adr=0x%02X\n", sda, scl, addr);

          // Réinitialiser complètement le display
          bool success = display.begin(SSD1306_SWITCHCAPVCC, addr);

          if (success) {
            Serial.printf("[OLED] Trouvé! SDA=GPIO%d, SCL=GPIO%d, Adr=0x%02X\n", sda, scl, addr);

            // Tester que l'écran répond
            display.clearDisplay();
            display.display();
            delay(10);

            config.sda_pin = sda;
            config.scl_pin = scl;
            config.i2c_address = addr;

            return true;
          } else {
            Serial.printf("[OLED] display.begin() retourné: %d\n", success);
          }
        }
      }
    }
  }

  Serial.printf("[OLED] Aucun écran trouvé après %d tests!\n", testCount);
  return false;
}

// Fonction principale d'initialisation
bool initOLED(Adafruit_SSD1306 &display) {
  Serial.println("\n=== Initialisation OLED ===");

  OLEDConfig config;

  // Essayer de charger la config
  if (loadOLEDConfig(config)) {
    Wire.begin(config.sda_pin, config.scl_pin);
    delay(100);

    // Vérifier que l'OLED répond vraiment
    Wire.beginTransmission(config.i2c_address);
    if (Wire.endTransmission() == 0) {
      if (display.begin(SSD1306_SWITCHCAPVCC, config.i2c_address)) {
        Serial.println("[OLED] Démarrage OK avec config sauvegardée");
        return true;
      }
    }
    Serial.println("[OLED] Config sauvegardée ne fonctionne plus, scan...");
  }

  // Scanner
  if (scanForOLED(display, config)) {
    saveOLEDConfig(config);
    return true;
  }

  return false;
}
