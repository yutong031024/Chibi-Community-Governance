# Chibi Community Governance Platform

A GIS-based community governance platform developed for Chibi City, integrating citizen feedback collection, service facility mapping, and spatial data visualization to support community management and livelihood service improvement.

## 🌐 Live Demo

**Deployed Website (Render):**

[https://chibi-community-governance.onrender.com]

---

## 📌 Project Overview
The **Chibi Community Governance Platform** is a web-based GIS application designed to support community-level governance through spatial data visualization and citizen participation.

The platform combines:
- Citizen feedback collection
- Interactive GIS mapping
- Public service facility visualization
- Administrative management tools
- Data statistics dashboard

By integrating geographic information technologies with community data, the platform helps identify community needs, visualize service accessibility, and provide data support for more effective local governance.

---

# ✨ Key Features
## 1. Citizen Feedback System

Residents can submit feedback regarding community issues through an interactive map interface.

Features include:

- Selecting locations on the map
- Categorizing issues
- Adding descriptions
- Uploading images
- Recording contact information
- Tracking feedback status

Feedback information is stored and managed through the backend database.

---

## 2. Interactive Service Facility Map

The platform integrates Points of Interest (POI) data to visualize important livelihood service facilities.

Currently supported categories include:

| Category | Description |
|---|---|
| Medical Facilities | Hospitals, clinics, healthcare services |
| Transportation | Bus stops, parking facilities |
| Commercial Facilities | Supermarkets, markets, shopping services |
| Logistics Facilities | Delivery points and logistics services |
| Public Facilities | Public toilets, service centres |
| Educational Facilities | Schools and education services |
| Cultural Facilities | Museums, cultural venues |
| Environmental Facilities | Waste management services |
| Accessibility Facilities | Barrier-free facilities |
| Other Services | Other community facilities |

Users can enable or disable different facility layers to explore spatial distribution.

---

## 3. Administrative Dashboard

An administrative interface is provided for community managers.

Functions include:

- Viewing submitted feedback
- Updating feedback status
- Managing feedback records
- Viewing uploaded images
- Monitoring facility distribution
- Viewing statistical summaries

The dashboard supports data-driven community management.

---

## 4. Spatial Data Visualization

The platform provides interactive map-based visualization using:

- Point markers for facilities
- Category-based icons
- Layer controls
- Location-based feedback visualization

---

# 🏗 System Architecture

```

                           Residents
                               |
                               ↓
                      Web Application
                               |
                               ↓
                       Flask Backend API
                               |
          ----------------------------------------
          |                                      |
          ↓                                      ↓
 PostgreSQL Database                       Cloudinary
          |                                (Images)
          |
          ↓
 Administrative Dashboard



                       AMap POI API
                              |
                              ↓
                      Facility Data Pipeline
                              |
                              ↓
                  Service Facility Database
                              |
                              ↓
                     Interactive GIS Map



# 🛠 Technology Stack

## Frontend
- HTML
- CSS
- JavaScript
- AMap JavaScript API
- Chart.js

## Backend
- Python
- Flask
- Flask SQLAlchemy

## Database
- PostgreSQL

## External Services
- AMap API  
  - JavaScript API for interactive mapping
  - POI API for service facility data collection

- Cloudinary
  - Image storage and management

## Deployment
- Render Web Service
- Render PostgreSQL Database

---

# 📊 Data Sources

## Service Facility Data

Service facility locations are collected through:

**AMap POI API**

Categories include:

- Healthcare
- Transportation
- Commercial services
- Education
- Culture
- Public facilities
- Logistics
- Environmental services

---

## Citizen Feedback Data

Feedback data is collected directly through the platform.

Each record contains:

- Feedback category
- Description
- Location
- Timestamp
- Status
- Uploaded images (if provided)

---

# 📂 Project Structure

```
Chibi-Community-Governance/
│
├── app/
│   ├── models.py              # Database models
│   ├── routes/                # API routes
│   ├── amap_service.py        # AMap POI integration
│   └── ...
│
├── frontend/
│   └── admin/
│       ├── admin.html         # Admin interface
│       ├── admin.js           # Frontend logic
│       └── admin.css          # Styling
│
├── test_import_facility.py    # POI data import script
│
├── requirements.txt
│
└── README.md
