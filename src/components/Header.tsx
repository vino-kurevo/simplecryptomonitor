import { ArrowLeft, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
}

export function Header({ title, showBack = false, showMenu = false }: HeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
            {!title && !showBack && (
              <span className="text-xl font-bold text-blue-600">SimpleCryptoMonitor</span>
            )}
          </div>

          {showMenu && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
            <span className="text-lg font-semibold">Menu</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <button
              onClick={() => {
                navigate('/dashboard');
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                navigate('/notifications');
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Notifications
            </button>
            <button
              onClick={() => {
                navigate('/billing');
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Billing
            </button>
            <button
              onClick={() => {
                navigate('/faq');
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => {
                navigate('/support');
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Support
            </button>
            <button
              onClick={async () => {
                await signOut();
                setMenuOpen(false);
                navigate('/');
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            >
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
