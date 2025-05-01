# ServiceHub - Professional Services Marketplace

ServiceHub is a modern, full-stack marketplace platform where professionals can offer their services and clients can easily discover and purchase them. Built with React, TypeScript, and Tailwind CSS, it provides a seamless experience for both service providers and customers.

![ServiceHub Screenshot](screenshot.png)

## 🌟 Features

### For Customers
- 🔍 Smart search functionality to find services
- 🛒 Easy-to-use shopping cart
- 💳 Secure payment processing
- 📱 Fully responsive design
- 📖 Order history tracking
- 💬 Direct communication with service providers

### For Service Providers
- 📊 Service management dashboard
- 📈 Real-time stock/availability updates
- 💼 Professional service listings
- 📊 Order management
- 📱 Mobile-friendly interface

## 🚀 Tech Stack

- **Frontend:**
  - React
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
  - React Router DOM

- **Backend:**
  - Supabase (Database & Authentication)
  - RESTful API

- **State Management:**
  - Custom stores
  - React Context

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ServiceHub.git
cd ServiceHub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Database Setup

The application requires the following Supabase tables:

- `services`: Stores service listings
- `orders`: Manages order information
- `settings`: Stores application settings
- `profiles`: User profile information

## 📱 Usage

1. **User Registration/Login:**
   - Create an account or log in using existing credentials
   - Complete your profile information

2. **Browsing Services:**
   - Use the search bar to find specific services
   - Browse categories
   - Filter by various criteria

3. **Purchasing Services:**
   - Add services to cart
   - Review cart contents
   - Complete checkout process

4. **Managing Orders:**
   - View order history
   - Track current orders
   - Contact support if needed

## 🛠️ Development

### Project Structure
```
ServiceHub/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts
│   ├── lib/           # Utility functions and configurations
│   ├── pages/         # Page components
│   ├── stores/        # State management
│   └── utils/         # Helper functions
├── public/            # Static assets
└── ...configuration files
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run test`: Run tests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Lucide Icons](https://lucide.dev/)

## 📞 Support

For support, email support@servicehub.com or join our Telegram support channel. 