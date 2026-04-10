export interface LoginViewProps {
  onLoginSuccess: (userData: any) => void;
}

export interface LoginForm {
  email: string;
  password: string;
}
