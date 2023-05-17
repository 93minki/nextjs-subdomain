import { useState } from "react";

const MobilePage = () => {
  const [click, setClick] = useState(false);

  const buttonClickHandler = () => {
    setClick(!click);
  };

  return (
    <div>
      <h1>This is Mobile Page!</h1>
      <button onClick={buttonClickHandler}>
        {click ? "Clicked!" : "Click Me!"}
      </button>
    </div>
  );
};

export default MobilePage;
