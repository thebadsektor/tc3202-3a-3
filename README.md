# TC-3202 Smart Energy Consumption Tracker

![Project Banner]()


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
Describe the project in detail. Include:

This project addresses the growing need for efficient energy management in commercial settings. It leverages modern web and machine learning technologies to provide users with detailed insights into their energy consumption. The application is aimed at small-scale company owners, building managers, and environmentally conscious individuals who want to monitor and reduce their energy expenses. By integrating historical electricity rate data and standard consumption values, the project not only predicts future bills but also offers personalized energy-saving tips, that can be used to significantly save budget and reduce environmental footprint.

## Objectives
State the main objectives of the capstone project, such as:
- Develop a solution for [problem].
- Implement features to [goal].
- Test and validate [key aspect].

## Features
- Smart Energy Consumption Calculator: Users input details about their appliances (quantity and estimated duration of usage) to calculate the total energy consumption based on standard consumption values.
- Bill Prediction with LSTM Model: The system retrieves the calculated energy consumption data and processes it through an (LSTM/Regression) machine learning model trained on historical electricity rate data, providing users with an estimated electricity bill.
- Energy-Saving Recommendations: Based on the consumption breakdown, the system generates personalized optimization tips—such as reducing aircon usage, and switching to LED lighting help users reduce their overall energy consumption.

## Technologies Used
Mention the tools, frameworks, and technologies used in the project:
- Programming Languages: [Python, JavaScript]
- Frameworks/Libraries: [eReact, Django]
- Databases: [Firebase Realtime Database]
- Other Tools: [Git]

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
3. **Configure environment variables (if any)**: Provide instructions for setting up .env files or any other required configurations.
   ```bash
   git clone https://github.com/your-repo-url.git
   ```
4. **Run the project:**
   - For web projects:
   ```bash
   npm run dev
   ```
   - For backend services:
   ```bash
   python manage.py runserver
   ```

**Note:** If your project has external depencies like XAMPP, MySQL, special SDK, or other environemnt setup, create another section for it.

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
Explain the structure of the project directory. Example:
```bash
.
├── 📂 src/
│   ├── 📂 components/
│   │   ├── <component>
│   │   ├── <anotherComponent>
│   │   └── ...
│   ├── 📂 pages/
│   └── 📂 utils/
├── 📂 public/
├── 📂 tests/
├── .env.example
├── package.json
└── README.md
```

## Contributors

List all the team members involved in the project. Include their roles and responsibilities:

- **Collado Jr., Iner Jaime** : Frontend Developer, UI/UX Designer
- **Ignacio, Sweet Katrina Bianca**: Frontend Developer, UI/UX Designer
- **Maestro, Jomar**: Backend Developer
-  **Vallejo, Rouin**: Machine Learning Developer

## Project Timeline

Outline the project timeline, including milestones or deliverables. Example:

- **Week 1-2 (February 3)**: Concept Paper Proposal.
- **Week 2-7**: Research
- **Week 3-5 (February 25)**: Consultation
- **Week 5-6 (March 10)**: Plan User Journey & User Journey Refinement
- **Week 8-9 (March 18)**: Respository Preparation & Research 
   - Related Repositories

## Changelog

### [Version 1.0.0] - 2024-09-07
- Initial release of the project.
- Added basic functionality for [Feature 1], [Feature 2], and [Feature 3].

### [Version 1.1.0] - 2024-09-14

- Improved user interface for [Feature 1].
- Fixed bugs related to [Feature 2].
- Updated project documentation with setup instructions.

### [Version 1.2.0] - 2024-09-21
- Added new functionality for [Feature 4].
- Refactored codebase for better performance.
- Added unit tests for [Feature 3] and [Feature 4].


## Acknowledgments

Acknowledge any resources, mentors, or external tools that helped in completing the project.

This project was built from [Original Project Name](https://github.com/username/original-repo), created by [Original Author's Name]. You can view the original repository [here](https://github.com/username/original-repo).

## License

Specify the project's license. For starters, adapt the license of the original repository.

