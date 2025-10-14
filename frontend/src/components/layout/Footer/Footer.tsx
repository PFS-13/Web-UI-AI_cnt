import React from 'react';
import styles from './Footer.module.css';

export interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const footerClasses = [
    styles.footer,
    className,
  ].filter(Boolean).join(' ');

  return (
    <footer className={footerClasses}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🤖</span>
              <span className={styles.logoText}>Web-UI-AI</span>
            </div>
            <p className={styles.description}>
              A modern ChatGPT-like application built with React and TypeScript.
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h3 className={styles.linkTitle}>Product</h3>
              <ul className={styles.linkList}>
                <li><a href="/chat" className={styles.link}>Chat</a></li>
                <li><a href="/conversations" className={styles.link}>History</a></li>
                <li><a href="/" className={styles.link}>Dashboard</a></li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h3 className={styles.linkTitle}>Support</h3>
              <ul className={styles.linkList}>
                <li><a href="#" className={styles.link}>Help Center</a></li>
                <li><a href="#" className={styles.link}>Documentation</a></li>
                <li><a href="#" className={styles.link}>Contact</a></li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h3 className={styles.linkTitle}>Company</h3>
              <ul className={styles.linkList}>
                <li><a href="#" className={styles.link}>About</a></li>
                <li><a href="#" className={styles.link}>Privacy</a></li>
                <li><a href="#" className={styles.link}>Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.copyright}>
            <p>&copy; {currentYear} Web-UI-AI. All rights reserved.</p>
          </div>
          <div className={styles.social}>
            <a href="#" className={styles.socialLink} aria-label="GitHub">
              <span>🐙</span>
            </a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <span>🐦</span>
            </a>
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">
              <span>💼</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
