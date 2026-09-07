import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function BoardList() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    if (user) {
      loadBoards();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBoards = async () => {
    try {
      // Простой запрос - только доски пользователя
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки досок:', error);
        setBoards([]);
      } else {
        console.log('Загружено досок:', data?.length || 0);
        setBoards(data || []);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!user || !newBoardName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('boards')
        .insert({
          name: newBoardName,
          owner_id: user.id,
          is_public: true,
        })
        .select()
        .single();

      if (error) throw error;
      
      setBoards([data, ...boards]);
      setShowCreate(false);
      setNewBoardName('');
      navigate(`/board/${data.id}`);
    } catch (error) {
      console.error('Ошибка создания доски:', error);
      alert('Не удалось создать доску: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка досок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🎨 Доски друзей
            </h1>
            <p className="text-gray-600 mt-1">
              {boards.length} досок
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition"
            >
              <span className="text-xl">+</span>
              Создать доску
            </button>
            <button
              onClick={signOut}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl shadow-lg transition"
            >
              Выйти
            </button>
          </div>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 text-lg">
              У вас пока нет досок. Создайте первую!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer p-6 border border-gray-100 hover:border-blue-300"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {board.name}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span>{board.is_public ? '🌍 Публичная' : '🔒 Приватная'}</span>
                  <span>•</span>
                  <span>
                    {new Date(board.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Создать доску</h2>
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Название доски"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createBoard}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
              >
                Создать
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}