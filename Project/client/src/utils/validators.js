/**
 * Validate email address
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate password strength
 * Minimum 8 chars, at least one uppercase, one lowercase, one number
 */
export function isStrongPassword(password) {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
}

/**
 * Validate that a required field is not empty
 */
export function isRequired(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  return value != null;
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone) {
  const re = /^\+?[\d\s-]{7,15}$/;
  return re.test(phone);
}

/**
 * Validate price is a positive number
 */
export function isValidPrice(price) {
  const num = Number(price);
  return !isNaN(num) && num >= 0;
}

/**
 * Validate form fields and return errors object
 */
export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!isRequired(email)) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Invalid email address';
  if (!isRequired(password)) errors.password = 'Password is required';
  return errors;
}

export function validateRegisterForm({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!isRequired(name)) errors.name = 'Name is required';
  if (!isRequired(email)) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Invalid email address';
  if (!isRequired(password)) errors.password = 'Password is required';
  else if (!isStrongPassword(password))
    errors.password = 'Password must be 8+ chars with uppercase, lowercase, and number';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function validateItemForm({ title, description, category, transactionType }) {
  const errors = {};
  if (!isRequired(title)) errors.title = 'Title is required';
  if (!isRequired(description)) errors.description = 'Description is required';
  if (!isRequired(category)) errors.category = 'Category is required';
  if (!isRequired(transactionType)) errors.transactionType = 'Transaction type is required';
  return errors;
}
