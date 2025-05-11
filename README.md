# TC-3202 Smart Energy Consumption Tracker

![logo namin (1)](https://github.com/user-attachments/assets/b4dade02-dfe8-4f63-98b3-8cd57d98c220)



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
- Programming Languages: [Python, JavaScript]
- Frameworks/Libraries: [React, Django]
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
   cd frontend/seconsumptiontracker-app
   npm run dev
   ```
   - For backend services:
   ```bash
   cd backend/
   python manage.py runserver
   ```

## Usage Instructions

![image](https://github.com/user-attachments/assets/8db1a0c3-0082-47d5-8535-532e844aac9d)

This shows the landing page of wattify, the first thing that the user will see.

![image](https://github.com/user-attachments/assets/18c082c2-4cb3-4941-b9f6-4d9201fda3a4)

This shows the sign-up page of the Wattify. First, user may either create an account by filling up the required form which is their email and password or continue to Wattify using their google accounts. By choosing to fill up the form for registration, note that it will require the user to verify their email to continue with the app.

![image](https://github.com/user-attachments/assets/ec75918f-93ec-43df-907f-fcf4f306806c)

This shows the login page of Wattify. Once the user is done creating and verifying the account user may now proceed to login page and login using the verified account. Once again user may also use user’s google account to continue to the app.

![image](https://github.com/user-attachments/assets/0ec51f67-a59a-490f-8c32-e58886bee8d3)

This shows the dashboard of Wattify. After successfully logging in, user will be redirected to the dashboard where user can see the historical electricity rates over the past few years, user can choose to view this either monthly or yearly trends (yearly shows the average rate along with min and max rate in that year. In dashboard, user can also view their predictions so they can monitor them over time.

![image](https://github.com/user-attachments/assets/d29b4217-fb0a-4f8d-b431-ea871fed8aff)
![image](https://github.com/user-attachments/assets/7a4985f9-96e9-4fb4-905a-5d403420914a)

These photos show the appliance tab under profile. In this tab, user can manually set up the appliance sets by adding multiple appliance/gadgets into one set. This feature works like a folder, so everything is well organized when user decided to use them. Later in this page the user will be able to see the importance of making appliance sets.

![image](https://github.com/user-attachments/assets/1d71494b-0188-4fe1-9e43-49173edc3c6b)

This shows adding multiple appliances into appliance set named “Kitchen Appliances”. After successfully creating a set, click the eye icon next to it to add appliances, user can list as many as user wants. The “x” icon indicates that the appliances is missing some details, by clicking the edit icon next to it, it will open a modal requesting for wattage and usage of the selected appliance.

![image](https://github.com/user-attachments/assets/c32b784d-2245-4b43-ac98-b6250d5220c8)

This shows how to edit each appliance’s usage and wattage. This modal requires the user to fill up, user should input the number of hours, days, and weeks that the appliance is being used. For wattage, user can either manually type the wattage or ask the WattBot to analyze the wattage of user’s appliance, this is in case the user doesn’t know the wattage of the appliance.
Another Screenshot

![image](https://github.com/user-attachments/assets/509bbd88-aef1-4be1-9f84-c3d21506155f)

This shows the Energy Consumption Calculator, User can either manually input each appliance or click the import button to import the appliance sets that the user created in profile. User will choose either residential or for small business since rate may vary. After importing the desired set to be computed, hit the calculate button and output will be shown to the user.

![image](https://github.com/user-attachments/assets/5ce19032-d32a-4394-a4ba-f235f17f9016)

This shows the calculation output after clicking the calculate button, the system will show each appliance’s details about the cost per hour, day, and per week, user will also be able to see the total cost of all appliances. After analyzing the output, user can save the result by clicking the Save Result button.

![image](https://github.com/user-attachments/assets/cffe3814-d343-40b0-b127-ef00319e41a3)
![image](https://github.com/user-attachments/assets/4c402703-9462-4601-9065-4b723bb21735)
![image](https://github.com/user-attachments/assets/4f8a201f-718d-46f1-8a51-5fd328483538)

These figures show the Bill prediction feature page; user will click the import button to access the appliance sets created in profile. User can choose a month to predict the rate, note that only 3 months ahead can only be predicted by the system, this is due to avoid giving low accuracy on prediction for longer months ahead. After importing, the appliances will be shown below and user can start the prediction by clicking the calculate button.

![image](https://github.com/user-attachments/assets/766606b5-85d0-4648-8894-77100bdd8302)

This shows the output from the prediction for May 2025, the output includes the user’s monthly kWh consumption and the predicted electricity rate for the month of May, the system will also provide the predicted bill for May. User can also compare the current predicted bill to the past calculations where user can see if the prediction is higher or lower than the past calculations. After analyzing and comparing, user can choose to save the prediction outcome and use them to compare for future predictions.

![image](https://github.com/user-attachments/assets/0a50a277-55e9-4b18-bcfc-8cbd6406f4c6)
![image](https://github.com/user-attachments/assets/db82dd9f-5515-470c-9149-291c0585243f)
![image](https://github.com/user-attachments/assets/0255dcef-f600-4824-a747-b696ff5daa76)

These photos show the Energy Saving Recommendation page, in this page user will click the import button to open a modal then user can select from the saved calculations, after selecting and importing, the selected calculation will be shown below. Once the user fully reviews the calculations, user can now start to hit the get recommendation button. The system will analyze each appliance’s wattage and usage to give an actionable solution on how to save energy.

![image](https://github.com/user-attachments/assets/ee78220b-acd1-4b28-b9a8-d57e989bc25e)

This shows the recommendation provided by our system based on the usage and wattage of each user’s appliance.

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

- **Collado Jr., Iner Jaime** : Frontend Developer, UI/UX Designer
- **Ignacio, Sweet Katrina Bianca**: Frontend Developer, UI/UX Designer
- **Maestro, Jomar**: Backend Developer
-  **Vallejo, Rouin**: Machine Learning Developer
-  **Villaran, Gerald**: Adviser

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

This project would not be put into fruition without the supervision of our instructors, Mr. Gerald Villaran, Ms. Mary Grace Guillermo, and Ms. Joville Avila. The machine learning model was created through online public resources provided by MERALCO, BSP, and PSA. We are also grateful to MERALCO and PSA for their prompt responses to our queries.
## License

School project and was not built upon a prior repository

