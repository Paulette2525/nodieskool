import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to community page as the main entry point
  return <Navigate to="/community" replace />;
};

export default Index;
