// @ts-ignore
import React, { FC, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { hideNotification } from '../../store/slices/uiSlice';
import Notification from './Notification';

/**
 * Global notification component that uses Redux for state management
 */
const GlobalNotification: FC = () => {
  const dispatch = useAppDispatch();
  const { notification } = useAppSelector(state => state.ui);
  
  const handleClose = () => {
    dispatch(hideNotification());
  };
  
  return (
    <Notification
      message={notification.message}
      type={notification.type}
      show={notification.show}
      onClose={handleClose}
    />
  );
};

export default GlobalNotification; 