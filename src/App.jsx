import { ThemeProvider } from "styled-components";
import {
  AuthContextProvider,
  GlobalStyles,
  MyRoutes,
  useThemeStore,
} from "./index";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
function App() {
  const { themeStyle } = useThemeStore();
 
  return (
    <ThemeProvider theme={themeStyle}>
      <AuthContextProvider>
        <GlobalStyles />
       <MyRoutes/>

        <ReactQueryDevtools initialIsOpen={true} />
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default App;
