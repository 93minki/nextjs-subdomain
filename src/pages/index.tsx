import { useState } from "react";

const Home = () => {
  const [count, setCount] = useState(0);
  const buttonClickHandler = () => {
    setCount(count + 1);
  };
  return (
    <div>
      <div>Vercel Deploy Version</div>
      <h1>This is PC/Tablet Page!</h1>
      <button onClick={buttonClickHandler}>Count Up! {count}</button>
    </div>
  );
};

export default Home;
