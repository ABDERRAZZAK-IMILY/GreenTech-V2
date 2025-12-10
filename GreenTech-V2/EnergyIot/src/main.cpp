#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const char* ssid = "Youcode";
const char* password = "Youcode@2024";

const char* ws_host = "192.168.1.5";
const int ws_port = 8080;
const char* ws_path = "/ws";

WebSocketsClient webSocket;

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("[WSc] Disconnected!");
            break;
        case WStype_CONNECTED:
            Serial.printf("[WSc] Connected to url: %s\n", payload);
            break;
        case WStype_TEXT:
            Serial.printf("[WSc] Server response: %s\n", payload);
            break;
    }
}

void sendEnergy(float energyValue) {
    StaticJsonDocument<200> doc;
    doc["energyConsumed"] = energyValue;

    String jsonString;
    serializeJson(doc, jsonString);

    webSocket.sendTXT(jsonString);
    Serial.println("Sent Energy: " + jsonString);
}

void setup() {
    Serial.begin(115200);

    if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println(F("SSD1306 allocation failed"));
    }
    display.clearDisplay();
    display.setTextColor(WHITE);
    display.setTextSize(1);
    display.setCursor(0,0);
    display.println("Booting ESP32...");
    display.display();

    WiFi.begin(ssid, password);
    Serial.print("Connecting WiFi");
    while(WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        display.print(".");
        display.display();
    }
    Serial.println("\nWiFi Connected!");

    webSocket.begin(ws_host, ws_port, ws_path);
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void loop() {
    webSocket.loop();

    unsigned long now = millis();
    if (now - lastSendTime > sendInterval) {
        lastSendTime = now;

        float energy = random(100, 400) / 10.0;

        sendEnergy(energy);

        display.clearDisplay();
        display.setCursor(0,0);
        display.println(">> Sending Energy <<");

        display.setCursor(0, 30);
        display.print("Energy: ");
        display.print(energy);
        display.println(" kWh");

        display.display();
    }
}
