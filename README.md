# 🎒 Aristobox PWA

> Progressive Web App for offline educational kit order collection, optimized for field sales teams on tablets.

## 🚀 Overview

Aristobox is a robust Progressive Web App designed for educational sales representatives to collect school orders offline. The app provides a seamless experience for demonstrating educational kits, capturing customer information, and managing orders without requiring internet connectivity.

### ✨ Key Features

- **🔄 Offline-First Architecture** - Works completely without internet connection
- **📱 Tablet-Optimized UI** - Touch-friendly interface designed for Lenovo tablets
- **🎯 Educational Kit Catalog** - Pre-loaded with 6 subject-specific kit categories
- **👥 Customer Management** - Quick school registration and contact capture
- **📊 Order Tracking** - Status management (Pending → Confirmed → Delivered → Exported)
- **📤 Data Export** - CSV export functionality for order processing
- **🎨 Modern UI** - Beautiful gradient interface with Shadcn/ui components
- **⚡ Fast Performance** - Optimized for field conditions and battery life

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **UI Framework**: Tailwind CSS + Shadcn/ui
- **PWA**: Vite PWA Plugin with Workbox
- **Database**: IndexedDB with Dexie.js
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser with PWA support
- Android tablet (recommended: Lenovo Pad series)

## 🚀 Quick Start

### Installation

```
  git clone https://github.com/jkjitendra/aristobox.git
  cd aristobox-field-app
  npm install
  npm run dev
```

## 📊 Data Management

### Local Storage

- **Orders** - Stored in IndexedDB for offline access
- **Kit Catalog** - Pre-seeded on first app load
- **Customer Data** - Automatically saved with timestamps

### Export Format

CSV exports include:

- Order ID, School Name, Contact Person
- Phone, Area, Kit Details, Quantities
- Pricing, Order Date, Status

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
