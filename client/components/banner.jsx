import React from 'react';

export default function Banner(props) {
  const { message, show } = props;
  const bannerClass = show ? 'banner show' : 'banner';
  return (
    <div className={bannerClass}>
      {message}
    </div>
  );
}
