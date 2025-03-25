export class EmailHelper {
  /**
   * Formats an email address to lowercase.
   *
   * @param {string} email - The email address to format.
   * @returns {string} - The formatted email address in lowercase.
   */
  static format(email: string): string {
    return email.toLowerCase();
  }

  /**
   * Checks if an email address is a valid work email.
   *
   * Valid work emails are those that have domains not included in common free email domains like Gmail, Yahoo, etc.
   *
   * @param {string} email - The email address to validate.
   * @returns {boolean} - True if the email is a valid work email, otherwise false.
   */
  static isValidWorkEmail(email: string): boolean {
    // Convert the email to lowercase for consistent comparison
    email = email.toLowerCase();

    // List of common free email domains
    const freeEmailDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'aol.com',
    ];

    // Regular expression pattern to validate email format
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Check if the email format matches the regex pattern
    if (!regex.test(email)) {
      return false;
    }

    // Extract the domain from the email address
    const domain = email.split('@')[1];

    // Check if the domain is not in the list of free email domains
    return !freeEmailDomains.includes(domain);
  }
}
