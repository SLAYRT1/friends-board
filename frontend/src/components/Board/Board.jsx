import { useEffect, useRef, useState } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '@tldraw/tldraw/tldraw.css';

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [boardName, setBoardName] = useState('Доска');
  const [loading, setLoading] = useState(true);

  // Загружаем название доски
  useEffect(() => {
    if (!id) return;

    const loadBoard = async () => {
      try {
        const { data, error } = await supabase
          .from('boards')
          .select('name, snapshot')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setBoardName(data.name);
          // Загружаем снэпшот если есть
          if (data.snapshot && editorRef.current) {
            try {
              editorRef.current.loadSnapshot(data.snapshot);
            } catch (e) {
              console.error('Ошибка загрузки:', e);
            }
          }
        }
      } catch (err) {
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [id]);

  // Сохраняем каждые 5 секунд (без уведомлений)
  useEffect(() => {
    if (!id) return;

    const interval = setInterval(() => {
      if (editorRef.current) {
        try {
          const snapshot = editorRef.current.getSnapshot();
          supabase
            .from('boards')
            .update({ 
              snapshot: snapshot,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('Ошибка сохранения:', error);
            });
        } catch (err) {
          console.error('Ошибка:', err);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  // Сохраняем при выходе
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editorRef.current) {
        const snapshot = editorRef.current.getSnapshot();
        supabase
          .from('boards')
          .update({ snapshot })
          .eq('id', id)
          .then(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [id]);

  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Загрузка доски...
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'fixed', 
      top: 0, 
      left: 0,
      background: '#ffffff'
    }}>
      {/* Кнопка назад */}
      <button
        onClick={() => navigate('/boards')}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
          background: 'white',
          border: '1px solid #e2e8f0',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '14px',
          fontWeight: '500'
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
        zIndex: 1000,
        background: 'white',
        padding: '8px 20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        fontSize: '16px',
        fontWeight: '600'
      }}>
        {boardName}
      </div>

      <Tldraw onMount={handleMount} />
    </div>
  );
}