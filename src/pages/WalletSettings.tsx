import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface Wallet {
  id: string;
  network: string;
  address: string;
  label: string;
  is_active: boolean;
}

export function WalletSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [label, setLabel] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadWallet();
  }, [id]);

  const loadWallet = async () => {
    if (!id) return;

    try {
      const { data } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setWallet(data);
        setLabel(data.label);
        setIsActive(data.is_active);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);

    try {
      await supabase
        .from('wallets')
        .update({ label, is_active: isActive })
        .eq('id', id);

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating wallet:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this wallet? This cannot be undone.')) return;
    setDeleting(true);

    try {
      await supabase
        .from('wallets')
        .delete()
        .eq('id', id);

      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting wallet:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Wallet Settings" showBack />
        <div className="px-4 py-6 text-center">
          <p className="text-gray-600">Wallet not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Wallet Settings" showBack />

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Network</div>
            <div className="font-semibold text-gray-900 capitalize">{wallet.network}</div>
            <div className="text-sm font-mono text-gray-600 mt-2 break-all">{wallet.address}</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <Input
              label="Label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Wallet name"
            />
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Monitoring</div>
                <div className="text-sm text-gray-600">
                  {isActive ? 'Active' : 'Paused'}
                </div>
              </div>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  isActive ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button
            fullWidth
            size="lg"
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <div className="flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>{deleting ? 'Deleting...' : 'Delete Wallet'}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
