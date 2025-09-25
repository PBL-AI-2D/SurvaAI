export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isOTPValid = (user, otp) => {
  if (!user.email_confirmation_sent_at) return false;
  
  const expiryTime = new Date(user.email_confirmation_sent_at);
  expiryTime.setMinutes(expiryTime.getMinutes() + 3);
  
  return (
    user.email_confirmation_token === otp && 
    new Date() <= expiryTime
  );
};
