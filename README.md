

## This is the **web app version (for PC)** of my Fever Tracker project.  
The original project was first built in **Python**, where it logged data into Excel and plotted fever charts.  
Later, I extended it into this web-based version using React, Vite, and TypeScript.

## Features
- Form for entering temperature, feeling, medicine, and notes.
- Table to display log entries.
- Temperature vs. time chart.
- Built with React + Vite + TypeScript.

## [![Demo Video](https://img.youtube.com/vi/trcBuDE0DSM/0.jpg)](https://www.youtube.com/watch?v=trcBuDE0DSM)

## Allows you to enter data and graph it.
<img width="1682" height="896" alt="image" src="https://github.com/user-attachments/assets/3a6e3d55-27d1-4014-a328-181c535a38bc" />
## You can record your medicines taken, Extra Remarks and health conditon at every time.
<img width="1531" height="808" alt="image" src="https://github.com/user-attachments/assets/c47f724c-d7d4-491d-8529-7c6df5a76859" />
## Get the history Also Recorded
<img width="1365" height="473" alt="image" src="https://github.com/user-attachments/assets/bf123cad-ff0a-48cb-8e7d-71548478d357" />


## Prerequisites
- Node.js (download from https://nodejs.org)
- npm (comes with Node.js)

## Running the App on your Windows PC
1. Extract the project folder (if it is in zip format).
2. Open a terminal in the `fever-tracker` folder (where `package.json` is located).
3. Install dependencies:
   ```bash
   npm install
Start the development server:

bash
Always show details

Copy code
npm run dev
Open the link shown in the terminal, usually http://localhost:5173.

Building for Production
To create an optimized build of the app:

bash
Always show details

Copy code
npm run build
This will create a dist/ folder with static files that can be deployed.

Converting to an Android APK (Optional)
You can wrap this web app into a native Android APK using Capacitor.

Install Capacitor in your project:

bash
Always show details

Copy code
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
Build the web app:

bash
Always show details

Copy code
npm run build
This creates a dist/ folder.

Copy the build into the Capacitor project:

bash
Always show details

Copy code
npx cap copy
npx cap open android
Android Studio will open. From there, build the APK:

Go to Build → Build Bundle(s) / APK(s) → Build APK(s).

The APK can be installed on an Android phone.

Project Background
Original version was made in Python (Excel logging + Matplotlib plots).

This is the web app version (for PC browsers), providing a frontend for easier interaction.

As an experiment, it can also be wrapped into an Android APK using Capacitor.

Author
Aditya Narayan Singh

"""

Save the updated README
node_readme_updated_path = "/mnt/data/README_Node_FeverTracker_PC.md"
with open(node_readme_updated_path, "w") as f:
f.write(node_readme_updated)

node_readme_updated_path

Always show details

Copy code
Result
'/mnt/data/README_Node_FeverTracker_PC.md'
Aditya, I’ve updated the README to clearly state that this is the web app version (for PC) and that the original was first built in Python.

