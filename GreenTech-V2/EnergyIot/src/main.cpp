#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const char* ssid = "Boybouch";
const char* password = "22222222";

const char* ws_host = "192.168.11.237";
const int ws_port = 8080;
const char* ws_path = "/iot/energy";  // Dedicated energy endpoint
String mac_address = "";

WebSocketsClient webSocket;
bool wsConnected = false;

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("========================================");
            Serial.println("[WSc] Disconnected from server!");
            Serial.println("========================================");
            wsConnected = false;
            display.clearDisplay();
            display.setCursor(0,0);
            display.println("WS: Disconnected");
            display.display();
            break;
            
        case WStype_CONNECTED:
            Serial.println("========================================");
            Serial.printf("[WSc] Connected to url: %s\n", payload);
            Serial.println("========================================");
            wsConnected = true;
            display.clearDisplay();
            display.setCursor(0,0);
            display.println("WS: Connected!");
            display.display();
            break;
            
        case WStype_TEXT:
            {
                Serial.printf("[WSc] Server response: %s\n", payload);
                StaticJsonDocument<200> doc;
                DeserializationError error = deserializeJson(doc, payload);
                if (!error) {
                    const char* status = doc["status"];
                    if (status && strcmp(status, "ok") == 0) {
                        Serial.println("[WSc] Data acknowledged by server ✓");
                    } else if (status && strcmp(status, "connected") == 0) {
                        Serial.println("[WSc] Server sent welcome message ✓");
                    }
                }
            }
            break;
            
        case WStype_ERROR:
            Serial.println("[WSc] Error occurred!");
            wsConnected = false;
            break;
            
        case WStype_PING:
            Serial.println("[WSc] Ping received");
            break;
            
        case WStype_PONG:
            Serial.println("[WSc] Pong received - connection alive");
            break;
    }
}

void sendEnergy(float energyValue) {
    if (!wsConnected) {
        Serial.println("WebSocket not connected. Skipping send.");
        return;
    }
    
    StaticJsonDocument<200> doc;
    doc["energyConsumed"] = energyValue;
    doc["macAddress"] = mac_address;

    String jsonString;
    serializeJson(doc, jsonString);

    webSocket.sendTXT(jsonString);
    Serial.println("Sent Energy: " + jsonString);
}

void setup() {
    Serial.begin(115200);

    mac_address = WiFi.macAddress();
    Serial.print("ESP32 MAC: ");
    Serial.println(mac_address);

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
    
    display.clearDisplay();
    display.setCursor(0,0);
    display.println("WiFi: Connected");
    display.print("IP: ");
    display.println(WiFi.localIP());
    display.display();
    delay(2000);

    // Configure WebSocket
    Serial.println("====================================");
    Serial.printf("Connecting to WebSocket Server...\n");
    Serial.printf("Host: %s\n", ws_host);
    Serial.printf("Port: %d\n", ws_port);
    Serial.printf("Path: %s\n", ws_path);
    Serial.printf("ESP32 IP: %s\n", WiFi.localIP().toString().c_str());
    Serial.println("====================================");
    
    webSocket.begin(ws_host, ws_port, ws_path);
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
    webSocket.enableHeartbeat(15000, 3000, 2); // Ping every 15s, timeout 3s, 2 retries
    Serial.println("WebSocket configured - waiting for connection...");
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
        
        if (wsConnected) {
            display.println(">> WS Connected <<");
        } else {
            display.println(">> WS Disconnected <<");
        }

        display.setCursor(0, 20);
        display.print("Energy: ");
        display.print(energy);
        display.println(" kWh");
        
        display.setCursor(0, 40);
        display.print("IP: ");
        display.println(WiFi.localIP());
        display.print("MAC: ");
        display.println(mac_address);

        display.display();
    }
}
