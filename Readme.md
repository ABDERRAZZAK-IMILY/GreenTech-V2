# 🌿 GreenTech - Environmental Performance Dashboard

<div align="center">

![GreenTech Logo](https://img.shields.io/badge/GreenTech-Innovators-00A86B?style=for-the-badge&logo=leaf&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.0-6DB33F?style=flat-square&logo=spring-boot)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)
![React Native](https://img.shields.io/badge/React%20Native-Expo-000020?style=flat-square&logo=expo)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)

**A comprehensive IoT-powered environmental monitoring and gamification platform for sustainable business practices.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

GreenTech is an end-to-end environmental performance management system designed to help businesses monitor, analyze, and reduce their carbon footprint. The platform combines real-time IoT sensor data, AI-driven insights, and gamification elements to encourage sustainable practices among employees.

### 🎯 Key Objectives

- **Monitor** energy consumption, waste production, gas usage, and vehicle emissions in real-time
- **Analyze** environmental data with AI-powered predictions and recommendations
- **Engage** employees through gamification, challenges, and a rewards marketplace
- **Report** ISO-compliant environmental performance metrics

---

## ✨ Features

### 🔌 IoT Integration
- Real-time energy monitoring via ESP32 sensors
- Weight-based waste tracking with smart bins
- WebSocket communication for instant data updates
- Multi-device support across facilities

### 📊 Dashboard & Analytics
- Interactive charts (line, bar, doughnut, gauge)
- Period-based comparisons (24h, 7 days, 30 days)
- CO2 emissions breakdown by source
- National benchmark comparisons

### 🤖 AI-Powered Insights
- Consumption predictions using DeepSeek AI
- Personalized eco-recommendations
- Anomaly detection and alerts
- Trend analysis and forecasting

### 🎮 Gamification System
- Eco-coins reward system
- Achievement badges and levels
- Team and individual challenges
- Rewards marketplace (products, experiences)

### 📱 Mobile Application
- Cross-platform React Native app
- Employee action tracking
- Real-time notifications
- Personal eco-dashboard

### 📈 Reporting
- PDF and Excel report generation
- ISO 14001 compliance templates
- Scheduled automated reports
- SMS/Email notifications via Twilio

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Core language |
| Spring Boot 3.4.0 | Application framework |
| MongoDB | NoSQL database |
| WebSocket | Real-time communication |
| JWT | Authentication |
| Twilio | SMS notifications |
| OpenPDF | PDF generation |
| Apache POI | Excel generation |
| DeepSeek API | AI predictions |

### Web Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Chart.js | Data visualization |
| Axios | HTTP client |
| Tailwind CSS | Styling |
| STOMP.js | WebSocket client |

### Mobile App
| Technology | Purpose |
|------------|---------|
| React Native | Cross-platform mobile |
| Expo | Development framework |
| React Navigation | App navigation |

### IoT Devices
| Technology | Purpose |
|------------|---------|
| ESP32 | Microcontroller |
| PlatformIO | Firmware development |
| ACS712 | Current sensing |
| HX711 | Weight sensing |

---

## 📁 Project Structure

```
GreenTech-V2/
├── GreenTech-V2/                    # Backend (Spring Boot)
│   ├── src/main/java/com/greentechinnovators/
│   │   ├── auth/                    # Authentication
│   │   ├── controller/              # REST controllers
│   │   ├── service/                 # Business logic
│   │   ├── entity/                  # Data models
│   │   ├── repository/              # Data access
│   │   ├── dto/                     # Data transfer objects
│   │   ├── gamification/            # Gamification module
│   │   ├── marketplace/             # Rewards marketplace
│   │   └── websocket/               # WebSocket handlers
│   ├── iotCourant/                  # ESP32 energy sensor
│   └── iotWeightSensor/             # ESP32 weight sensor
│
├── webProject_ReactWeb/             # Web Dashboard
│   └── greentech-dashboard-react/
│       ├── src/
│       │   ├── pages/               # Page components
│       │   ├── components/          # Reusable components
│       │   ├── services/            # API services
│       │   ├── contexts/            # React contexts
│       │   ├── hooks/               # Custom hooks
│       │   └── utils/               # Utilities
│       └── public/
│
└── mobileProject_ReactNative/       # Mobile App
    └── greentech-mobile/
        ├── screens/                 # App screens
        ├── components/              # UI components
        ├── services/                # API services
        └── contexts/                # App state
```

---

## 🚀 Installation

### Prerequisites

- **Java 17+** - [Download](https://adoptium.net/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MongoDB** - [Atlas](https://www.mongodb.com/cloud/atlas) or local installation
- **Maven 3.9+** - [Download](https://maven.apache.org/)
- **Expo CLI** - `npm install -g expo-cli`

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/GreenTech-V2.git
cd GreenTech-V2
```

### 2. Backend Setup

```bash
cd GreenTech-V2

# Configure environment (edit application.yaml)
# Set your MongoDB URI, JWT secret, Twilio credentials, and DeepSeek API key

# Build and run
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Web Frontend Setup

```bash
cd webProject_ReactWeb/greentech-dashboard-react

# Install dependencies
npm install

# Start development server
npm run dev
```

The web app will be available at `http://localhost:5173`

### 4. Mobile App Setup

```bash
cd mobileProject_ReactNative/greentech-mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

Scan the QR code with Expo Go app on your device.

---

## ⚙️ Configuration

### Backend Configuration (`application.yaml`)

```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://your-connection-string

greentech:
  api:
    deepseek-key: your-deepseek-api-key
  twilio:
    account-sid: your-twilio-sid
    auth-token: your-twilio-token
  security:
    jwt:
      secret-key: your-256-bit-secret
```

### Frontend Configuration

Update API URLs in `src/services/`:
- `smartDataService.js` - Backend API endpoints
- `authService.js` - Authentication endpoints

---

## 📖 API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |

### Energy Monitoring
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/energy/today` | GET | Today's energy data |
| `/api/energy/history/{days}` | GET | Historical data |

### Gamification
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gamification/stats/{userId}` | GET | User stats |
| `/api/gamification/challenges` | GET | Active challenges |
| `/api/gamification/actions/validate` | POST | Validate action |

### WebSocket Endpoints
| Endpoint | Purpose |
|----------|---------|
| `ws://localhost:8080/iot/energy` | Real-time energy data |
| `ws://localhost:8080/iot/trash` | Real-time waste data |

> 📚 Full API documentation available at `http://localhost:8080/swagger-ui.html`

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Admin** | Full dashboard, IoT management, user management, reports, marketplace admin |
| **User** | Personal dashboard, actions, challenges, marketplace, profile |

---

## 🔐 Security

- JWT-based stateless authentication
- BCrypt password hashing
- Role-based access control (RBAC)
- CORS configuration for cross-origin requests
- Secure WebSocket connections

---

## 🧪 Testing

```bash
# Backend tests
cd GreenTech-V2
./mvnw test

# Frontend tests
cd webProject_ReactWeb/greentech-dashboard-react
npm test
```

---

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Java: Google Java Style Guide
- JavaScript/React: ESLint + Prettier
- Commits: Conventional Commits

---

## 📄 License

No license for now
---

## 🙏 Acknowledgments

- [Spring Boot](https://spring.io/projects/spring-boot) - Backend framework
- [React](https://reactjs.org/) - Frontend library
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Expo](https://expo.dev/) - Mobile development
- [MongoDB](https://www.mongodb.com/) - Database
- [DeepSeek](https://deepseek.com/) - AI API

---

<div align="center">

**Built with 💚 by GreenTech Innovators**

## IMILY ABDERRAZZAK
## Mohamed Moustir
## Youssef Elhoubi
</div>
