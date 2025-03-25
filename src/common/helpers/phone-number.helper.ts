export class PhoneNumberHelper {
  /**
   * Formats a phone number based on country code and specific rules.
   *
   * @param {string} phoneNumber - The phone number to format.
   * @param {string} countryCode - The country code to prepend to the phone number.
   * @returns {string} - The formatted phone number.
   */
  static format(phoneNumber: string, countryCode: string): string {
    // Remove any leading plus sign (+) from the phone number
    phoneNumber = phoneNumber.replace('+', '');

    // Check if the phone number starts with '2340' (Nigeria country code)
    if (phoneNumber.startsWith('2340')) {
      // Return the formatted phone number with the country code and without the '2340' prefix
      return `${countryCode}${phoneNumber.slice(4)}`;
    }

    // Check if the phone number starts with '0' (common prefix in some countries)
    if (phoneNumber.startsWith('0')) {
      // Return the formatted phone number with the country code and without the '0' prefix
      return `${countryCode}${phoneNumber.slice(1)}`;
    }

    // If no specific rule matches, return the original phone number
    return phoneNumber;
  }
}
