# GM Super Service Booking Manager

A comprehensive, mobile-first booking management system designed specifically for GM Super Service Matale. This application streamlines vehicle scheduling, financial tracking, and operational analytics with a secure, modern, dark-themed dashboard.

## 🚀 Features

- **Secure Authentication:** Protected routes with a robust login portal and "Remember Me" functionality.
- **Interactive Calendar:** Visual, color-coded calendar for managing vehicle bookings (NB 8087, NC 7573, KX 2422) built with `react-big-calendar`.
- **Conflict Prevention:** Smart logic to prevent double-booking the same vehicle on the same day.
- **Financial Analytics:** Real-time dashboard and charts tracking Total Revenue, Advances, Balance, Total Distance, and Average Fuel Price.
- **Export Capabilities:** Instantly generate and download professional PDF reports or Excel spreadsheets of your booking history.
- **Mobile-First Design:** Fully responsive layout with bottom navigation for mobile phones and a sleek sidebar for desktops.
- **Local Persistence:** All bookings and user sessions are securely stored in the browser's Local Storage.

## 🛠 Technology Stack

- **Frontend Framework:** React.js (Vite)
- **Styling:** Tailwind CSS (Custom Dark Luxury Theme)
- **Routing:** React Router DOM
- **Form Management & Validation:** React Hook Form & Zod
- **Calendar Visualization:** React Big Calendar & date-fns
- **Data Visualization:** Recharts
- **Exporting Tools:** SheetJS (Excel) & jsPDF + autoTable (PDF)
- **Alerts:** SweetAlert2

## 📦 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Maheesh218a/gm-booking-site.git
   cd gm-booking-site
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🌍 Deployment

This project is optimized for completely free, zero-configuration deployment on Vercel.

1. Create a [Vercel](https://vercel.com/) account.
2. Click **Add New Project**.
3. Import this GitHub repository.
4. Leave all default settings and click **Deploy**.

## 🏢 About the Company

**Company Name:** GM Super Service Matale  
**Slogan:** Travel is Ultimate Power  
**Contact:** 0773181037
