# AI Calculator

This repository contains the complete code for the AI Calculator application, featuring both the frontend built with React and the backend developed in Python. This application provides an interactive user interface for performing calculations while communicating seamlessly with backend APIs.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

### Frontend
- User-friendly interface for performing calculations
- Responsive design for optimal viewing on various devices
- Integration with the Python backend for real-time calculations

### Backend
- Simple and efficient API for performing calculations
- Supports multiple calculation methods
- Easy to extend and customize

## Requirements

### Frontend
- Node.js (version 14 or higher)
- npm (Node package manager)

### Backend
- Python 3.12 or higher
- pip (Python package installer)

## Installation

### Clone the repository

```bash
git clone https://github.com/satyajitgiram/AI-Calculator
cd AI-Calculator
```

### Frontend Setup

1. Navigate to the Frontend directory:

   ```bash
   cd Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Backend Setup

1. Navigate to the Backend directory:

   ```bash
   cd Backend
   ```

2. Set up a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   - On Windows:

     ```bash
     venv\Scripts\activate
     ```

   - On macOS/Linux:

     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Frontend

1. Start the frontend development server:

   ```bash
   npm run dev
   ```

   The application will be accessible at `http://localhost:5173/` by default.

2. Build for production (optional):

   To create an optimized production build, run:

   ```bash
   npm run build
   ```

   The build artifacts will be stored in the `build` directory.

### Backend

1. Run the backend server:

   After installing the dependencies, you can start the server using:

   ```bash
   python main.py
   ```

   The application will run at `http://127.0.0.1:8900` by default. You can modify the port or host in the `constants.py` file if needed.

## API Integration

The frontend communicates with the backend APIs to perform calculations. Ensure that your backend server is running at `http://127.0.0.1:8900` and update the API endpoints in the frontend code if necessary in the `.env.local` file.

## API Endpoints

Here are some example endpoints available in the backend:

- **GET** `/health` - Check server health status
- **POST** `/calculate` - Perform complex calculations

## Contributing

Contributions are welcome! If you have suggestions or improvements, please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
