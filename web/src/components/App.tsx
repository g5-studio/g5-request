import RequestContainer from "./RequestContainer";
import { ThemeProvider } from "../contexts/ThemeContext";
import { I18nProvider } from "../i18n";

const App: React.FC = () => {
  return (
    <I18nProvider>
      <ThemeProvider>
        <div className="h-full flex justify-start items-start text-left">
          <RequestContainer />
        </div>
      </ThemeProvider>
    </I18nProvider>
  );
};

export default App;
