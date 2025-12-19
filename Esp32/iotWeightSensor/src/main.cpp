#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "time.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <HX711.h>
#include "config.h"
#include "oledDetector.h"

#define SIMULATION_MODE true

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// HX711 capteur de poids
HX711 scale;

// WebSocket client
WebSocketsClient webSocket;
bool isStompConnected = false;

// NTP Configuration
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;
const int daylightOffset_sec = 0;

// Variables pour les mesures
float currentWeight = 0.0;
float lastStableWeight = 0.0;
bool isStable = false;
unsigned long lastUpdate = 0;

// Buffer pour stabilite
float weightHistory[STABILITY_SAMPLES];
int historyIndex = 0;

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
      Serial.println("WebSocket Connected!");
      {
        String connectFrame = "CONNECT\n";
        connectFrame += "accept-version:1.2\n";
        connectFrame += "host:" + String(WS_SERVER) + "\n";
        connectFrame += "\n";
        sendStompFrame(connectFrame);
      }
      break;

    case WStype_TEXT:
      Serial.print("Received: ");
      Serial.println((char*)payload);

      if (String((char*)payload).startsWith("CONNECTED")) {
        Serial.println("STOMP Connection Successful!");
        isStompConnected = true;

        String subscribeFrame = "SUBSCRIBE\n";
        subscribeFrame += "id:sub-0\n";
        subscribeFrame += "destination:/topic/weight\n";
        subscribeFrame += "\n";
        sendStompFrame(subscribeFrame);
      }
      break;

    case WStype_ERROR:
      Serial.println("WebSocket Error!");
      isStompConnected = false;
      break;

    default:
      break;
  }
}

// ==================== FONCTIONS CAPTEUR DE POIDS ====================
void initScale() {
  Serial.println("\n[SCALE] Initialisation du capteur HX711...");
  Serial.printf("[SCALE] DOUT=GPIO%d, SCK=GPIO%d\n", HX711_DOUT_PIN, HX711_SCK_PIN);

  scale.begin(HX711_DOUT_PIN, HX711_SCK_PIN);
  

  // Attendre que le capteur soit pret
  Serial.println("[SCALE] Attente du capteur...");
  while (!scale.is_ready()) {
    delay(100);
  }

  // Appliquer le facteur de calibration
  scale.set_scale(SCALE_CALIBRATION_FACTOR);

  // Tare automatique au demarrage
  Serial.println("[SCALE] Tare en cours... Ne rien poser sur la balance!");
  delay(3000);
  scale.tare();

  Serial.println("[SCALE] Capteur pret!");
}

float measureWeight() {
  if (!scale.is_ready()) {
    return currentWeight;  // Retourner la derniere valeur si pas pret
  }

  // Lecture avec moyenne
  float weight = scale.get_units(WEIGHT_SAMPLES);

  // Protection contre valeurs aberrantes
  if (isnan(weight) || isinf(weight)) {
    weight = 0.0;
  }

  // Ignorer valeurs negatives
  if (weight < 0) {
    weight = 0.0;
  }

  return weight;
}

bool checkStability(float newWeight) {
  // Ajouter au buffer
  weightHistory[historyIndex] = newWeight;
  historyIndex = (historyIndex + 1) % STABILITY_SAMPLES;

  // Verifier si toutes les valeurs sont proches
  float minVal = weightHistory[0];
  float maxVal = weightHistory[0];

  for (int i = 1; i < STABILITY_SAMPLES; i++) {
    if (weightHistory[i] < minVal) minVal = weightHistory[i];
    if (weightHistory[i] > maxVal) maxVal = weightHistory[i];
  }

  return (maxVal - minVal) < STABILITY_THRESHOLD;
}

void tareScale() {
  Serial.println("[SCALE] Tare...");
  scale.tare();
  currentWeight = 0.0;
  lastStableWeight = 0.0;

  // Reset buffer stabilite
  for (int i = 0; i < STABILITY_SAMPLES; i++) {
    weightHistory[i] = 0.0;
  }

  Serial.println("[SCALE] Tare effectuee!");
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

  // Ligne 3: Separation
  display.drawLine(0, 18, 127, 18, SSD1306_WHITE);

  // Ligne 4: Poids (grand)
  display.setTextSize(2);
  display.setCursor(5, 22);
  if (currentWeight < 10) {
    display.print(currentWeight, WEIGHT_DECIMALS);
  } else if (currentWeight < 100) {
    display.print(currentWeight, 1);
  } else {
    display.print(currentWeight, 0);
  }
  display.print(" ");
  display.println(WEIGHT_UNIT);

  // Ligne 5: Stabilite
  display.setTextSize(1);
  display.setCursor(0, 42);
  display.print("Stable: ");
  display.println(isStable ? "OUI" : "NON");

  // Ligne 6: Status connexion
  display.setCursor(0, 54);
  display.print("WS:");
  display.println(isStompConnected ? "Connected" : "Disconnected");

  display.display();
}

void printSerial() {
  Serial.println("------------------------");
  Serial.print("Poids: ");
  Serial.print(currentWeight, WEIGHT_DECIMALS);
  Serial.print(" ");
  Serial.println(WEIGHT_UNIT);
  Serial.print("Stable: ");
  Serial.println(isStable ? "OUI" : "NON");
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== IoT Weight Sensor - HX711 ===");
  Serial.printf("Pins: DOUT=GPIO%d, SCK=GPIO%d\n", HX711_DOUT_PIN, HX711_SCK_PIN);
  Serial.printf("Facteur calibration: %.2f\n", SCALE_CALIBRATION_FACTOR);

  // Initialiser l'OLED avec auto-detection
  if (!initOLED(display)) {
    Serial.println("[ERREUR] Impossible d'initialiser l'ecran OLED");
    Serial.println("[INFO] Continuons quand meme sans ecran...");
  } else {
    Serial.println("[OK] Ecran OLED initialise avec succes!");
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(10, 10);
    display.println("IoT Weight");
    display.setCursor(10, 25);
    display.println("HX711 Sensor");
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

  // Initialiser WebSocket
  // webSocket.begin(WS_SERVER, WS_PORT, WS_PATH);
  // Secure WebSocket for host with SSL
  webSocket.beginSSL(WS_SERVER, WS_PORT, WS_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);

  // Initialiser le capteur de poids
  initScale();

  // Initialiser buffer stabilite
  for (int i = 0; i < STABILITY_SAMPLES; i++) {
    weightHistory[i] = 0.0;
  }

  Serial.println("\nDemarrage des mesures...\n");
}









// ==================== SIMULATION WEIGHT ====================
float generateFakeWeight() {
  static float weight = 0.0;
  static bool increasing = true;

  if (increasing) {
    weight += random(5, 25) / 100.0;   // +0.05 → +0.25 kg
    if (weight >= 12.5) {
      increasing = false;
    }
  } else {
    weight -= random(5, 20) / 100.0;   // -0.05 → -0.20 kg
    if (weight <= 0.0) {
      weight = 0.0;
      increasing = true;
    }
  }

  if (weight < 0) weight = 0;

  return weight;
}


bool simulateStability(float weight) {
  static float lastWeight = 0.0;
  bool stable = abs(weight - lastWeight) < 0.05;
  lastWeight = weight;
  return stable;
}





// ==================== LOOP ====================
void loop() {
  webSocket.loop();

  unsigned long currentMillis = millis();

  if (currentMillis - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = currentMillis;

    // Mesurer le poids

    // currentWeight = measureWeight();

    // Verifier la stabilite

    // isStable = checkStability(currentWeight);

    // SIMULATION MODE
    #if SIMULATION_MODE
  currentWeight = generateFakeWeight();
  isStable = simulateStability(currentWeight);
  if (isStable) {
    lastStableWeight = currentWeight;
  }
#else
  currentWeight = measureWeight();
  isStable = checkStability(currentWeight);
  if (isStable) {
    lastStableWeight = currentWeight;
  }
#endif


    if (isStable) {
      lastStableWeight = currentWeight;
    }

    // Afficher sur l'ecran
    displayStatus();

    // Afficher sur le port serie
    printSerial();

    // Envoyer via WebSocket si connecte
    if (isStompConnected) {
      StaticJsonDocument<256> json;

      json["weight"] = (double)currentWeight;
      json["unit"] = WEIGHT_UNIT;
      json["stable"] = isStable;
      json["timestamp"] = getISO8601Time();
      json["mac"] = WiFi.macAddress();

      String payloadJson;
      serializeJson(json, payloadJson);

      Serial.print("[SEND] ");
      Serial.println(payloadJson);

      String sendFrame = "SEND\n";
      sendFrame += "destination:/app/addWeight\n";
      sendFrame += "content-type:application/json\n";
      sendFrame += "content-length:" + String(payloadJson.length()) + "\n";
      sendFrame += "\n";
      sendFrame += payloadJson;

      sendStompFrame(sendFrame);
      Serial.println("Donnees envoyees au serveur!");
    }
  }
}
