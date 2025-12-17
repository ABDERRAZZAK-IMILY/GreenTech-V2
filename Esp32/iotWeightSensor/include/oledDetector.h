#ifndef OLED_DETECTOR_H
#define OLED_DETECTOR_H

#include <Adafruit_SSD1306.h>

// Initialiser l'OLED avec auto-detection
// Retourne true si succes, false si echec
bool initOLED(Adafruit_SSD1306 &display);

#endif
