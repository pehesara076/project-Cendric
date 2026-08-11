# Intelligent Freelance Financial & Compliance Auditor

Project Proposal : [PROJECT.PROPOSAL.pdf](https://github.com/user-attachments/files/30942381/PROJECT.PROPOSAL.pdf)


An intelligent full-stack web application designed to help modern digital freelancers **manage, visualize, and analyze their financial activities** while providing a context-aware AI assistant for **localized financial and compliance guidance**.

The system is built using the **MERN Stack** and integrates **LangChain.js, MongoDB Vector Search, and Retrieval-Augmented Generation (RAG)** to connect financial analytics with verified regulatory knowledge.

---

## 🚀 Project Overview

Digital freelancers often manage income from multiple platforms such as **Fiverr, Upwork, and direct clients**, while also dealing with expenses, invoices, taxation, and financial compliance.

This project provides a centralized platform where freelancers can:

* 📊 Track income and expenses
* 💰 Monitor sales and financial performance
* 📈 Visualize income, expenses, and profit margins
* 🤖 Interact with an AI financial assistant
* 📚 Ask compliance-related questions
* 🔎 Retrieve information from localized regulatory documents
* 🔐 Keep financial information isolated and protected

The system combines a **Sales & Financial Analysis Dashboard** with an AI-powered **Compliance Auditor**.

---

## 🎯 Objectives

The main objective is to develop an intelligent platform that transforms raw financial records into useful insights while providing AI-assisted compliance guidance.

### Key Objectives

* Build a centralized freelance financial management system
* Provide real-time financial analytics
* Generate actionable insights from transaction data
* Integrate a conversational AI assistant
* Reduce AI hallucinations using RAG
* Provide localized regulatory information
* Maintain strong user data isolation and privacy
* Provide fast AI responses

---

## 🧠 AI Integration

The project uses **LangChain.js** to orchestrate the conversational AI system.

The AI assistant is enhanced with a **Retrieval-Augmented Generation (RAG)** pipeline using **MongoDB Vector Search**.

Regulatory documents such as:

* Official legal gazettes
* Inland Revenue Department (IRD) tax legislation
* Central Bank regulations

are semantically indexed and stored as knowledge chunks with embeddings.

When a user asks a compliance-related question, the system retrieves relevant information from the knowledge base and provides it to the AI model as context.

### RAG Flow

```text
User Question
      ↓
AI Assistant
      ↓
LangChain.js
      ↓
MongoDB Vector Search
      ↓
Relevant Regulatory Documents
      ↓
Context + User Financial Data
      ↓
LLM
      ↓
Context-Aware Response
```

---

## ❗ Problems Addressed

### 1. Static Analytics vs Actionable Insights

Traditional bookkeeping systems often provide numerical records and charts without explaining what those numbers mean.

This system uses AI to transform financial data into **narrative summaries and actionable insights**.

### 2. LLM Hallucinations

General-purpose LLMs may provide incorrect answers when dealing with complex local regulations.

The project addresses this problem by grounding the AI assistant using a **domain-specific RAG knowledge base** containing localized regulatory information.

### 3. Context Fragmentation

Financial applications and AI assistants often operate separately.

This project combines:

* User transaction history
* Financial analytics
* Conversational memory
* Regulatory knowledge

into a unified AI context.

---

## ✨ Features

### 👤 User Management

* User registration
* Secure login
* Password hashing
* Persistent session states

### 💵 Sales Ledger

* Add financial transactions
* Record income
* Record expenses
* Track project invoices
* Categorize transactions
* Track platform sources

Supported platform sources include:

* Fiverr
* Upwork
* Direct clients

### 📊 Financial Dashboard

The dashboard provides visual analytics for:

* Income
* Expenses
* Net profit
* Platform distribution
* Financial trends

React charting components are used to render the visual analytics.

### 🤖 AI Assistant

The conversational interface allows users to interact with their financial data through natural language.

The AI assistant can use:

* User transaction information
* Financial metrics
* Retrieved regulatory knowledge

to generate context-rich responses.

### 📚 RAG Compliance System

The compliance system retrieves relevant information from localized legal and regulatory documents stored using vector embeddings.

This allows the AI assistant to answer regulatory questions using retrieved domain-specific context.

---

## 🗃️ Database Design

The system contains the following main entities:

### User

```text
UserID
FullName
Email
PasswordHash
CurrencyPreference
CreatedAt
```

### Transaction / Sale

```text
InvoiceID
UserID
Type
Amount
PlatformSource
Date
Category
Description
```

### ChatSession

```text
SessionID
UserID
StartedAt
```

### KnowledgeChunk

```text
ChunkID
SourceDocument
TextContent
EmbeddingVector
```

The proposal defines a **one-to-many relationship** between users and their transactions, and between users and chat sessions.

---

## ⚙️ Functional Requirements

* 🔐 User registration and authentication
* 💳 Sales and expense management
* 🧾 Invoice and transaction tracking
* 📊 Interactive financial dashboards
* 💬 Conversational AI interface
* 📚 RAG-based compliance queries
* 🔎 Regulatory document retrieval
* 📈 Real-time financial visualization

---

## 🔒 Non-Functional Requirements

### Deterministic Accuracy

The AI assistant should restrict compliance responses to information available within the verified RAG knowledge base to reduce hallucinations.

### Data Isolation & Privacy

User financial information must remain isolated to prevent unauthorized exposure of proprietary financial data.

### System Performance

The complete AI operational round-trip, including vector search, context construction, and LLM inference, is targeted to complete in **less than 2.5 seconds**.

---

## 🛠️ Technology Stack

| Layer            | Technology             |
| ---------------- | ---------------------- |
| Frontend         | React.js + Vite        |
| Styling          | Tailwind CSS           |
| Charts           | Recharts               |
| Backend          | Node.js + Express.js   |
| Database         | MongoDB Atlas          |
| Vector Search    | MongoDB Vector Search  |
| AI Orchestration | LangChain.js           |
| LLM              | OpenAI / Google Gemini |
| Version Control  | Git + GitHub           |

The technology stack follows the architecture specified in the project proposal.

---

## 🏗️ High-Level Architecture

```text
                    ┌─────────────────────┐
                    │      Freelancer     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │       + Vite        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Express / Node.js │
                    │      REST API       │
                    └───────┬───────┬─────┘
                            │       │
                  ┌─────────┘       └─────────┐
                  ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │  MongoDB Atlas  │         │   LangChain.js  │
        │                 │         │   AI Engine     │
        │ Transactions    │         └────────┬────────┘
        │ Users           │                  │
        │ Chat Sessions   │                  ▼
        │ Knowledge       │         ┌─────────────────┐
        │ Embeddings      │         │ MongoDB Vector  │
        └─────────────────┘         │     Search      │
                                    └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ OpenAI / Gemini │
                                    └─────────────────┘
```

---

## 🔄 How the System Works

### Financial Analysis

```text
Freelancer
    ↓
Enter Income / Expenses
    ↓
MongoDB
    ↓
Financial Calculations
    ↓
React Dashboard
    ↓
Charts & Financial Insights
```

### Compliance Question

```text
User asks a question
        ↓
AI Assistant
        ↓
LangChain.js
        ↓
Create Vector Query
        ↓
MongoDB Vector Search
        ↓
Retrieve Relevant Legal Knowledge
        ↓
Build Context
        ↓
LLM
        ↓
Compliance Response
```

---

## 🔐 Security & Privacy

The system is designed with data isolation as an important requirement.

Each user's financial information should be associated with their user account, preventing unauthorized access to another user's transactions.

The proposal also emphasizes preventing leakage of proprietary financial information to external APIs.

---

## 📁 Suggested Project Structure

```text
project-Cendric/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── services/
│
├── ai/
│   ├── chains/
│   ├── embeddings/
│   ├── retrieval/
│   └── prompts/
│
├── knowledge/
│   └── regulatory-documents/
│
├── README.md
└── package.json
```

> **Note:** The proposal specifies the technology architecture but does not provide a finalized repository structure. The structure above is therefore a suggested organization, not a structure stated in the proposal.

---

## 🎯 Expected Outcome

The final system aims to move beyond a basic freelancer sales dashboard by integrating an AI-powered, RAG-grounded compliance layer.

Instead of functioning only as a financial tracking application, the system is designed to become an intelligent assistant that connects **financial analytics, user transaction data, and verified local regulatory knowledge**.

---

## 📌 Project Information

**Project:** Intelligent Freelance Financial & Compliance Auditor

**Architecture:** MERN + RAG

**AI:** LangChain.js + OpenAI / Google Gemini

**Database:** MongoDB Atlas + Vector Search

**Frontend:** React.js + Vite + Tailwind CSS

**Backend:** Node.js + Express.js

**Version Control:** GitHub

---

## 🔗 Repository

[GitHub Repository](https://github.com/pehesara076/project-Cendric.git)

---

## 📄 Project Proposal

This README is based on the **Intelligent Freelance Financial & Compliance Auditor Project Proposal**.

---

## 👨‍💻 Project Vision

> **Transform freelance financial management from simple record keeping into intelligent, context-aware financial and compliance assistance.**

The project aims to ensure that AI is not merely an additional interface, but an essential component grounded in verified local regulatory knowledge.
