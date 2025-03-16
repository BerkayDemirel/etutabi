@echo off
echo Setting up EtutAI by HercAI...

REM Check if .env.local exists, if not create it from example
if not exist .env.local (
  if exist .env.example (
    copy .env.example .env.local
    echo Created .env.local from .env.example
    echo Please edit .env.local to add your OpenAI API key
  ) else (
    echo Error: .env.example not found
    exit /b 1
  )
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Build the application
echo Building the application...
call npm run build

echo Setup complete! You can now run the application with:
echo npm start
echo.
echo Or for development:
echo npm run dev 