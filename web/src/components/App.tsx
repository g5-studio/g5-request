import RequestContainer from "./RequestContainer";
import { ThemeProvider } from "../contexts/ThemeContext";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="h-full flex justify-start items-start text-left">
        <RequestContainer />
      </div>
    </ThemeProvider>
  );
};

export default App;
