export interface Response {
  status: string;
  message: string;
}

export interface RegisterResponse extends Response {
  data: {
    email: string;
    register_token: string;
  };
}

export interface LoginResponse extends Response {
  data: {
    accessToken: string;
  };
}

export interface RefreshTokenResponse extends Response {
  data: {
    accessToken: string;
  };
}

export interface EmailRegisterPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface CompleteAccountPayload {
  register_token: string;
  password: string;
  nama: string;
  profil_responden?: Record<string, any>;
  profil_klien?: Record<string, any>;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me: boolean;
}
