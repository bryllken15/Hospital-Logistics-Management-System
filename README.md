# Logistics 1 Smart Hospital Supply Chain & Procurement Management System

A comprehensive hospital logistics management system with role-based access control, RFID simulation, and multiple specialized modules for managing supply chain operations.

## 🏥 System Overview

This system provides a complete solution for hospital logistics management with the following subsystems:

- **Smart Warehousing (SWS)** - Inventory management and RFID tracking
- **Procurement & Sourcing Management (PSM)** - Purchase orders and supplier management  
- **Project Logistics Tracker (PLT)** - Project-based logistics coordination
- **Asset Lifecycle & Maintenance (ALMS)** - Equipment tracking and maintenance
- **Document Tracking & Records (DTRS)** - Document verification and archiving

## 👥 User Roles & Access

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Admin | admin | admin123 | Full system access, user management |
| Manager | manager1 | manager123 | Approval functions, analytics |
| Employee | employee1 | employee123 | Warehouse operations, RFID scanning |
| Procurement Staff | procurement1 | procurement123 | Purchase orders, supplier management |
| Project Manager | project1 | project123 | Project tracking, resource allocation |
| Maintenance Staff | maintenance1 | maintenance123 | Asset management, maintenance logs |
| Document Analyst | document1 | document123 | Document verification, record keeping |

## 🚀 Features

### 🔐 Authentication & Authorization
- Role-based access control
- Secure login with predefined user accounts
- User activity logging and monitoring
- Admin user management capabilities

### 📱 Modern UI/UX
- Responsive design for desktop, tablet, and mobile
- Modern split-screen login page
- Professional dashboard layouts
- Interactive charts and data visualization

### 📊 RFID Simulation
- Simulated RFID scanning functionality
- Manual RFID code entry
- Visual scan animations
- RFID tracking across all relevant modules

### 📈 Analytics & Reporting
- Real-time statistics and metrics
- Interactive charts using Recharts
- Export capabilities for reports
- Activity logs and audit trails

### 🛠️ Module-Specific Features

#### Admin Dashboard
- User management and role assignment
- System activity monitoring
- User status control (activate/deactivate)
- System overview and health metrics

#### Manager Dashboard
- Procurement request approval
- Project oversight and monitoring
- Analytics and reporting
- Department performance tracking

#### Employee Dashboard (SWS)
- Inventory management
- RFID scanning for items
- Stock level monitoring
- Delivery tracking

#### Procurement Dashboard (PSM)
- Purchase order creation
- Supplier management
- Delivery tracking
- Cost analysis and reporting

#### Project Manager Dashboard (PLT)
- Project creation and management
- Resource allocation
- Timeline tracking
- Budget monitoring

#### Maintenance Dashboard (ALMS)
- Asset tracking with RFID
- Maintenance scheduling
- Equipment condition monitoring
- Repair history tracking

#### Document Analyst Dashboard (DTRS)
- Document upload and verification
- Delivery receipt processing
- Record archiving
- Compliance tracking

## 🛠️ Technology Stack

- **Frontend**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography
- **Routing**: React Router for navigation
- **State Management**: React Context API for authentication
- **Local Storage**: For data persistence and activity logging

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logistics1-hospital-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Use any of the demo credentials provided above to log in

## 🏗️ Project Structure

```
src/
├── components/
│   ├── shared/
│   │   ├── DashboardLayout.js      # Common dashboard wrapper
│   │   ├── StatCard.js            # Statistics display component
│   │   ├── DataTable.js           # Reusable data table
│   │   └── RFIDScanner.js         # RFID simulation component
│   ├── dashboards/
│   │   ├── AdminDashboard.js      # Admin control center
│   │   ├── ManagerDashboard.js    # Manager overview
│   │   ├── EmployeeDashboard.js   # Warehouse operations
│   │   ├── ProcurementDashboard.js # Purchase management
│   │   ├── ProjectManagerDashboard.js # Project tracking
│   │   ├── MaintenanceDashboard.js # Asset management
│   │   └── DocumentAnalystDashboard.js # Document handling
│   ├── LoginPage.js               # Authentication page
│   └── LoadingSpinner.js          # Loading component
├── context/
│   └── AuthContext.js             # Authentication context
├── App.js                         # Main application component
├── index.js                       # Application entry point
└── index.css                      # Global styles
```

## 🔧 Key Components

### RFID Simulation
The system includes a comprehensive RFID simulation that mimics real-world RFID scanning:
- **Visual feedback**: Animated scanning process
- **Manual entry**: Alternative to simulated scanning
- **Cross-module integration**: RFID tracking across all relevant modules
- **Activity logging**: All RFID scans are logged for audit purposes

### Role-Based Access Control
Each user role has specific permissions and dashboard access:
- **Admin**: Full system access, user management
- **Manager**: Approval functions, analytics, oversight
- **Staff Roles**: Module-specific access and functionality

### Data Management
- **Local Storage**: All data is persisted locally for demo purposes
- **Mock Data**: Realistic sample data for all modules
- **Activity Logging**: Comprehensive audit trail of all user actions

## 📱 Responsive Design

The system is fully responsive and works seamlessly across:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized layout for touch interaction
- **Mobile**: Streamlined interface for on-the-go access

## 🎯 Demo Features

### RFID Scanning Demo
1. Log in as any user with RFID access (Employee, Maintenance, Procurement)
2. Navigate to the RFID scanner section
3. Click "Scan RFID Tag" to simulate scanning
4. Or manually enter an RFID code
5. View the scan results and item information

### User Management Demo
1. Log in as Admin (admin/admin123)
2. View all users in the User Management section
3. Toggle user status (activate/deactivate)
4. View user details and activity logs
5. Monitor system activities in real-time

### Module-Specific Demos
Each dashboard provides realistic workflows:
- **Procurement**: Create purchase orders, manage suppliers
- **Warehouse**: Manage inventory, track deliveries
- **Projects**: Create projects, assign resources
- **Maintenance**: Schedule maintenance, track assets
- **Documents**: Upload and verify documents

## 🔮 Future Enhancements

Potential improvements for production deployment:
- **Database Integration**: Replace local storage with a proper database
- **Real RFID Hardware**: Integrate with actual RFID scanners
- **Email Notifications**: Real email alerts and notifications
- **Advanced Analytics**: More sophisticated reporting and insights
- **API Integration**: Connect with external systems and suppliers
- **Mobile App**: Native mobile application for field operations

## 📄 License

This project is created for educational and demonstration purposes as part of a school project management course.

## 👨‍💻 Development

Built with modern React practices:
- Functional components with hooks
- Context API for state management
- Responsive design with Tailwind CSS
- Component-based architecture
- Clean, maintainable code structure

---

**Note**: This is a demonstration system created for educational purposes. All data is simulated and stored locally. For production use, proper database integration, security measures, and real RFID hardware would be required.
