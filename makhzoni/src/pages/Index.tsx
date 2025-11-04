import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return <Login />;
};

export default Index;
