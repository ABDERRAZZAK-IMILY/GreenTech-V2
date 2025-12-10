#ifndef OLED_DETECTOR_H
#define OLED_DETECTOR_H

#include <Adafruit_SSD1306.h>

// Initialiser l'OLED avec auto-détection
// Retourne true si succès, false si échec
bool initOLED(Adafruit_SSD1306 &display);

#endif
