# JusCat - Quick Start Guide

<p align="center">
  <img src="apps/frontend/public/juscat-banner.png" alt="JusCat Banner" width="400"/>
</p>

## 🔒 VeWorld Browser Required

**IMPORTANT: JusCat is exclusively designed for the VeWorld browser environment.**

Before proceeding, ensure you have installed the VeWorld browser:

- **Mobile:** [Download VeWorld for iOS/Android](https://www.veworld.net/)
- **Desktop:** [Install VeWorld Browser Extension](https://chromewebstore.google.com/detail/veworld/ffondjhiilhjpmfakjbejdgbemolaaho)

## 🚀 Quick Start for Users

1. **Open VeWorld Browser**
   - Launch the VeWorld browser on your device

2. **Connect Your Wallet**
   - Connect your VeChain wallet when prompted

3. **Navigate to JusCat**
   - Go to the JusCat application URL

4. **Upload Juice Photos**
   - Take or select a photo of your healthy juice drink
   - Submit the photo for validation
   - Receive tokens as rewards for valid submissions

## 👨‍💻 Quick Start for Developers

### Prerequisites

- VeWorld Browser
- Node.js (v18+)
- Yarn
- Docker

### One-Command Setup

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/yourusername/juscat.git
cd juscat

# Install dependencies
yarn install

# Start local blockchain, deploy contracts, and run the application
yarn quickstart
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Start Local Blockchain**
   ```bash
   yarn contracts:solo-up
   ```

3. **Deploy Contracts**
   ```bash
   yarn contracts:deploy:solo
   ```

4. **Configure Environment**
   - Create `.env.development.local` in `apps/backend`
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY="your-api-key-here"
     ```

5. **Start Development Servers**
   ```bash
   yarn dev
   ```

6. **Access Application**
   - Open VeWorld browser
   - Navigate to [http://localhost:8082/](http://localhost:8082/)

## 📋 Available Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:8082 | JusCat user interface |
| Backend | http://localhost:3000 | API server |
| Inspector | http://localhost:8081 | Blockchain inspector |
| Thor Node | http://localhost:8669 | Local VeChain Thor node |

## 🛑 Shutdown

When you're done, stop all services with:

```bash
yarn contracts:solo-down
```

---

Remember: JusCat is designed to work exclusively within the VeWorld browser environment for security and optimal user experience.