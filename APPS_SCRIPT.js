/*
╔════════════════════════════════════════════════════════════════════════════════╗
║                  TORQUE 2K26 REGISTRATION — GOOGLE APPS SCRIPT                 ║
║                         (Paste into script.google.com)                          ║
╚════════════════════════════════════════════════════════════════════════════════╝

SETUP STEPS:
───────────
1. Go to script.google.com → New Project
2. Name it "Torque 2K26 Registration"
3. Paste this entire file replacing the default code
4. Replace YOUR_SHEET_ID_HERE with your Google Sheet ID
   (Find it in Sheet URL: docs.google.com/spreadsheets/d/SHEET_ID/edit)
5. Replace YOUR_EMAIL with real coordinator emails in coordinatorMap
6. Add all 14 event/workshop names to coordinatorMap with their coordinator emails
7. Deploy → New Deployment → Web App
   • Execute as: Me (your account)
   • Who has access: Anyone
8. Copy the deployment URL (looks like: https://script.google.com/macros/d/...)
9. Paste deployment URL into src/data/data.js → festInfo.appsScriptUrl
10. Test locally with npm run dev before merging to main

GOOGLE SHEET SETUP:
──────────────────
1. Create a new Google Sheet
2. Add one sheet named exactly: MASTER
3. Optionally add a header row (A1:Q1) for readability:
   Timestamp | RegID | Category | Item | Type | Name | Phone | Email | College 
   | RollNo | YearBranch | Amount | PayMethod | TxnID | Status | VerifiedBy | Notes

4. The script will auto-fill columns A through Q:
   A = Timestamp (when registered)
   B = Registration ID (TR Q26-EVT-0001, TRQ26-WRK-0001, etc)
   C = Category (EVENT or WORKSHOP)
   D = Item Name (event/workshop name)
   E = Registration Type (INTERNAL, EXTERNAL, ONSITE)
   F = Participant Name
   G = Phone Number
   H = Email Address
   I = College Name
   J = Roll Number (- if not applicable)
   K = Year — Branch (e.g., "II — CE", or - if not applicable)
   L = Amount Due (in ₹, 0 for internal)
   M = Payment Method (WAIVED, UPI, CASH)
   N = Transaction ID (UTR number for external, - if N/A)
   O = Payment Status (WAIVED, PENDING VERIFICATION, PENDING — COLLECT AT VENUE)
   P = Verified By (for manual verification later)
   Q = Notes (for coordinator notes)

EMAILS:
───────
The script sends two emails automatically:
1. Participant Email: Confirmation with registration ID and next steps
2. Coordinator Email: Alert to event/workshop coordinator (if email configured)

Both emails are auto-generated and sent immediately upon registration.

TROUBLESHOOTING:
────────────────
• Check Apps Script Logs: Extensions → Apps Script → Logs
• Verify SHEET_ID is correct
• Confirm coordinator emails are valid
• Ensure MASTER sheet exists with correct name
• Test with a sample registration in dev mode
• Check spam folder if emails not received
*/

const SHEET_ID = '1JKZpT4sXZBKEl82yUZuJXncLXH_4umj1J-UEUHGk9CU'

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    console.log("Submitting registration for: " + data.name + " (" + (data.registrationId || "NEW") + ")")

    const ss = SpreadsheetApp.openById(SHEET_ID)
    const master = ss.getSheetByName('MASTER')

    if (!master) {
      throw new Error("Sheet tab named 'MASTER' not found. Please create one named 'MASTER' exactly.")
    }

    const lastRow = master.getLastRow()
    const count = String(lastRow).padStart(4, '0')
    const prefix = data.category === 'WORKSHOP' ? 'WRK' : 'EVT'
    const registrationId = data.registrationId ||
      ('TRQ26-' + prefix + '-' + count)

    // Match sheet layout: Timestamp | RegID | Category | Item | Type | Name | Phone | Email | College | RollNo | YearBranch ...
    master.appendRow([
      new Date(),
      registrationId,
      data.category,
      data.itemName,
      data.registrationType,
      data.name,
      data.phone,
      data.email,
      data.college,
      data.rollNo,
      data.branch || data.yearBranch || '-', // Handle both field names for safety
      data.amountDue,
      data.paymentMethod,
      data.transactionId,
      data.paymentStatus,
      '-',
      '-'
    ])

    sendParticipantEmail(data, registrationId)
    sendCoordinatorEmail(data, registrationId)

    return ContentService
      .createTextOutput(JSON.stringify({
        result: 'success',
        registrationId: registrationId
      }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        result: 'error',
        message: err.message
      }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function sendParticipantEmail(data, registrationId) {
  try {
    const statusMessage =
      data.registrationType === 'INTERNAL'
        ? "You're all set! Carry your college ID on the event day."
        : data.registrationType === 'EXTERNAL'
          ? "Your payment is pending verification. A coordinator will confirm via phone before the event. Keep your Transaction ID (" + data.transactionId + ") handy."
          : "Visit the registration desk on the event day and pay ₹" + data.amountDue + " via " + data.paymentMethod + " at the venue."

    const amountText = data.amountDue == 0 ? 'FREE' : '₹' + data.amountDue

    const body =
      "Dear " + data.name + ",\n\n" +
      "Your registration for Torque 2K26 is confirmed!\n\n" +
      "─────────────────────────────\n" +
      "Registration ID : " + registrationId + "\n" +
      data.category + "          : " + data.itemName + "\n" +
      "Type            : " + data.registrationType + "\n" +
      "Amount          : " + amountText + "\n" +
      "─────────────────────────────\n\n" +
      statusMessage + "\n\n" +
      "Event Dates : March 26-27, 2026\n" +
      "Venue       : Dept. of Mechanical Engineering\n" +
      "              UCEK, Kakinada — 533003\n\n" +
      "For queries: torque2k26@gmail.com\n\n" +
      "See you there!\n" +
      "Team Torque 2K26\n" +
      "JNTUK — Dept. of Mechanical Engineering"

    MailApp.sendEmail({
      to: data.email,
      subject: '✅ Registration Confirmed — ' + data.itemName + ' | Torque 2K26',
      body: body
    })
  } catch (err) {
    Logger.log('Participant email failed: ' + err.message)
  }
}

function sendCoordinatorEmail(data, registrationId) {
  try {
    const coordinatorMap = {
      'Chess Monarch': 'torque2025@gmail.com',
      'Project Expo': 'torque2025@gmail.com',
      'Bridge Building': 'torque2025@gmail.com',
      'Lathe Master': 'torque2025@gmail.com',
      'Robo Race': 'torque2025@gmail.com',
      'Design Freak': 'torque2025@gmail.com',
      'Slide Plain': 'torque2025@gmail.com',
      'Casting Crown': 'torque2025@gmail.com',
      'Engine Montage': 'torque2025@gmail.com',
      'Quiz': 'torque2025@gmail.com',
      'Rhythmic Fusion': 'torque2025@gmail.com',
      'Robotics': 'torque2025@gmail.com'
      // Add more events/workshops as needed
    }

    const coordinatorEmail = coordinatorMap[data.itemName]
    if (!coordinatorEmail) return

    MailApp.sendEmail({
      to: coordinatorEmail,
      subject: '[Torque 2K26] New Registration — ' + data.itemName,
      body:
        'New registration received.\n\n' +
        'ID    : ' + registrationId + '\n' +
        'Name  : ' + data.name + '\n' +
        'Phone : ' + data.phone + '\n' +
        'Email : ' + data.email + '\n' +
        'Type  : ' + data.registrationType + '\n' +
        'Amount: ' + (data.amountDue == 0 ? 'FREE' : '₹' + data.amountDue) + '\n' +
        'Status: ' + data.paymentStatus + '\n' +
        (data.transactionId !== '-' ? 'UTR   : ' + data.transactionId + '\n' : '')
    })
  } catch (err) {
    Logger.log('Coordinator email failed: ' + err.message)
  }
}
