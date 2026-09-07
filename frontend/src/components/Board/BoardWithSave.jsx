import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tldraw } from '@tldraw/tldraw';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import '@tldraw/tldraw/tldraw.css';

export default function BoardWithSave() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const saveInterval = useRef(null);

  // Загружаем доску
  useEffect(() => {
    if (!id || !user) {
      navigate('/boards');
      return;
    }

    const loadBoard = async () => {
      try {
        const { data, error } = await supabase
          .from('boards')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          navigate('/boards');
          return;
        }

        setBoard(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [id, user, navigate]);

  // Функция сохранения
  const saveBoard = async () => {
    if (!editorRef.current || !id) return;
    
    try {
      const snapshot = editorRef.current.getSnapshot();
      const { error } = await supabase
        .from('boards')
        .update({
          snapshot: snapshot,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Сохранено');
    } catch (error) {
      console.error('❌ Ошибка:', error);
    }
  };

  // Сохраняем каждые 10 секунд
  useEffect(() => {
    saveInterval.current = setInterval(saveBoard, 10000);
    
    return () => {
      if (saveInterval.current) {
        clearInterval(saveInterval.current);
      }
      // Сохраняем при выходе
      saveBoard();
    };
  }, [id]);

  const handleMount = (editor) => {
    console.log('✅ Editor mounted!');
    editorRef.current = editor;
    
    // Загружаем сохранённое
    if (board?.snapshot) {
      try {
        editor.loadSnapshot(board.snapshot);
        console.log('✅ Загружено');
      } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Доска не найдена</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      {/* Кнопка назад */}
      <button
        onClick={() => navigate('/boards')}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 100,
          background: 'white',
          border: '1px solid #ddd',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        ← Назад
      </button>

      {/* Название доски */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'white',
        padding: '8px 20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        fontWeight: 'bold'
      }}>
        {board.name}
      </div>

      <Tldraw onMount={handleMount} />
    </div>
  );
}