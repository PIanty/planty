# JusCat - VeWorld Exclusive Application 🐱

<p align="center">
  <img src="apps/frontend/public/juscat-banner.png" alt="JusCat Banner" width="600"/>
</p>

## 🔒 VeWorld Exclusive Application

**IMPORTANT: This application can only be accessed through the VeWorld browser.**

JusCat is a blockchain application built on VeChain that rewards users with tokens for uploading photos of healthy juice drinks. The application is designed to run exclusively within the VeWorld browser environment for security and optimal user experience.

## 📱 Download VeWorld

Before you can use JusCat, you must download and install the VeWorld browser:

- **Mobile:** [Download VeWorld for iOS/Android](https://www.veworld.net/)
- **Desktop:** [Install VeWorld Browser Extension](https://chromewebstore.google.com/detail/veworld/ffondjhiilhjpmfakjbejdgbemolaaho)

## 🌟 Key Features

- **Secure Environment**: Application runs exclusively in VeWorld browser
- **Token Rewards**: Earn tokens by uploading photos of healthy juice drinks
- **AI Validation**: Smart image analysis ensures only valid juice photos are rewarded
- **Blockchain Integration**: Seamless connection with VeChain Thor blockchain
- **User-Friendly Interface**: Simple and intuitive design for all users

## 🏗️ Project Structure

### Frontend (apps/frontend) 🌐

A React application powered by Vite with VeWorld integration:

- **Vechain dapp-kit**: Streamlined wallet connections and blockchain interactions

### Backend (apps/backend) 🔙

An Express server with TypeScript for API development:

- **Vechain SDK**: Blockchain transaction management
- **OpenAI GPT-4o**: Image analysis capabilities for juice drink validation

### Contracts (apps/contracts) 📜

Smart contracts in Solidity, managed with Hardhat for VeChain Thor network deployment.

## ⚙️ Environment Variables

Configure your environment variables for seamless integration:

### Backend

Store your environment-specific `.env` files in `apps/backend`:

- **OPENAI_API_KEY:** Required for image validation

## 🚀 Getting Started for Developers

### Prerequisites

- **Node.js (v18 or later)** 
- **Yarn**
- **Docker** (for containerization)
- **VeWorld Browser**

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```

### Local Development

1. Start the local VeChain Thor blockchain:
   ```bash
   yarn contracts:solo-up
   ```

2. Deploy contracts to the local network:
   ```bash
   yarn contracts:deploy:solo
   ```

3. Set up environment variables:
   - Create `.env.development.local` in `apps/backend`
   - Add your `OPENAI_API_KEY`

4. Start the development servers:
   ```bash
   yarn dev
   ```

5. Open VeWorld browser and navigate to [http://localhost:8082/](http://localhost:8082/)

## 🔐 Security Features

JusCat implements several security measures:

- **Browser Detection**: Application only runs in VeWorld browser
- **Anti-Inspection Protection**: Prevents developer tools usage
- **Content Security Policy**: Restricts resource loading
- **Secure Communication**: Protected API endpoints

## ⚠️ Disclaimer

This application is designed to work exclusively with VeWorld browser. Attempting to access it through other browsers or bypass security measures is not supported and may result in application failure.

---

© 2025 JusCat. All rights reserved.