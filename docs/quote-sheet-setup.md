# Quote Tracking — Google Sheet Setup

This guide sets up a Google Sheet that automatically receives all quote requests from the website. You can view, filter, and download this sheet as Excel anytime.

---

## Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it: **"ASM AUTO Repair — Quote Requests"**
3. In Row 1, add these column headers:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Name | Mobile | Email | Work Type | Car Brand | Model | Year | Preferred Date | Preferred Time |

---

## Step 2: Create the Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code and paste this:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    data.timestamp,
    data.name,
    data.mobile,
    data.email,
    data.workType,
    data.carBrand,
    data.modelName,
    data.modelYear,
    data.preferredDate,
    data.preferredTime
  ]);
  
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'success' })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Save** (name the project "Quote Webhook")

---

## Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Select type: **Web app**
3. Settings:
   - Description: "Quote request logger"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. **Copy the Web App URL** — it looks like: `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 4: Add the URL to Netlify

1. In your Netlify Dashboard → **Site settings → Environment variables**
2. Add: `GOOGLE_SHEET_WEBHOOK_URL` = the URL you copied in Step 3
3. Trigger a redeploy (or it'll take effect on the next deploy)

---

## Step 5: Test It

1. Submit a quote request on your website
2. Check the Google Sheet — a new row should appear within seconds

---

## Viewing & Exporting

- **View online:** Open the Google Sheet anytime at sheets.google.com
- **Download as Excel:** File → Download → Microsoft Excel (.xlsx)
- **Filter:** Use Google Sheets' built-in filter feature to sort by date, work type, etc.
- **Share:** Share the sheet with your uncle's Google account so he can see quotes on his phone

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No rows appearing | Check the GOOGLE_SHEET_WEBHOOK_URL env var is set correctly in Netlify |
| Permission error | Re-deploy the Apps Script with "Anyone" access |
| Data in wrong columns | Ensure the header row matches the column order above |
