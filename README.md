# TC-3202 Smart Energy Consumption Tracker

![Project Banner](![logo namin](https://github.com/user-attachments/assets/85d8100a-1161-4d28-83a4-9a7a6a9b4657)
)


## Table of Contents
- [Introduction](#introduction)
- [Project Overview](#project-overview)
- [Objectives](#objectives)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Usage Instructions](#usage-instructions)
- [Project Structure](#project-structure)
- [Contributors](#contributors)
- [Changelog](#changelog)
- [Acknowledgments](#acknowledgments)
- [License](#license)

---

## Introduction
The Smart Energy Consumption Tracker is a web application that aims to assist users, especially small-scale companies manage their energy usage efficiently. It is an intelligent tool to track their electricity usage, predict future electricity bills, and offer personalized recommendations to reduce costs. By enabling users to input appliance data and usage patterns, the system calculates energy consumption, predicts electricity bills using a machine learning model, and offers actionable insights to optimize energy use to cut companies' costs.


## Project Overview

This project addresses the growing need for efficient energy management in commercial settings. It leverages modern web and machine learning technologies to provide users with detailed insights into their energy consumption. The application is aimed at small-scale company owners, building managers, and environmentally conscious individuals who want to monitor and reduce their energy expenses. By integrating historical electricity rate data and standard consumption values, the project not only predicts future bills but also offers personalized energy-saving tips, that can be used to significantly save budget and reduce environmental footprint.

## Objectives
The main objectives of the project:
- Develop a solution for energy-saving and energy efficiency problems.
- Implement features to track energy consumption and get recommendations in lowering costs.

## Features
- Smart Energy Consumption Calculator: Users input details about their appliances (quantity and estimated duration of usage) to calculate the total energy consumption based on standard consumption values.
- Bill Prediction with SARIMAX and XGBoost Model: The system retrieves the calculated energy consumption data and processes it through an (XGBoost) machine learning model trained on historical electricity rate data, providing users with an estimated electricity bill.
- Energy-Saving Recommendations: Based on the consumption breakdown, the system generates personalized optimization tips—such as reducing aircon usage, and switching to LED lighting help users reduce their overall energy consumption.

## Technologies Used
Mention the tools, frameworks, and technologies used in the project:
- Programming Languages: [Python, JavaScript]
- Frameworks/Libraries: [eReact, Django]
- Databases: [Firebase Realtime Database]
- Other Tools: [Git, VSCode]

## Setup and Installation
Step-by-step instructions for setting up the project locally.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thebadsektor/tc3202-3a-3.git
   ```
2. **Install dependencies:**
	- If using `npm`:
   ```bash
   cd frontend/seconsumptiontracker-app
   npm install
   ```
   - If using `pip` (for Python projects):
   ```bash
   cd backend/
   python -m venv .venv
   source .venv/Scripts/activate
   pip install -r requirements.txt
   ```
3. **Configure environment variables (if any)**:
   ```bash
   source .venv/Scripts/activate
   ```
4. **Run the project:**
   - For frontend services:
   ```bash
   npm run dev
   ```
   - For backend services:
   ```bash
   python manage.py runserver
   ```

## Usage Instructions
Provide detailed instructions on how to use the project after setup:
- How to access the application.
- Example commands or API calls (if applicable).
- Databases: [e.g., MySQL, MongoDB, etc.]
- Screenshots or GIFs showcasing key functionalities (optional).

![UI Placeholder](https://via.placeholder.com/1200x700.png?text=UI+Placeholder)

Another Screenshot


![UI Placeholder](https://via.placeholder.com/1200x700.png?text=UI+Placeholder)

## Project Structure
```bash
.
├─ README.md
├─ 📂 backend
│  ├─ .gitignore
│  ├─ 📂 auth_app
│  │  ├─ __init__.py
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ 📂 migrations
│  │  │  ├─ 0001_initial.py
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  └─ views.py
│  ├─ 📂backend
│  │  ├─ __init__.py
│  │  ├─ asgi.py
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  └─ wsgi.py
│  ├─ 📂 data
│  │  └─ enhanced_kWh_800_edited_records.csv
│  ├─ db.sqlite3
│  ├─ firebase.py
│  ├─ 📂 geminiApi
│  │  ├─ __init__.py
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ 📂 migrations
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  └─ views.py
│  ├─ gemini_service.py
│  ├─ manage.py
│  ├─ 📂 ml_predict
│  │  ├─ __init__.py
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ 📂 migrations
│  │  │  └─ __init__.py
│  │  ├─ 📂 ml
│  │  │  └─ feature_forecast.py
│  │  ├─ models.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  └─ views.py
│  ├─ 📂 models
│  │  ├─ ensemble_electricity_bill_modelC.pkl
│  │  ├─ feature_scaler.pkl
│  │  ├─ feature_scaler_adj2.pkl
│  │  ├─ lgb_total_bill_model.pkl
│  │  ├─ lgb_total_bill_model_adj.pkl
│  │  ├─ xgb_total_bill_model.pkl
│  │  ├─ xgb_total_bill_model_adj.pkl
│  │  ├─ xgb_total_bill_model_tuned.pkl
│  │  └─ xgb_total_bill_model_tuned_may.pkl
│  └─ requirements.txt
└─ 📂 frontend
   └─ 📂 seconsumptiontracker-app
      ├─ .gitignore
      ├─ README.md
      ├─ components.json
      ├─ eslint.config.js
      ├─ index.html
      ├─ jsconfig.json
      ├─ package-lock.json
      ├─ package.json
      ├─ postcss.config.cjs
      ├─ 📂 public
      │  ├─ 📂 assets
      │  │  ├─ history.png
      │  │  ├─ icons8-goa.png
      │  │  ├─ save-energy.png
      │  │  └─ turbine.png
      │  ├─ vite.svg
      │  └─ wattify.png
      ├─ 📂 src
      │  ├─ App.css
      │  ├─ App.jsx
      │  ├─ 📂 api
      │  │  └─ predict.js
      │  ├─ 📂 assets
      │  │  ├─ 📂 about-images
      │  │  │  └─ calculator.png
      │  │  ├─ calculator.png
      │  │  ├─ 📂 datas
      │  │  │  └─ pastRates.json
      │  │  ├─ 📂 fonts
      │  │  │  ├─ Helvetica.ttf
      │  │  │  └─ Nura-Light.ttf
      │  │  ├─ hero-img.jpg
      │  │  ├─ hero-img.png
      │  │  ├─ 📂 home-images
      │  │  │  ├─ calculator.png
      │  │  │  ├─ features.png
      │  │  │  ├─ features1.png
      │  │  │  ├─ login.png
      │  │  │  ├─ meralco-rates.jpg
      │  │  │  ├─ meralco-rates2.jpg
      │  │  │  ├─ meralco-rates3.jpg
      │  │  │  ├─ meralco-rates4.png
      │  │  │  ├─ meralco-rates5.jpg
      │  │  │  ├─ meralco-rates6.jpg
      │  │  │  ├─ output.png
      │  │  │  ├─ prediction.png
      │  │  │  ├─ prediction1.png
      │  │  │  ├─ prediction2.png
      │  │  │  └─ usage.png
      │  │  ├─ icons8-goa.png
      │  │  ├─ react.svg
      │  │  ├─ save-energy.png
      │  │  ├─ 📂 svg
      │  │  │  ├─ blob.svg
      │  │  │  ├─ block.svg
      │  │  │  ├─ wave.svg
      │  │  │  ├─ wavebg.svg
      │  │  │  └─ waveus.svg
      │  │  ├─ wattify-logo.png
      │  │  └─ wattify.png
      │  ├─ 📂 components
      │  │  ├─ ApplianceItemsForProfile.jsx
      │  │  ├─ Footer.jsx
      │  │  ├─ ForgotPasswordForm.jsx
      │  │  ├─ Layout.jsx
      │  │  ├─ Navigation.jsx
      │  │  ├─ PastRatesGraph.jsx
      │  │  ├─ PredictedElectricityRateGraph.jsx
      │  │  ├─ Prediction.jsx
      │  │  ├─ PrivateRoute.jsx
      │  │  ├─ Sidebar.jsx
      │  │  ├─ Tooltip.jsx
      │  │  ├─ login-form-demo.jsx
      │  │  ├─ signup-form-demo.jsx
      │  │  └─ 📂 ui
      │  │     ├─ alert-dialog.jsx
      │  │     ├─ avatar.jsx
      │  │     ├─ button.jsx
      │  │     ├─ card-hover-effect.jsx
      │  │     ├─ click-spark.jsx
      │  │     ├─ hero-parallax.jsx
      │  │     ├─ input.jsx
      │  │     ├─ label.jsx
      │  │     ├─ link-preview.jsx
      │  │     ├─ moving-border.jsx
      │  │     ├─ sonner.jsx
      │  │     ├─ sticky-scroll-reveal.jsx
      │  │     └─ timeline.jsx
      │  ├─ firebase.js
      │  ├─ 📂 lib
      │  │  └─ utils.js
      │  ├─ main.jsx
      │  └─ 📂 pages
      │     ├─ AboutPage.jsx
      │     ├─ Appliance.jsx
      │     ├─ BillCalcuOutput.jsx
      │     ├─ BillCalculator.jsx
      │     ├─ BillPredictionPage.jsx
      │     ├─ Dashboard.jsx
      │     ├─ HeroPage.jsx
      │     ├─ History.jsx
      │     ├─ ProfilePage.jsx
      │     ├─ RecommendationPage.jsx
      │     └─ UserDashboardPage.jsx
      ├─ tailwind.config.js
      └─ vite.config.js
```


## Contributors

List all the team members involved in the project. Include their roles and responsibilities:

- **Collado Jr., Iner Jaime** : Frontend Developer, UI/UX Designer
- **Ignacio, Sweet Katrina Bianca**: Frontend Developer, UI/UX Designer
- **Maestro, Jomar**: Backend Developer
-  **Vallejo, Rouin**: Machine Learning Developer

## Project Timeline

- **Week 1-2 (February 3)**: Concept Paper Proposal.
- **Week 2-7**: Research
- **Week 3-5 (February 25)**: Consultation
- **Week 5-6 (March 10)**: Plan User Journey & User Journey Refinement
- **Week 8-9 (March 18)**: Respository Preparation & Research 
- **Week 10-12 (April 10)**: Development of at least 50% of the application with Machine Learning integration
- **Week 13 (April 14)**: Initial Project Presentation
- **Week 14 (April 26)**: Continuation of development and paper Chapter I completion
- **Week 15 (May 3)**: Continuation of development and paper Chapter II completion
- **Week 16 (May 11)**: Finalisation of project, final tests, and completion of paper Chapter III

## Changelog

### [Version 1.0.0] - 2025-04-12
- Initial release of the project.
- Added basic functionality for Consumption Calculator and Bill Prediction.

### [Version 1.1.0] - 2024-5-5

- Improved overall user interface.
- Added functionality for Energy-saving recommendations.
- Updated project documentation with setup instructions.


## Acknowledgments

Acknowledge any resources, mentors, or external tools that helped in completing the project.

This project would not be put into fruition without the supervision of our instructors, Mr. Gerald Villaran, Ms. Mary Grace Guillermo, and Ms. Joville Avila. The machine learning model was created through online public resources provided by MERALCO, BSP, and PSA. We are also grateful to MERALCO and PSA for their prompt responses to our queries.
## License

Specify the project's license. For starters, adapt the license of the original repository.

