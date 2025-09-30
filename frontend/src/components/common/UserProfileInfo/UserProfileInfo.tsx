import React from 'react';
import { getUserProfile } from '../../../utils/userProfile';
import styles from './UserProfileInfo.module.css';

interface UserProfileInfoProps {
  className?: string;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ className }) => {
  const userProfile = getUserProfile();

  if (!userProfile) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Profile Information</h3>
      </div>
      
      <div className={styles.content}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Full Name:</span>
          <span className={styles.value}>{userProfile.fullName}</span>
        </div>
        
        <div className={styles.infoItem}>
          <span className={styles.label}>Profile Completed:</span>
          <span className={styles.value}>
            {formatDate(userProfile.completedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
