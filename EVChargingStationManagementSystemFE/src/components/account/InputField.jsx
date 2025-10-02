import { useState } from "react"
const InputField = ({ type, placeholder, icon, name, value, onChange }) => {
  //State no toggle password visibility
  const [isPasswordShown, setIsPasswordShow] = useState(false);

  return (
    <div className="input-wrapper">
      <input name={name} value={value} onChange={onChange} type={isPasswordShown ? 'text' : type} placeholder={placeholder} className="input-field" required />
      <i className="material-symbols-rounded">{icon}</i>
      {type === 'password' && (
        <i onClick={() => setIsPasswordShow(prevState => !prevState)} className="material-symbols-rounded eye-icon">
          {isPasswordShown ? 'visibility' : 'visibility_off'}
        </i>
      )}
    </div>
  )
}

export default InputField
