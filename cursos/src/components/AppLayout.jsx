import Header from './Header.jsx';
import Footer from './Footer.jsx';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-12 sm:px-6 lg:px-10">{children}</main>
      <Footer />
    </div>
  );
};

export default AppLayout;
