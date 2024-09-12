export const validateMobile = (mobile) => {
    const mobilePattern = /^[+91]?\d{10}$/;
    if (mobile && !mobilePattern.test(mobile)) {
        return "Invalid mobile number.";
    }
    return null;
};
