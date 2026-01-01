import React, { useId } from 'react'


const Input = ({ label, type = "text", className = "", ...props }) => {
    const id = useId()


  return (
    <div>
      {label && (
        <label htmlFor={id}>
          {label}
        </label>
          )}
          <input id={id} type={type} className={className} {...props} />
    </div>
  );
}

export default Input
