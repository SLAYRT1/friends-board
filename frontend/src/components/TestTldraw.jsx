import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

export default function TestTldraw() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'fixed', 
      top: 0, 
      left: 0,
      backgroundColor: '#ffffff'
    }}>
      <Tldraw />
    </div>
  );
}