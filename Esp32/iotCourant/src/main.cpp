#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "time.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "config.h"
#include "oledDetector.h"


#define SIMULATION_MODE true

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// WebSocket client
WebSocketsClient webSocket;
bool isStompConnected = false;

// NTP Configuration
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;
const int daylightOffset_sec = 0;

// Variables pour les mesures
float currentRMS = 0.0;
float powerWatts = 0.0;
float powerKW = 0.0;
unsigned long lastUpdate = 0;

// Moyenne glissante pour lisser les valeurs
#define SMOOTH_SAMPLES 5
float powerHistory[SMOOTH_SAMPLES] = {0};
int powerHistoryIndex = 0;

// Offset ADC calibré au démarrage
int calibratedOffset = ADC_COUNTS / 2;

// ==================== FONCTIONS NTP ====================
void initTime() {
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Waiting for NTP time...");
  time_t now_sec = time(nullptr);
  while (now_sec < 100000) {
    delay(500);
    Serial.print(".");
    now_sec = time(nullptr);
  }
  Serial.println("\nTime initialized!");
}

String getISO8601Time() {
  time_t now_sec = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now_sec, &timeinfo);
  char buffer[25];
  sprintf(buffer, "%04d-%02d-%02dT%02d:%02d:%02d",
          timeinfo.tm_year + 1900,
          timeinfo.tm_mon + 1,
          timeinfo.tm_mday,
          timeinfo.tm_hour,
          timeinfo.tm_min,
          timeinfo.tm_sec);
  return String(buffer);
}

// ==================== FONCTIONS STOMP/WEBSOCKET ====================
void sendStompFrame(String frame) {
  frame += '\0';
  webSocket.sendTXT(frame);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected.");
      isStompConnected = false;
      break;

    case WStype_CONNECTED:
      Serial.println("WebSocket Connected to /iot/energy!");
      isStompConnected = true;
      break;

    case WStype_TEXT:
      Serial.print("Received from server: ");
      Serial.println((char*)payload);
      // Parse server response (acknowledgment or error)
      break;

    case WStype_ERROR:
      Serial.println("WebSocket Error!");
      isStompConnected = false;
      break;

    default:
      break;
  }
}

// ==================== CALIBRATION ====================
void calibrateOffset() {
  Serial.println("[CAL] Attente stabilisation du circuit...");
  delay(2000);  // Attendre 2 secondes pour que le circuit se stabilise
  Serial.println("[CAL] Calibration de l'offset ADC...");

  long sum = 0;
  int numSamples = 2000;

  for (int i = 0; i < numSamples; i++) {
    sum += analogRead(SCT_PIN);
    delayMicroseconds(500);
  }

  calibratedOffset = sum / numSamples;
  Serial.printf("[CAL] Offset calibre: %d (theorique: 2048)\n", calibratedOffset);
}

// ==================== FONCTIONS MESURE COURANT ====================
float measureCurrentRMS() {
  long sumSquares = 0;
  int sample;
  int sampleOffset;

  // Debug: afficher quelques valeurs ADC brutes
  static unsigned long lastDebug = 0;
  bool showDebug = (millis() - lastDebug > 5000);
  if (showDebug) {
    lastDebug = millis();
    Serial.print("[ADC DEBUG] Offset=");
    Serial.print(calibratedOffset);
    Serial.print(" | Samples: ");
  }

  for (int i = 0; i < SAMPLES; i++) {
    sample = analogRead(SCT_PIN);

    // Debug: afficher les 5 premiers échantillons
    if (showDebug && i < 5) {
      Serial.print(sample);
      Serial.print(" ");
    }

    sampleOffset = sample - calibratedOffset;
    sumSquares += (long)sampleOffset * sampleOffset;
    delayMicroseconds(200);
  }

  if (showDebug) {
    Serial.println();
  }

  float meanSquares = (float)sumSquares / SAMPLES;
  float rmsADC = sqrt(meanSquares);
  float rmsVoltage = (rmsADC / (float)ADC_COUNTS) * VREF;
  float current = (rmsVoltage / BURDEN_RESISTOR) * SCT_RATIO * CALIBRATION_FACTOR;

  // Protection contre nan
  if (isnan(current) || isinf(current)) {
    current = 0.0;
  }

  // Seuil de bruit : ignorer les petites valeurs
  if (current < NOISE_THRESHOLD) {
    current = 0.0;
  }

  return current;
}

// ==================== FONCTIONS AFFICHAGE ====================
void displayStatus() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // Ligne 1: IP
  display.setCursor(0, 0);
  display.print("IP:");
  display.println(WiFi.localIP());

  // Ligne 2: MAC
  display.print("MAC:");
  display.println(WiFi.macAddress());

  // Ligne 3: Séparation
  display.drawLine(0, 18, 127, 18, SSD1306_WHITE);

  // Ligne 4: Puissance en kW (grand)
  display.setTextSize(2);
  display.setCursor(5, 22);
  if (powerKW < 10) {
    display.print(powerKW, 3);
  } else {
    display.print(powerKW, 2);
  }
  display.println(" kW");

  // Ligne 5: Courant et Watts
  display.setTextSize(1);
  display.setCursor(0, 42);
  display.print("I:");
  display.print(currentRMS, 2);
  display.print("A  P:");
  display.print(powerWatts, 0);
  display.println("W");

  // Ligne 6: Status connexion
  display.setCursor(0, 54);
  display.print("WS:");
  display.println(isStompConnected ? "Connected" : "Disconnected");

  display.display();
}

void printSerial() {
  Serial.println("------------------------");
  Serial.print("Courant RMS: ");
  Serial.print(currentRMS, 3);
  Serial.println(" A");
  Serial.print("Puissance: ");
  Serial.print(powerWatts, 1);
  Serial.print(" W | ");
  Serial.print(powerKW, 4);
  Serial.println(" kW");
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== IoT Courant - Mesure SCT-013 ===");
  Serial.println("Capteur: SCT-013-000 (100A)");
  Serial.printf("Pin ADC: GPIO%d\n", SCT_PIN);
  Serial.printf("Tension secteur: %.0fV\n", VOLTAGE_REF);
  Serial.printf("Resistance burden: %.0f ohms\n", BURDEN_RESISTOR);

  // Configurer l'ADC
  analogReadResolution(ADC_BITS);
  analogSetAttenuation(ADC_11db);

  // Initialiser l'OLED avec auto-détection
  if (!initOLED(display)) {
    Serial.println("[ERREUR] Impossible d'initialiser l'écran OLED");
    Serial.println("[INFO] Continuons quand même sans écran...");
  } else {
    Serial.println("[OK] Écran OLED initialisé avec succès!");
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(10, 10);
    display.println("IoT Courant");
    display.setCursor(10, 25);
    display.println("SCT-013-000");
    display.setCursor(10, 45);
    display.println("Connexion WiFi...");
    display.display();
  }

  // Connexion WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP: ");
  Serial.println(WiFi.localIP());

  // Initialiser NTP
  initTime();

  // Initialiser WebSocket avec SSL pour Render
  webSocket.beginSSL(WS_SERVER, WS_PORT, WS_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);

  // Calibrer l'offset ADC
  calibrateOffset();

  Serial.println("\nDémarrage des mesures...\n");
}






// ==================== SIMULATION DATA ====================
float generateFakeCurrent() {
  static float current = 1.5;

  float variation = random(-20, 20) / 100.0; // ±0.2A
  current += variation;

  if (current < 0.2) current = 0.2;
  if (current > 10.0) current = 10.0;

  return current;
}




// ==================== LOOP ====================
void loop() {
  webSocket.loop();

  unsigned long currentMillis = millis();

  if (currentMillis - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = currentMillis;

    // Mesurer le courant RMS
    // float rawCurrent = measureCurrentRMS();
    // float rawPower = VOLTAGE_REF * rawCurrent;


    float rawCurrent;
float rawPower;

#if SIMULATION_MODE
  rawCurrent = generateFakeCurrent();
  rawPower = VOLTAGE_REF * rawCurrent;
#else
  rawCurrent = measureCurrentRMS();
  rawPower = VOLTAGE_REF * rawCurrent;
#endif


    // Ajouter a la moyenne glissante
    powerHistory[powerHistoryIndex] = rawPower;
    powerHistoryIndex = (powerHistoryIndex + 1) % SMOOTH_SAMPLES;

    // Calculer la moyenne
    float sum = 0;
    for (int i = 0; i < SMOOTH_SAMPLES; i++) {
      sum += powerHistory[i];
    }
    powerWatts = sum / SMOOTH_SAMPLES;
    powerKW = powerWatts / 1000.0;
    currentRMS = powerWatts / VOLTAGE_REF;

    // Afficher sur l'écran
    displayStatus();

    // Afficher sur le port série
    printSerial();

    // Envoyer via WebSocket si connecté
    if (isStompConnected) {
      StaticJsonDocument<256> json;

      json["powerKW"] = (double)powerKW;
      json["powerW"] = (double)powerWatts;
      json["currentA"] = (double)currentRMS;
      json["voltage"] = (int)VOLTAGE_REF;
      json["timestamp"] = getISO8601Time();
      json["mac"] = WiFi.macAddress();

      String payloadJson;
      serializeJson(json, payloadJson);

      Serial.print("[SEND] ");
      Serial.println(payloadJson);

      String sendFrame = "SEND\n";
      sendFrame += "destination:/app/addData\n";
      sendFrame += "content-type:application/json\n";
      sendFrame += "content-length:" + String(payloadJson.length()) + "\n";
      sendFrame += "\n";
      sendFrame += payloadJson;

      sendStompFrame(sendFrame);
      Serial.println("✓ Données envoyées au serveur!");
    }
  }
}
