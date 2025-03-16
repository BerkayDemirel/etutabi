// Script to reset the hints database
const fs = require('fs');
const path = require('path');

// Path to the hints database file
const HINTS_DB_PATH = path.join(process.cwd(), 'src', 'data', 'hints.json');

function resetHintsDatabase() {
  try {
    // Check if the file exists
    if (fs.existsSync(HINTS_DB_PATH)) {
      // Delete the file
      fs.unlinkSync(HINTS_DB_PATH);
      console.log(`Hints database deleted: ${HINTS_DB_PATH}`);
    } else {
      console.log(`Hints database not found at: ${HINTS_DB_PATH}`);
    }
    
    // Create an empty database
    fs.writeFileSync(HINTS_DB_PATH, JSON.stringify({}, null, 2), { encoding: 'utf8' });
    console.log(`Empty hints database created at: ${HINTS_DB_PATH}`);
    
    return true;
  } catch (error) {
    console.error('Error resetting hints database:', error);
    return false;
  }
}

// Run the reset function
const success = resetHintsDatabase();
console.log(`Hints database reset ${success ? 'successful' : 'failed'}.`); 