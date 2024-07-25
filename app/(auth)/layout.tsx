import React, { FC } from "react";

interface layoutProps {
  children: React.ReactNode;
}

const layout: FC<layoutProps> = ({ children }) => {
  return (
    <>
      <div className="flex h-[100vh] items-center justify-center">
        {children}
      </div>
    </>
  );
};

export default layout;
