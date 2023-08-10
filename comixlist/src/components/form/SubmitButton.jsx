import React from 'react';
import styles from './SubmitButton.module.css';

function SubmitButton({ text, onSubmit }) {
  return (
    <div>
      <button className={styles.btn} onClick={onSubmit}>
        {text}
      </button>
    </div>
  );
}

export default SubmitButton;
