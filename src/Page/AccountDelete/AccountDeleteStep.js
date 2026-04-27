import React from 'react';
import './AccountDeleteStep.scss';

const AccountDeleteStep = () => {
  return (
    <div className="account-delete-container">
      <h2>How to Delete My Account</h2>
      <p>
        Deleting the account will result in your mobile number, email address, and profile name being deleted from the platform and makes all other attributes related to your Evo account anonymous so it is no longer associated with your phone number.
      </p>
      <p>If you want to delete your account from the Evoapp platform, please follow the steps below:</p>

      <div className="app-steps">
        <h3>iOS / Android App:</h3>
        <ol>
          <li>Log in to your Evo account</li>
          <li>Go To ‘Menu’ on Top Left Corner</li>
          <li>Select ‘Delete My Account’</li>
          <li>Click on ‘Yes to Delete Account’</li>
          <li>Your account deletion will be completed in a maximum of 30 days</li>
        </ol>
      </div>

      <div className="website-steps">
        <h3>Website:</h3>
        <ol>
          <li>Log in to your Evo App account with your phone number, email address, and OTP</li>
          <li>Contact us via available options at the bottom of this page and submit your request</li>
        </ol>
      </div>

      <div className="note">
        <h4>Things to Note Before Deleting Your Account:</h4>
        <ul>
          <li>Account deletion will take a maximum of 30 days.</li>
          <li>Once the account is deleted, you will not be able to recover it.</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountDeleteStep;
