# 🧬 Scientify

**The intelligent platform to manage your scientific publications** 📚✨

Scientify is a modern web application that allows you to organize, catalog, and easily search your scientific publications. With advanced automatic document processing features and an intuitive interface, making the management of your scientific library a pleasant experience!

---

## 🚀 Main Features

### 📤 **Smart Upload**
- **Multi-format upload**: PDF, DOCX, LaTeX - everything gets automatically converted to PDF
- **Automatic metadata extraction**: from BibTeX files or manual compilation
- **Document conversion**: Advanced DOCX support with Pandoc and Mammoth

### 🔍 **Advanced Search**
- **Keyword search**: Quickly find the publications you need
- **Smart filters**: By author, year, journal, DOI
- **Flexible sorting**: By date, title, relevance

### 🤖 **NLP & Keyword Extraction**
- **Automatic keyword extraction**: Natural Language Processing algorithms automatically analyze your documents
- **Smart categorization**: Publications are automatically organized by topic
- **Advanced tagging**: Label system for precise cataloging

### 👥 **User Management**
- **Secure registration and authentication**: Complete account management system
- **Personal library**: Each user has access to their own private collection
- **Granular permissions**: Complete control over your documents

### 📊 **Modern Interface**
- **Responsive design**: Works perfectly on desktop, tablet, and mobile
- **Intuitive UI/UX**: Simple and pleasant navigation
- **Material-UI components**: Modern and accessible design

---

## 🛠️ Tech Stack

### Frontend 🎨
- **React 18**: Modern framework for reactive UIs
- **Material-UI**: Elegant and accessible components
- **Tanstack Query**: Optimized state management and caching
- **JavaScript ES6+**: Modern and performant code

### Backend ⚡
- **FastAPI**: High-performance Python framework
- **SQLAlchemy**: Robust ORM for database management
- **PostgreSQL**: Scalable relational database
- **Async/Await**: Asynchronous programming for maximum performance

### AI & NLP 🧠
- **Keyword Extraction**: Intelligent extraction using YAKE

---

## 🐳 Setup & Installation

Scientify supports two deployment modes: **Docker** (recommended) and **manual setup**.

### 🚢 Docker (Easiest way!)

```bash
# Clone the repository
git clone https://github.com/fccapria/scientify.git
cd scientify

# Start everything with Docker Compose
docker-compose up -d

# Your app will be available at http://localhost:80
```

### 🔧 Manual Setup

#### Backend (Python + FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure database and environment variables
cp .env.example .env
# Edit .env with your configurations

# Start the server
uvicorn app.main:app --reload
```

#### Frontend (React)
```bash
cd frontend

# Install dependencies with pnpm (faster!)
pnpm install
# Or with npm: npm install

# Start the dev server
pnpm start
# Or: npm start
```

---

## 🎯 How It Works

1. **📝 Register** and create your personal account
2. **📤 Upload** your publications (PDF, DOCX, LaTeX)
3. **📋 Add metadata** manually or upload a BibTeX file
4. **🤖 Let the AI** automatically extract keywords
5. **🔍 Search and organize** your scientific library
6. **📊 Monitor** your collection with advanced statistics

---

## 🌟 Roadmap

- [ ] 📱 Native mobile app
- [ ] 🔗 Integration with arXiv and PubMed  
- [ ] 📈 Advanced analytics and citation metrics
- [ ] 🤝 Collaboration and sharing between users
- [ ] 🌐 Public API for integrations
- [ ] 📧 Email notifications for new publications

---

## 🤝 Contributing

We'd love your help to make Scientify even better! 

1. 🍴 **Fork** the project
2. 🌿 **Create** a branch for your feature (`git checkout -b feature/new-feature`)
3. ✨ **Commit** your changes (`git commit -m 'Add new feature'`)
4. 📤 **Push** to the branch (`git push origin feature/new-feature`)
5. 🔀 **Open** a Pull Request

---

## 📄 License

This project is released under the MIT license. See the `LICENSE` file for details.

---

## 🚨 Support

Having problems or suggestions? 

- 🐛 [Open an Issue](https://github.com/fccapria/scientify/issues)
- 💬 [Discussions](https://github.com/fccapria/scientify/discussions)
- 📧 Email: [francesco@capria.eu]

---

<div align="center">

**Created with ❤️ by [@fccapria](https://github.com/fccapria)**

</div>

---
---
