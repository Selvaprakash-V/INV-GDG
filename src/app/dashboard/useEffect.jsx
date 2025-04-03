import { useEffect, useState } from "react";

const MyComponent = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      {isClient && <p>This runs only on the client-side.</p>}
    </div>
  );
};

export default MyComponent;
