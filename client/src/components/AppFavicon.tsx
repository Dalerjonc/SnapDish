import React from 'react';
import { Helmet } from 'react-helmet';

const AppFavicon = () => {
  return (
    <Helmet>
      <link rel="icon" href="/snapdish-logo-final.png" />
      <title>SnapDish - Your Smart Cooking Assistant</title>
    </Helmet>
  );
};

export default AppFavicon;