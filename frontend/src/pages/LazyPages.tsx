import { lazy } from 'react';

// Lazy load auth pages
export const Login = lazy(() => import('./auth/Login'));
export const Register = lazy(() => import('./auth/Register'));
export const Verification = lazy(() => import('./auth/Verification'));
export const AuthCallback = lazy(() => import('./auth/AuthCallback'));
export const TellUsAboutYou = lazy(() => import('./auth/TellUsAboutYou'));
export const ResetPassword = lazy(() => import('./auth/ResetPassword'));
export const InputPassword = lazy(() => import('./auth/InputPassword'));
export const NewPassword = lazy(() => import('./auth/NewPassword'));

// Lazy load chat pages
export const ChatPage = lazy(() => import('./ChatPage'));
export const ConversationHistory = lazy(() => import('./chat/ConversationHistory'));

// Lazy load other pages
export const RootPage = lazy(() => import('./RootPage'));
export const HomePage = lazy(() => import('./HomePage/HomePage'));
