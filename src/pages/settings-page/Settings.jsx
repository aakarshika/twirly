import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfileSettings from './tabs/ProfileSettings';
import AppearanceSettings from './tabs/AppearanceSettings';
import BillingSettings from './tabs/BillingSettings';
import SecuritySettings from './tabs/SecuritySettings';
import LanguageSettings from './tabs/LanguageSettings';
import HelpSettings from './tabs/HelpSettings';

const Settings = () => {

  return (
    <div className="max-w-screen-lg mx-auto flex flex-col pt-10" style={{
      position: 'relative',
    }}>
      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="appearance" element={<AppearanceSettings />} />
              <Route path="billing" element={<BillingSettings />} />
              <Route path="security" element={<SecuritySettings />} />
              <Route path="language" element={<LanguageSettings />} />
              <Route path="help" element={<HelpSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
