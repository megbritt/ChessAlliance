import React from 'react';

export default function SideSelectButton(props) {
  const { type, side, handleSelect } = props;
  const selectButton = `side-select ${type.toLowerCase()}${side === type ? ' selected' : ''}`;
  return (
    <button type="button" className={selectButton} onClick={handleSelect}>
      {type}
    </button>
  );
}
