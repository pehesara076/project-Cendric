# Cendric — Quick Start

## 1. Fill in environment variables

Edit `server/.env`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/cendric?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string
GEMINI_API_KEY=your_gemini_api_key
```

## 2. Start the backend

```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

## 3. Start the frontend

```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## 4. Use the app

1. Register or login
2. Ask questions in Chat Assistant (e.g. "What's my balance?")
3. Tap 📎 to upload a receipt image → review extracted data → Confirm
4. View all transactions in the Transactions tab
5. Edit/delete transactions as needed
