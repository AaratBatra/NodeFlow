# 🌳 NodeFlow - Drag & Drop Tree Manager

NodeFlow is a **powerful hierarchical tree management system** with **drag-and-drop support**. Built using **Next.js, Prisma, and React DnD**, it allows users to manage files and folders **seamlessly** with **server-side logic and zero client-side fetching**.

🎯 **Key Features**
- **👤 Drag & Drop** tree structure with **multi-select & ordering**.
- **🗂️ File & Folder Management** (Create, Edit, Delete).
- **🚀 Server Actions** (No API routes, 100% server-side logic).
- **💼 PostgreSQL & Prisma** for high-performance database management.
- **📂 Optimistic UI** for smooth user experience and drag and drop in tree.
- **⚡ Fast & lightweight** (No heavy dependencies, fully SSR).
- **🎨 Beautiful UI** with ShadCN & Framer Motion animations.

---

## 🔥 **Live Demo**
👉 [**Try NodeFlow Here**](https://your-vercel-deployment-link.vercel.app)  

---

## 🗃️ **Screenshots**
| Drag & Drop Files  | Multi-Select Support  |
|--------------------|----------------------|
| ![Drag & Drop](https://your-image-link.com) | ![Multi-Select](https://your-image-link.com) |

---

## 🛀 **Tech Stack**
- **Frontend**: [Next.js 14](https://nextjs.org/), [React](https://reactjs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
- **UI**: [TailwindCSS](https://tailwindcss.com/), [ShadCN](https://ui.shadcn.com/)
- **Drag & Drop**: [React DnD](https://react-dnd.github.io/) with [Minoru TreeView](https://github.com/minoru/react-dnd-treeview)
- **Hosting**: [Vercel](https://vercel.com/)

---

## 🚀 **Getting Started**
### **1⃣ Clone the Repository**
```sh
git clone https://github.com/AaratBatra/NodeFlow.git
cd NodeFlow
```

### **2⃣ Install Dependencies**
```sh
npm install
```

### **3⃣ Set Up Environment Variables**
Create a `.env` file in the root directory and add:
```env
DATABASE_URL=postgres://your_user:your_password@your_host:5432/your_database
```

### **4⃣ Migrate Database**
```sh
npx prisma migrate deploy
```

### **5⃣ Run the Project**
```sh
npm run dev
```
Now visit `http://localhost:3000` in your browser. 🚀

---

## 🎨 **Features Breakdown**
### **🔹 Drag & Drop with Multi-Select**
- Move **files & folders** within the tree.
- **Multi-select support** for bulk actions.

### **🔹 Optimistic UI for Smooth Interactions**
- Immediate UI updates on actions (edit, delete).
- Rollbacks if server update fails.

### **🔹 Secure & Scalable**
- 100% **server-side logic** (No API calls needed).
- Uses **Next.js Server Actions** for efficient data handling.

---

## 💼 **Contributing**
Contributions are welcome! Feel free to:
- ⭐ Star the repo
- 👀 Open an issue
- 🔧 Submit a pull request

---

## 💬 **Contact & Socials**
- **GitHub**: [@AaratBatra](https://github.com/AaratBatra)
- **LinkedIn**: [Aarat Batra](https://www.linkedin.com/in/aaratbatra/)
- **Instagram**: [@aaratbatra_114](https://x.com/aaratbatra_114)

---

## 🚀 **Show Your Support!**
If you like this project, please **⭐️ star the repo** and **follow me on GitHub!** 💪🏻
