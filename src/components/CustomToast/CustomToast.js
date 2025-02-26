import React from 'react';
import { toast } from 'react-hot-toast';

const CustomToast = ({ message, type }) => {
  

  return (
    <div>
      <button onClick={showCustomToast} style={{ padding: '10px 20px', fontSize: '16px', margin: '5px' }}>
        Afișează Toast {type === 'success' ? 'de Succes' : 'de Eroare'}
      </button>
    </div>
  );
};

export default CustomToast;
